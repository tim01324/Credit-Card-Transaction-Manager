import { formatCurrency, formatDate } from '../utils/formatters';

export default function TransactionTable({
    title,
    transactions,
    onToggleSplit,
    onToggleCompany,
    onDelete,
    showCompanyTotal,
    companyTotal,
    total
}) {
    const sortedTransactions = [...transactions].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });

    return (
        <>
            <h2>{title} Transactions</h2>
            <div className="sort-info">Sorted by Date (Newest First)</div>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Expenses</th>
                        <th>Split (P)</th>
                        <th>Company (C)</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {sortedTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                            <td>{formatDate(new Date(transaction.date))}</td>
                            <td title={transaction.name}>{transaction.name}</td>
                            <td style={{
                                fontWeight: 'bold',
                                color: transaction.isSplit ? 'var(--success-color)' : 'inherit'
                            }}>
                                {formatCurrency(transaction.expense)}
                            </td>
                            <td>
                                <button
                                    className={`btn-split ${transaction.isSplit ? 'active' : ''}`}
                                    title={transaction.isSplit ? 'Remove split' : 'Split expense'}
                                    onClick={() => onToggleSplit(transaction.id)}
                                >
                                    P
                                </button>
                            </td>
                            <td>
                                <button
                                    className={`btn-company ${transaction.isCompany ? 'active' : ''}`}
                                    title={transaction.isCompany ? 'Remove company expense' : 'Mark as company expense'}
                                    onClick={() => onToggleCompany(transaction.id)}
                                >
                                    C
                                </button>
                            </td>
                            <td>
                                <button
                                    className="btn-delete"
                                    title="Delete transaction"
                                    onClick={() => onDelete(transaction.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="total-amount">
                Total {title} Expenses: <span>{formatCurrency(total)}</span>
            </div>
            {showCompanyTotal && (
                <div className="total-amount company-total show">
                    {title} Company Expenses: <span>{formatCurrency(companyTotal)}</span>
                </div>
            )}
        </>
    );
}
