import { useState, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import FileUpload from './components/FileUpload';
import ManualEntry from './components/ManualEntry';
import FilterControls from './components/FilterControls';
import TransactionTable from './components/TransactionTable';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import EditTransactionModal from './components/EditTransactionModal';
import BackupRestore from './components/BackupRestore';
import SearchBar from './components/SearchBar';
import { processVISACSV, processAMEXExcel, processROGERSCSV, readFileAsText, readFileAsBuffer } from './utils/fileProcessors';
import { exportToPdf } from './utils/pdfExport';
import { exportToExcel } from './utils/csvExport';
import { ALL_AUDIENCE, calculatePersonTotals, filterTransactionsByAudience } from './utils/transactionPeople';

function App() {
    // Transaction state with localStorage persistence
    const [visaTransactions, setVisaTransactions] = useLocalStorage('visa_transactions', []);
    const [amexTransactions, setAmexTransactions] = useLocalStorage('amex_transactions', []);
    const [rogersTransactions, setRogersTransactions] = useLocalStorage('rogers_transactions', []);
    const [manualTransactions, setManualTransactions] = useLocalStorage('manual_transactions', []);

    // Filter state with localStorage persistence
    const [visaFilter, setVisaFilter] = useLocalStorage('visa_filter', { startDate: '', endDate: '' });
    const [amexFilter, setAmexFilter] = useLocalStorage('amex_filter', { startDate: '', endDate: '' });
    const [rogersFilter, setRogersFilter] = useLocalStorage('rogers_filter', { startDate: '', endDate: '' });
    const [exportAudience, setExportAudience] = useLocalStorage('export_audience', ALL_AUDIENCE);

    // Loading state
    const [isLoading, setIsLoading] = useState(false);

    // Edit modal state
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [editingType, setEditingType] = useState(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef(null);

    // Filter transactions by date range
    const filterTransactions = useCallback((transactions, startDateValue, endDateValue) => {
        let filtered = [...transactions];

        if (startDateValue) {
            const parts = startDateValue.split('-');
            const startDate = new Date(parts[0], parts[1] - 1, parts[2]);
            if (!isNaN(startDate.getTime())) {
                startDate.setHours(0, 0, 0, 0);
                filtered = filtered.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate >= startDate;
                });
            }
        }

        if (endDateValue) {
            const parts = endDateValue.split('-');
            const endDate = new Date(parts[0], parts[1] - 1, parts[2]);
            if (!isNaN(endDate.getTime())) {
                endDate.setHours(23, 59, 59, 999);
                filtered = filtered.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate <= endDate;
                });
            }
        }

        return filtered;
    }, []);

    // Filtered transactions
    const filteredVisa = useMemo(() =>
        filterTransactions(visaTransactions, visaFilter.startDate, visaFilter.endDate),
        [visaTransactions, visaFilter, filterTransactions]
    );

    const filteredAmex = useMemo(() =>
        filterTransactions(amexTransactions, amexFilter.startDate, amexFilter.endDate),
        [amexTransactions, amexFilter, filterTransactions]
    );

    const filteredRogers = useMemo(() =>
        filterTransactions(rogersTransactions, rogersFilter.startDate, rogersFilter.endDate),
        [rogersTransactions, rogersFilter, filterTransactions]
    );

    // Apply search filter across all transactions
    const applySearchFilter = useCallback((transactions) => {
        if (!searchQuery.trim()) return transactions;
        const query = searchQuery.toLowerCase();
        return transactions.filter(t =>
            t.name.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    // Search-filtered transactions
    const searchedVisa = useMemo(() => applySearchFilter(filteredVisa), [filteredVisa, applySearchFilter]);
    const searchedAmex = useMemo(() => applySearchFilter(filteredAmex), [filteredAmex, applySearchFilter]);
    const searchedRogers = useMemo(() => applySearchFilter(filteredRogers), [filteredRogers, applySearchFilter]);
    const searchedManual = useMemo(() => applySearchFilter(manualTransactions), [manualTransactions, applySearchFilter]);

    // Calculate totals
    const calculateTotal = (transactions) => transactions.reduce((sum, t) => sum + t.expense, 0);
    const calculateCompanyTotal = (transactions) =>
        transactions.filter(t => t.isCompany).reduce((sum, t) => sum + t.expense, 0);

    const visaTotal = useMemo(() => calculateTotal(searchedVisa), [searchedVisa]);
    const amexTotal = useMemo(() => calculateTotal(searchedAmex), [searchedAmex]);
    const rogersTotal = useMemo(() => calculateTotal(searchedRogers), [searchedRogers]);
    const manualTotal = useMemo(() => calculateTotal(searchedManual), [searchedManual]);
    const grandTotal = visaTotal + amexTotal + rogersTotal + manualTotal;
    const personTotals = useMemo(() =>
        calculatePersonTotals([...searchedVisa, ...searchedAmex, ...searchedRogers, ...searchedManual]),
        [searchedVisa, searchedAmex, searchedRogers, searchedManual]
    );

    const visaCompanyTotal = useMemo(() => calculateCompanyTotal(searchedVisa), [searchedVisa]);
    const amexCompanyTotal = useMemo(() => calculateCompanyTotal(searchedAmex), [searchedAmex]);
    const rogersCompanyTotal = useMemo(() => calculateCompanyTotal(searchedRogers), [searchedRogers]);
    const manualCompanyTotal = useMemo(() => calculateCompanyTotal(searchedManual), [searchedManual]);
    const companyGrandTotal = visaCompanyTotal + amexCompanyTotal + rogersCompanyTotal + manualCompanyTotal;

    // Check if any company transactions exist
    const hasCompanyTransactions = useMemo(() =>
        [...visaTransactions, ...amexTransactions, ...rogersTransactions, ...manualTransactions].some(t => t.isCompany),
        [visaTransactions, amexTransactions, rogersTransactions, manualTransactions]
    );

    // File upload handlers
    const handleVisaUpload = async (files) => {
        setIsLoading(true);
        try {
            let totalAdded = 0;
            for (const file of files) {
                const content = await readFileAsText(file);
                const newTransactions = processVISACSV(content, visaTransactions);
                if (newTransactions.length > 0) {
                    setVisaTransactions(prev => [...prev, ...newTransactions]);
                    totalAdded += newTransactions.length;
                }
            }
            if (totalAdded > 0) {
                toast.success(`Added ${totalAdded} VISA transaction${totalAdded > 1 ? 's' : ''}`);
            } else {
                toast('No new transactions found', { icon: 'ℹ️' });
            }
        } catch (error) {
            toast.error('Failed to process VISA file');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAmexUpload = async (files) => {
        setIsLoading(true);
        try {
            let totalAdded = 0;
            for (const file of files) {
                const data = await readFileAsBuffer(file);
                const newTransactions = processAMEXExcel(data, amexTransactions);
                if (newTransactions.length > 0) {
                    setAmexTransactions(prev => [...prev, ...newTransactions]);
                    totalAdded += newTransactions.length;
                }
            }
            if (totalAdded > 0) {
                toast.success(`Added ${totalAdded} AMEX transaction${totalAdded > 1 ? 's' : ''}`);
            } else {
                toast('No new transactions found', { icon: 'ℹ️' });
            }
        } catch (error) {
            toast.error('Failed to process AMEX file');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRogersUpload = async (files) => {
        setIsLoading(true);
        try {
            let totalAdded = 0;
            for (const file of files) {
                const content = await readFileAsText(file);
                const newTransactions = processROGERSCSV(content, rogersTransactions);
                if (newTransactions.length > 0) {
                    setRogersTransactions(prev => [...prev, ...newTransactions]);
                    totalAdded += newTransactions.length;
                }
            }
            if (totalAdded > 0) {
                toast.success(`Added ${totalAdded} ROGERS transaction${totalAdded > 1 ? 's' : ''}`);
            } else {
                toast('No new transactions found', { icon: 'ℹ️' });
            }
        } catch (error) {
            toast.error('Failed to process ROGERS file');
        } finally {
            setIsLoading(false);
        }
    };

    // Transaction action handlers
    const createToggleSplit = (setTransactions) => (id) => {
        setTransactions(prev => prev.map(t => {
            if (t.id === id) {
                const newIsSplit = !t.isSplit;
                return {
                    ...t,
                    isSplit: newIsSplit,
                    expense: newIsSplit ? t.originalExpense / 2 : t.originalExpense
                };
            }
            return t;
        }));
    };

    const createToggleCompany = (setTransactions) => (id) => {
        setTransactions(prev => prev.map(t =>
            t.id === id ? { ...t, isCompany: !t.isCompany } : t
        ));
    };

    const createChangePerson = (setTransactions) => (id, person) => {
        setTransactions(prev => prev.map(t =>
            t.id === id ? { ...t, person } : t
        ));
    };

    const createEdit = (setTransactions, typeName) => (id) => {
        const allTransactions = {
            VISA: visaTransactions,
            AMEX: amexTransactions,
            ROGERS: rogersTransactions,
            Manual: manualTransactions
        };
        const transaction = allTransactions[typeName]?.find(t => t.id === id);
        if (transaction) {
            setEditingTransaction(transaction);
            setEditingType({ setter: setTransactions, name: typeName });
        }
    };

    const handleSaveEdit = (updatedTransaction) => {
        if (editingType) {
            editingType.setter(prev => prev.map(t =>
                t.id === updatedTransaction.id ? updatedTransaction : t
            ));
            toast.success('Transaction updated');
        }
        setEditingTransaction(null);
        setEditingType(null);
    };

    const createDelete = (setTransactions, typeName) => (id) => {
        // Blur the current button to prevent Enter key from re-triggering it
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        const transaction = [...visaTransactions, ...amexTransactions, ...rogersTransactions, ...manualTransactions]
            .find(t => t.id === id);
        if (transaction) {
            toast((t) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span>Delete this {typeName} transaction?</span>
                    <span style={{ fontSize: '0.85em', opacity: 0.8 }}>
                        {new Date(transaction.date).toLocaleDateString()} - {transaction.name} - ${transaction.expense.toFixed(2)}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                            autoFocus
                            onClick={() => {
                                setTransactions(prev => prev.filter(tr => tr.id !== id));
                                toast.dismiss(t.id);
                                toast.success('Transaction deleted');
                            }}
                            style={{ padding: '6px 12px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            style={{ padding: '6px 12px', background: '#5d6d7e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ), { duration: 10000 });
        }
    };

    // Manual transaction handler
    const handleAddManualTransaction = (transaction) => {
        setManualTransactions(prev => [...prev, transaction]);
        toast.success('Transaction added');
    };

    // PDF export handler
    const handleExportPdf = async () => {
        setIsLoading(true);
        try {
            const selectedVisa = filterTransactionsByAudience(filteredVisa, exportAudience);
            const selectedAmex = filterTransactionsByAudience(filteredAmex, exportAudience);
            const selectedRogers = filterTransactionsByAudience(filteredRogers, exportAudience);
            const selectedManual = filterTransactionsByAudience(manualTransactions, exportAudience);

            await exportToPdf({
                visaTransactions: selectedVisa,
                amexTransactions: selectedAmex,
                rogersTransactions: selectedRogers,
                manualTransactions: selectedManual,
                audience: exportAudience,
                filters: {
                    visa: visaFilter,
                    amex: amexFilter,
                    rogers: rogersFilter
                }
            });
            toast.success('PDF exported successfully');
        } catch (error) {
            toast.error('Failed to export PDF');
        } finally {
            setIsLoading(false);
        }
    };

    // Clear all data handler
    const handleClearAll = () => {
        toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>⚠️ Clear ALL Data?</span>
                <span style={{ fontSize: '0.85em', opacity: 0.8 }}>
                    This will permanently delete all transactions and cannot be undone.
                </span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                        onClick={() => {
                            setVisaTransactions([]);
                            setAmexTransactions([]);
                            setRogersTransactions([]);
                            setManualTransactions([]);
                            setVisaFilter({ startDate: '', endDate: '' });
                            setAmexFilter({ startDate: '', endDate: '' });
                            setRogersFilter({ startDate: '', endDate: '' });
                            toast.dismiss(t.id);
                            toast.success('All data cleared');
                        }}
                        style={{ padding: '6px 12px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Clear All
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{ padding: '6px 12px', background: '#5d6d7e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 15000 });
    };

    // Backup restore handler
    const handleRestore = (data) => {
        setVisaTransactions(data.visaTransactions);
        setAmexTransactions(data.amexTransactions);
        setRogersTransactions(data.rogersTransactions);
        setManualTransactions(data.manualTransactions);
    };

    // Export backup for keyboard shortcut
    const handleExportBackup = () => {
        const data = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            data: {
                visaTransactions,
                amexTransactions,
                rogersTransactions,
                manualTransactions
            }
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `credit-card-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Backup exported (Ctrl+S)');
    };

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onExportPdf: handleExportPdf,
        onBackup: handleExportBackup,
        onFocusSearch: () => searchInputRef.current?.focus(),
        onEscape: () => {
            if (editingTransaction) {
                setEditingTransaction(null);
                setEditingType(null);
            } else {
                setSearchQuery('');
            }
        }
    });

    return (
        <>
            {isLoading && <LoadingSpinner overlay />}
            <div className="main-container">
                <h1>💳 Credit Card Expenses Manager</h1>

                <SearchBar
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search transactions by name... (Ctrl+F)"
                />

                <FileUpload
                    onVisaUpload={handleVisaUpload}
                    onAmexUpload={handleAmexUpload}
                    onRogersUpload={handleRogersUpload}
                />

                <ManualEntry onAddTransaction={handleAddManualTransaction} />

                <BackupRestore
                    visaTransactions={visaTransactions}
                    amexTransactions={amexTransactions}
                    rogersTransactions={rogersTransactions}
                    manualTransactions={manualTransactions}
                    onRestore={handleRestore}
                />

                {/* VISA Section */}
                <FilterControls
                    label="VISA"
                    startDate={visaFilter.startDate}
                    endDate={visaFilter.endDate}
                    onStartDateChange={(v) => setVisaFilter(prev => ({ ...prev, startDate: v }))}
                    onEndDateChange={(v) => setVisaFilter(prev => ({ ...prev, endDate: v }))}
                    onFilter={() => { }}
                    onClear={() => setVisaFilter({ startDate: '', endDate: '' })}
                />
                <TransactionTable
                    title="VISA"
                    transactions={searchedVisa}
                    total={visaTotal}
                    companyTotal={visaCompanyTotal}
                    showCompanyTotal={visaCompanyTotal > 0}
                    onToggleSplit={createToggleSplit(setVisaTransactions)}
                    onToggleCompany={createToggleCompany(setVisaTransactions)}
                    onChangePerson={createChangePerson(setVisaTransactions)}
                    onEdit={createEdit(setVisaTransactions, 'VISA')}
                    onDelete={createDelete(setVisaTransactions, 'VISA')}
                />

                {/* AMEX Section */}
                <FilterControls
                    label="AMEX"
                    startDate={amexFilter.startDate}
                    endDate={amexFilter.endDate}
                    onStartDateChange={(v) => setAmexFilter(prev => ({ ...prev, startDate: v }))}
                    onEndDateChange={(v) => setAmexFilter(prev => ({ ...prev, endDate: v }))}
                    onFilter={() => { }}
                    onClear={() => setAmexFilter({ startDate: '', endDate: '' })}
                />
                <TransactionTable
                    title="AMEX"
                    transactions={searchedAmex}
                    total={amexTotal}
                    companyTotal={amexCompanyTotal}
                    showCompanyTotal={amexCompanyTotal > 0}
                    onToggleSplit={createToggleSplit(setAmexTransactions)}
                    onToggleCompany={createToggleCompany(setAmexTransactions)}
                    onChangePerson={createChangePerson(setAmexTransactions)}
                    onEdit={createEdit(setAmexTransactions, 'AMEX')}
                    onDelete={createDelete(setAmexTransactions, 'AMEX')}
                />

                {/* ROGERS Section */}
                <FilterControls
                    label="ROGERS"
                    startDate={rogersFilter.startDate}
                    endDate={rogersFilter.endDate}
                    onStartDateChange={(v) => setRogersFilter(prev => ({ ...prev, startDate: v }))}
                    onEndDateChange={(v) => setRogersFilter(prev => ({ ...prev, endDate: v }))}
                    onFilter={() => { }}
                    onClear={() => setRogersFilter({ startDate: '', endDate: '' })}
                />
                <TransactionTable
                    title="ROGERS"
                    transactions={searchedRogers}
                    total={rogersTotal}
                    companyTotal={rogersCompanyTotal}
                    showCompanyTotal={rogersCompanyTotal > 0}
                    onToggleSplit={createToggleSplit(setRogersTransactions)}
                    onToggleCompany={createToggleCompany(setRogersTransactions)}
                    onChangePerson={createChangePerson(setRogersTransactions)}
                    onEdit={createEdit(setRogersTransactions, 'ROGERS')}
                    onDelete={createDelete(setRogersTransactions, 'ROGERS')}
                />

                {/* Manual Section */}
                <TransactionTable
                    title="Manual"
                    transactions={searchedManual}
                    total={manualTotal}
                    companyTotal={manualCompanyTotal}
                    showCompanyTotal={manualCompanyTotal > 0}
                    onToggleSplit={createToggleSplit(setManualTransactions)}
                    onToggleCompany={createToggleCompany(setManualTransactions)}
                    onChangePerson={createChangePerson(setManualTransactions)}
                    onEdit={createEdit(setManualTransactions, 'Manual')}
                    onDelete={createDelete(setManualTransactions, 'Manual')}
                />

                <Footer
                    grandTotal={grandTotal}
                    companyGrandTotal={companyGrandTotal}
                    personTotals={personTotals}
                    exportAudience={exportAudience}
                    onExportAudienceChange={setExportAudience}
                    showCompanyTotal={hasCompanyTransactions}
                    onExportPdf={handleExportPdf}
                    onExportExcel={() => {
                        const selectedVisa = filterTransactionsByAudience(searchedVisa, exportAudience);
                        const selectedAmex = filterTransactionsByAudience(searchedAmex, exportAudience);
                        const selectedRogers = filterTransactionsByAudience(searchedRogers, exportAudience);
                        const selectedManual = filterTransactionsByAudience(searchedManual, exportAudience);

                        exportToExcel({
                            visa: selectedVisa,
                            amex: selectedAmex,
                            rogers: selectedRogers,
                            manual: selectedManual
                        }, exportAudience === ALL_AUDIENCE ? 'credit-card-expenses' : `credit-card-expenses-${exportAudience}`, exportAudience);
                        toast.success('Excel exported successfully');
                    }}
                    onClearAll={handleClearAll}
                />
            </div>

            {editingTransaction && (
                <EditTransactionModal
                    transaction={editingTransaction}
                    onSave={handleSaveEdit}
                    onClose={() => {
                        setEditingTransaction(null);
                        setEditingType(null);
                    }}
                />
            )}
        </>
    );
}

export default App;
