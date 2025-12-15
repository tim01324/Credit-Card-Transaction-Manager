import toast from 'react-hot-toast';
import './BackupRestore.css';

export default function BackupRestore({
    visaTransactions,
    amexTransactions,
    rogersTransactions,
    manualTransactions,
    onRestore
}) {
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

        toast.success('Backup exported successfully');
    };

    const handleImportBackup = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.version || !data.data) {
                throw new Error('Invalid backup file format');
            }

            const { visaTransactions, amexTransactions, rogersTransactions, manualTransactions } = data.data;

            // Validate data structure
            const isValidArray = (arr) => Array.isArray(arr);
            if (!isValidArray(visaTransactions) || !isValidArray(amexTransactions) ||
                !isValidArray(rogersTransactions) || !isValidArray(manualTransactions)) {
                throw new Error('Invalid transaction data in backup');
            }

            toast((t) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontWeight: 'bold' }}>📥 Restore Backup?</span>
                    <span style={{ fontSize: '0.85em', opacity: 0.8 }}>
                        This will replace all current data with:
                        <br />• {visaTransactions.length} VISA transactions
                        <br />• {amexTransactions.length} AMEX transactions
                        <br />• {rogersTransactions.length} ROGERS transactions
                        <br />• {manualTransactions.length} Manual transactions
                    </span>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                            onClick={() => {
                                onRestore(data.data);
                                toast.dismiss(t.id);
                                toast.success('Backup restored successfully');
                            }}
                            style={{ padding: '6px 12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Restore
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            style={{ padding: '6px 12px', background: '#5d6d7e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ), { duration: 30000 });

        } catch (error) {
            toast.error('Failed to read backup file. Please check the file format.');
        }

        // Reset file input
        e.target.value = '';
    };

    return (
        <div className="backup-restore-container">
            <h2>💾 Backup & Restore</h2>
            <div className="backup-actions">
                <button className="btn-backup" onClick={handleExportBackup}>
                    📤 Export Backup
                </button>
                <label className="btn-restore">
                    📥 Import Backup
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImportBackup}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>
            <p className="backup-hint">
                Export your data as JSON or restore from a previous backup.
            </p>
        </div>
    );
}
