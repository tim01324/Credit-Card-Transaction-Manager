import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import FileUpload from './components/FileUpload';
import ManualEntry from './components/ManualEntry';
import FilterControls from './components/FilterControls';
import TransactionTable from './components/TransactionTable';
import Footer from './components/Footer';
import { processVISACSV, processAMEXExcel, processROGERSCSV, readFileAsText, readFileAsBuffer } from './utils/fileProcessors';
import { exportToPdf } from './utils/pdfExport';

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

    // Calculate totals
    const calculateTotal = (transactions) => transactions.reduce((sum, t) => sum + t.expense, 0);
    const calculateCompanyTotal = (transactions) =>
        transactions.filter(t => t.isCompany).reduce((sum, t) => sum + t.expense, 0);

    const visaTotal = useMemo(() => calculateTotal(filteredVisa), [filteredVisa]);
    const amexTotal = useMemo(() => calculateTotal(filteredAmex), [filteredAmex]);
    const rogersTotal = useMemo(() => calculateTotal(filteredRogers), [filteredRogers]);
    const manualTotal = useMemo(() => calculateTotal(manualTransactions), [manualTransactions]);
    const grandTotal = visaTotal + amexTotal + rogersTotal + manualTotal;

    const visaCompanyTotal = useMemo(() => calculateCompanyTotal(filteredVisa), [filteredVisa]);
    const amexCompanyTotal = useMemo(() => calculateCompanyTotal(filteredAmex), [filteredAmex]);
    const rogersCompanyTotal = useMemo(() => calculateCompanyTotal(filteredRogers), [filteredRogers]);
    const manualCompanyTotal = useMemo(() => calculateCompanyTotal(manualTransactions), [manualTransactions]);
    const companyGrandTotal = visaCompanyTotal + amexCompanyTotal + rogersCompanyTotal + manualCompanyTotal;

    // Check if any company transactions exist
    const hasCompanyTransactions = useMemo(() =>
        [...visaTransactions, ...amexTransactions, ...rogersTransactions, ...manualTransactions].some(t => t.isCompany),
        [visaTransactions, amexTransactions, rogersTransactions, manualTransactions]
    );

    // File upload handlers
    const handleVisaUpload = async (files) => {
        for (const file of files) {
            const content = await readFileAsText(file);
            const newTransactions = processVISACSV(content, visaTransactions);
            if (newTransactions.length > 0) {
                setVisaTransactions(prev => [...prev, ...newTransactions]);
            }
        }
    };

    const handleAmexUpload = async (files) => {
        for (const file of files) {
            const data = await readFileAsBuffer(file);
            const newTransactions = processAMEXExcel(data, amexTransactions);
            if (newTransactions.length > 0) {
                setAmexTransactions(prev => [...prev, ...newTransactions]);
            }
        }
    };

    const handleRogersUpload = async (files) => {
        for (const file of files) {
            const content = await readFileAsText(file);
            const newTransactions = processROGERSCSV(content, rogersTransactions);
            if (newTransactions.length > 0) {
                setRogersTransactions(prev => [...prev, ...newTransactions]);
            }
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

    const createDelete = (setTransactions, typeName) => (id) => {
        const transaction = [...visaTransactions, ...amexTransactions, ...rogersTransactions, ...manualTransactions]
            .find(t => t.id === id);
        if (transaction && confirm(`⚠️ Permanently delete this ${typeName} transaction?\n\n${new Date(transaction.date).toLocaleDateString()}\n${transaction.name}\n$${transaction.expense.toFixed(2)}`)) {
            setTransactions(prev => prev.filter(t => t.id !== id));
        }
    };

    // Manual transaction handler
    const handleAddManualTransaction = (transaction) => {
        setManualTransactions(prev => [...prev, transaction]);
    };

    // PDF export handler
    const handleExportPdf = () => {
        exportToPdf({
            visaTransactions: filteredVisa,
            amexTransactions: filteredAmex,
            rogersTransactions: filteredRogers,
            manualTransactions,
            filters: {
                visa: visaFilter,
                amex: amexFilter,
                rogers: rogersFilter
            }
        });
    };

    // Clear all data handler
    const handleClearAll = () => {
        if (confirm("⚠️ ARE YOU SURE? ⚠️\n\nThis will permanently delete ALL transactions from this page and your browser's storage.\n\nThis action cannot be undone.")) {
            setVisaTransactions([]);
            setAmexTransactions([]);
            setRogersTransactions([]);
            setManualTransactions([]);
            setVisaFilter({ startDate: '', endDate: '' });
            setAmexFilter({ startDate: '', endDate: '' });
            setRogersFilter({ startDate: '', endDate: '' });
            alert('All data has been cleared.');
        }
    };

    return (
        <div className="main-container">
            <h1>💳 Credit Card Expenses Manager</h1>

            <FileUpload
                onVisaUpload={handleVisaUpload}
                onAmexUpload={handleAmexUpload}
                onRogersUpload={handleRogersUpload}
            />

            <ManualEntry onAddTransaction={handleAddManualTransaction} />

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
                transactions={filteredVisa}
                total={visaTotal}
                companyTotal={visaCompanyTotal}
                showCompanyTotal={visaCompanyTotal > 0}
                onToggleSplit={createToggleSplit(setVisaTransactions)}
                onToggleCompany={createToggleCompany(setVisaTransactions)}
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
                transactions={filteredAmex}
                total={amexTotal}
                companyTotal={amexCompanyTotal}
                showCompanyTotal={amexCompanyTotal > 0}
                onToggleSplit={createToggleSplit(setAmexTransactions)}
                onToggleCompany={createToggleCompany(setAmexTransactions)}
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
                transactions={filteredRogers}
                total={rogersTotal}
                companyTotal={rogersCompanyTotal}
                showCompanyTotal={rogersCompanyTotal > 0}
                onToggleSplit={createToggleSplit(setRogersTransactions)}
                onToggleCompany={createToggleCompany(setRogersTransactions)}
                onDelete={createDelete(setRogersTransactions, 'ROGERS')}
            />

            {/* Manual Section */}
            <TransactionTable
                title="Manual"
                transactions={manualTransactions}
                total={manualTotal}
                companyTotal={manualCompanyTotal}
                showCompanyTotal={manualCompanyTotal > 0}
                onToggleSplit={createToggleSplit(setManualTransactions)}
                onToggleCompany={createToggleCompany(setManualTransactions)}
                onDelete={createDelete(setManualTransactions, 'Manual')}
            />

            <Footer
                grandTotal={grandTotal}
                companyGrandTotal={companyGrandTotal}
                showCompanyTotal={hasCompanyTransactions}
                onExportPdf={handleExportPdf}
                onClearAll={handleClearAll}
            />
        </div>
    );
}

export default App;
