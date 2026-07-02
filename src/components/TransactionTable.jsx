import { formatCurrency, formatDate } from '../utils/formatters';
import { getTransactionPerson, getTransactionPersonLabel, PEOPLE } from '../utils/transactionPeople';
import EmptyState from './EmptyState';

export default function TransactionTable({
    title,
    transactions,
    onToggleSplit,
    onToggleCompany,
    onChangePerson = () => {},
    onEdit,
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

    // Show empty state when no transactions
    if (transactions.length === 0) {
        return (
            <>
                <h2>{title} Transactions</h2>
                <EmptyState
                    icon={title === 'VISA' ? '💳' : title === 'AMEX' ? '💎' : title === 'ROGERS' ? '📱' : '✏️'}
                    title={`No ${title} transactions`}
                    description="Upload a file or add a manual entry to see transactions here."
                />
            </>
        );
    }

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
                        <th>Person</th>
                        <th>Split (P)</th>
                        <th>Company (C)</th>
                        <th>Actions</th>
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
                                {transaction.isSplit ? (
                                    <span className="person-label split-person">
                                        {getTransactionPersonLabel(transaction)}
                                    </span>
                                ) : (
                                    <select
                                        className="person-select"
                                        value={getTransactionPerson(transaction)}
                                        onChange={(e) => onChangePerson(transaction.id, e.target.value)}
                                        aria-label={`Person for ${transaction.name}`}
                                    >
                                        {PEOPLE.map(person => (
                                            <option key={person} value={person}>{person}</option>
                                        ))}
                                    </select>
                                )}
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
                                    className="btn-edit"
                                    title="Edit transaction"
                                    onClick={() => onEdit(transaction.id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn-delete"
                                    title="Delete transaction"
                                    onClick={() => onDelete(transaction.id)}
                                >
                                    Del
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
