import { useState } from 'react';

export default function ManualEntry({ onAddTransaction }) {
    const [date, setDate] = useState('');
    const [name, setName] = useState('');
    const [expense, setExpense] = useState('');

    const handleSubmit = () => {
        if (!date || !name || !expense) return;

        const expenseValue = parseFloat(expense);
        if (isNaN(expenseValue) || expenseValue <= 0) return;

        const parts = date.split('-');
        if (parts.length !== 3) return;

        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);

        if (isNaN(year) || isNaN(month) || isNaN(day) ||
            year < 1900 || year > 2100 ||
            month < 0 || month > 11 ||
            day < 1 || day > 31) {
            return;
        }

        const transactionDate = new Date(year, month, day, 12, 0, 0);
        if (isNaN(transactionDate.getTime())) return;

        const newTransaction = {
            id: 'manual_' + Date.now(),
            date: transactionDate,
            name,
            expense: expenseValue,
            originalExpense: expenseValue,
            isSplit: false,
            isCompany: false
        };

        onAddTransaction(newTransaction);
        setDate('');
        setName('');
        setExpense('');
    };

    return (
        <div className="manual-entry-container">
            <h2>Manual Transaction Entry</h2>
            <div className="form-row">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    aria-label="Transaction Date"
                />
                <input
                    type="text"
                    placeholder="Transaction Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-label="Transaction Name"
                />
                <input
                    type="number"
                    placeholder="Expense Amount"
                    step="0.01"
                    value={expense}
                    onChange={(e) => setExpense(e.target.value)}
                    aria-label="Expense Amount"
                />
            </div>
            <button onClick={handleSubmit}>Add Manual Transaction</button>
        </div>
    );
}
