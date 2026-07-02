import { useState, useEffect } from 'react';
import './EditTransactionModal.css';
import { DEFAULT_PERSON, PEOPLE, getTransactionPerson } from '../utils/transactionPeople';

export default function EditTransactionModal({ transaction, onSave, onClose }) {
    const [date, setDate] = useState('');
    const [name, setName] = useState('');
    const [expense, setExpense] = useState('');
    const [person, setPerson] = useState(DEFAULT_PERSON);

    useEffect(() => {
        if (transaction) {
            const transDate = new Date(transaction.date);
            const year = transDate.getFullYear();
            const month = String(transDate.getMonth() + 1).padStart(2, '0');
            const day = String(transDate.getDate()).padStart(2, '0');
            setDate(`${year}-${month}-${day}`);
            setName(transaction.name);
            setExpense(transaction.originalExpense.toString());
            setPerson(getTransactionPerson(transaction));
        }
    }, [transaction]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!date || !name || !expense) return;

        const expenseValue = parseFloat(expense);
        if (isNaN(expenseValue) || expenseValue === 0) return;

        const parts = date.split('-');
        const transactionDate = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
            12, 0, 0
        );

        const updatedTransaction = {
            ...transaction,
            date: transactionDate,
            name,
            originalExpense: expenseValue,
            expense: transaction.isSplit ? expenseValue / 2 : expenseValue,
            person
        };

        onSave(updatedTransaction);
    };

    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            onClose();
        }
    };

    if (!transaction) return null;

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>✏️ Edit Transaction</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="edit-date">Date</label>
                            <input
                                type="date"
                                id="edit-date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-name">Name</label>
                            <input
                                type="text"
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Transaction name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-expense">Amount ($)</label>
                            <input
                                type="number"
                                id="edit-expense"
                                value={expense}
                                onChange={(e) => setExpense(e.target.value)}
                                step="0.01"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-person">Person</label>
                            <select
                                id="edit-person"
                                value={person}
                                onChange={(e) => setPerson(e.target.value)}
                            >
                                {PEOPLE.map(personName => (
                                    <option key={personName} value={personName}>{personName}</option>
                                ))}
                            </select>
                        </div>
                        {transaction.isSplit && (
                            <div className="form-note">
                                ℹ️ This transaction is split. Display amount will be half of the entered value.
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
