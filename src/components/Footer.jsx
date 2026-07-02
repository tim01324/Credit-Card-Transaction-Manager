import { formatCurrency } from '../utils/formatters';
import { ALL_AUDIENCE, PEOPLE } from '../utils/transactionPeople';

export default function Footer({
    grandTotal,
    companyGrandTotal,
    personTotals,
    exportAudience,
    onExportAudienceChange,
    showCompanyTotal,
    onExportPdf,
    onExportExcel,
    onClearAll
}) {
    return (
        <footer className="footer-container">
            <div className="summary-container">
                <div className="summary-item grand-total">
                    <span className="summary-label">Grand Total</span>
                    <span className="summary-value">{formatCurrency(grandTotal)}</span>
                </div>
                {PEOPLE.map(person => (
                    <div className="summary-item" key={person}>
                        <span className="summary-label">{person} Total</span>
                        <span className="summary-value personal-color">{formatCurrency(personTotals?.[person] || 0)}</span>
                    </div>
                ))}
                {showCompanyTotal && (
                    <div className="summary-item">
                        <span className="summary-label">Company Total</span>
                        <span className="summary-value company-color">{formatCurrency(companyGrandTotal)}</span>
                    </div>
                )}
            </div>
            <div className="actions-container">
                <label className="export-audience-label">
                    <span>Export For</span>
                    <select
                        value={exportAudience}
                        onChange={(e) => onExportAudienceChange(e.target.value)}
                        aria-label="Export For"
                    >
                        <option value={ALL_AUDIENCE}>All</option>
                        {PEOPLE.map(person => (
                            <option key={person} value={person}>{person}</option>
                        ))}
                    </select>
                </label>
                <button className="btn-export" onClick={onExportPdf}>PDF</button>
                <button className="btn-export btn-excel" onClick={onExportExcel}>Excel</button>
                <button className="btn-danger" onClick={onClearAll}>Clear All</button>
            </div>
        </footer>
    );
}
