import { describe, expect, it } from 'vitest';
import {
    calculatePersonTotals,
    filterTransactionsByAudience,
    getTransactionPerson,
    getTransactionPersonLabel,
    getTransactionPeople
} from '../utils/transactionPeople';

describe('transactionPeople', () => {
    it('defaults old transactions without a person to Tim', () => {
        expect(getTransactionPerson({ name: 'Old transaction' })).toBe('Tim');
    });

    it('assigns non-split transactions to their selected person', () => {
        expect(getTransactionPeople({ person: 'Daniel', isSplit: false })).toEqual(['Daniel']);
    });

    it('assigns split transactions to both people', () => {
        expect(getTransactionPeople({ person: 'Daniel', isSplit: true })).toEqual(['Daniel', 'Tim']);
    });

    it('labels split transactions for selected exports', () => {
        const transaction = { person: 'Daniel', isSplit: true };

        expect(getTransactionPersonLabel(transaction, 'all')).toBe('Daniel + Tim');
        expect(getTransactionPersonLabel(transaction, 'Daniel')).toBe('Daniel (Split)');
    });

    it('calculates person totals using the already-split expense', () => {
        const transactions = [
            { expense: 30, person: 'Daniel', isSplit: false },
            { expense: 12, person: 'Tim', isSplit: false },
            { expense: 50, person: 'Tim', isSplit: true }
        ];

        expect(calculatePersonTotals(transactions)).toEqual({
            Daniel: 80,
            Tim: 62
        });
    });

    it('filters selected exports while keeping split transactions for both people', () => {
        const transactions = [
            { id: 'daniel', expense: 30, person: 'Daniel', isSplit: false },
            { id: 'tim', expense: 12, person: 'Tim', isSplit: false },
            { id: 'split', expense: 50, person: 'Tim', isSplit: true }
        ];

        expect(filterTransactionsByAudience(transactions, 'Daniel').map(t => t.id)).toEqual(['daniel', 'split']);
        expect(filterTransactionsByAudience(transactions, 'Tim').map(t => t.id)).toEqual(['tim', 'split']);
        expect(filterTransactionsByAudience(transactions, 'all').map(t => t.id)).toEqual(['daniel', 'tim', 'split']);
    });
});
