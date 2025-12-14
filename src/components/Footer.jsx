import { formatCurrency } from '../utils/formatters';

export default function Footer({
    grandTotal,
    companyGrandTotal,
    showCompanyTotal,
    onExportPdf,
    onClearAll
}) {
    return (
        <footer className="footer-container">
            <div className="summary-container">
                <div className="summary-item grand-total">
                    <span className="summary-label">Grand Total</span>
                    <span className="summary-value">{formatCurrency(grandTotal)}</span>
                </div>
                {showCompanyTotal && (
                    <div className="summary-item">
                        <span className="summary-label">Company Total</span>
                        <span className="summary-value company-color">{formatCurrency(companyGrandTotal)}</span>
                    </div>
                )}
            </div>
            <div className="actions-container">
                <button className="btn-export" onClick={onExportPdf}>Export as PDF</button>
                <button className="btn-danger" onClick={onClearAll}>Clear All Data</button>
            </div>
        </footer>
    );
}
