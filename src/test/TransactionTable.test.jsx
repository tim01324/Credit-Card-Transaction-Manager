import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionTable from '../components/TransactionTable';

describe('TransactionTable Component', () => {
    const mockTransactions = [
        {
            id: '1',
            date: new Date(2024, 0, 15, 12, 0, 0),
            name: 'Coffee Shop',
            expense: 5.00,
            originalExpense: 5.00,
            isSplit: false,
            isCompany: false
        },
        {
            id: '2',
            date: new Date(2024, 0, 16, 12, 0, 0),
            name: 'Gas Station',
            expense: 50.00,
            originalExpense: 50.00,
            isSplit: false,
            isCompany: true
        }
    ];

    const defaultProps = {
        title: 'VISA',
        transactions: mockTransactions,
        total: 55.00,
        companyTotal: 50.00,
        showCompanyTotal: true,
        onToggleSplit: vi.fn(),
        onToggleCompany: vi.fn(),
        onDelete: vi.fn()
    };

    it('should render the table title', () => {
        render(<TransactionTable {...defaultProps} />);
        expect(screen.getByText('VISA Transactions')).toBeInTheDocument();
    });

    it('should display all transactions', () => {
        render(<TransactionTable {...defaultProps} />);
        expect(screen.getByText('Coffee Shop')).toBeInTheDocument();
        expect(screen.getByText('Gas Station')).toBeInTheDocument();
    });

    it('should display total label', () => {
        render(<TransactionTable {...defaultProps} />);
        expect(screen.getByText(/Total VISA Expenses/)).toBeInTheDocument();
    });

    it('should call onToggleSplit when P button is clicked', () => {
        const mockToggleSplit = vi.fn();
        render(<TransactionTable {...defaultProps} onToggleSplit={mockToggleSplit} />);

        const splitButtons = screen.getAllByText('P');
        fireEvent.click(splitButtons[0]);

        // The first button clicked corresponds to the first transaction in sorted order
        expect(mockToggleSplit).toHaveBeenCalled();
    });

    it('should call onToggleCompany when C button is clicked', () => {
        const mockToggleCompany = vi.fn();
        render(<TransactionTable {...defaultProps} onToggleCompany={mockToggleCompany} />);

        const companyButtons = screen.getAllByText('C');
        fireEvent.click(companyButtons[0]);

        expect(mockToggleCompany).toHaveBeenCalled();
    });

    it('should call onDelete when Del button is clicked', () => {
        const mockDelete = vi.fn();
        render(<TransactionTable {...defaultProps} onDelete={mockDelete} />);

        const deleteButtons = screen.getAllByText('Del');
        fireEvent.click(deleteButtons[0]);

        expect(mockDelete).toHaveBeenCalled();
    });

    it('should show active class on split button when transaction is split', () => {
        const splitTransaction = [{
            ...mockTransactions[0],
            isSplit: true,
            expense: 2.50
        }];

        render(<TransactionTable {...defaultProps} transactions={splitTransaction} />);

        const splitButton = screen.getByText('P');
        expect(splitButton.classList.contains('active')).toBe(true);
    });

    it('should sort transactions by date (newest first)', () => {
        render(<TransactionTable {...defaultProps} />);

        const rows = screen.getAllByRole('row');
        // First row is header, so actual data starts at index 1
        // Jan 16 should come before Jan 15 (newest first)
        expect(rows[1]).toHaveTextContent('Gas Station');
        expect(rows[2]).toHaveTextContent('Coffee Shop');
    });
});
