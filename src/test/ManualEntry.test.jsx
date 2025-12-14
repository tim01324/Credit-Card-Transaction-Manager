import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ManualEntry from '../components/ManualEntry';

describe('ManualEntry Component', () => {
    let mockOnAddTransaction;

    beforeEach(() => {
        mockOnAddTransaction = vi.fn();
    });

    it('should render all input fields', () => {
        render(<ManualEntry onAddTransaction={mockOnAddTransaction} />);

        expect(screen.getByLabelText('Transaction Date')).toBeInTheDocument();
        expect(screen.getByLabelText('Transaction Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Expense Amount')).toBeInTheDocument();
        expect(screen.getByText('Add Manual Transaction')).toBeInTheDocument();
    });

    it('should not submit with empty fields', () => {
        render(<ManualEntry onAddTransaction={mockOnAddTransaction} />);

        fireEvent.click(screen.getByText('Add Manual Transaction'));

        expect(mockOnAddTransaction).not.toHaveBeenCalled();
    });

    it('should submit with valid input', () => {
        render(<ManualEntry onAddTransaction={mockOnAddTransaction} />);

        fireEvent.change(screen.getByLabelText('Transaction Date'), { target: { value: '2024-01-15' } });
        fireEvent.change(screen.getByLabelText('Transaction Name'), { target: { value: 'Test Transaction' } });
        fireEvent.change(screen.getByLabelText('Expense Amount'), { target: { value: '25.50' } });

        fireEvent.click(screen.getByText('Add Manual Transaction'));

        expect(mockOnAddTransaction).toHaveBeenCalledTimes(1);
        const call = mockOnAddTransaction.mock.calls[0][0];
        expect(call.name).toBe('Test Transaction');
        expect(call.expense).toBe(25.50);
        expect(call.isSplit).toBe(false);
        expect(call.isCompany).toBe(false);
    });

    it('should clear fields after submission', () => {
        render(<ManualEntry onAddTransaction={mockOnAddTransaction} />);

        const dateInput = screen.getByLabelText('Transaction Date');
        const nameInput = screen.getByLabelText('Transaction Name');
        const amountInput = screen.getByLabelText('Expense Amount');

        fireEvent.change(dateInput, { target: { value: '2024-01-15' } });
        fireEvent.change(nameInput, { target: { value: 'Test' } });
        fireEvent.change(amountInput, { target: { value: '10' } });

        fireEvent.click(screen.getByText('Add Manual Transaction'));

        expect(dateInput.value).toBe('');
        expect(nameInput.value).toBe('');
        expect(amountInput.value).toBe('');
    });
});
