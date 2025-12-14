import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, parseCurrency } from '../utils/formatters';

describe('formatCurrency', () => {
    it('should format positive numbers as USD', () => {
        expect(formatCurrency(100)).toBe('$100.00');
        expect(formatCurrency(1234.56)).toBe('$1,234.56');
        expect(formatCurrency(0.99)).toBe('$0.99');
    });

    it('should format zero', () => {
        expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should format negative numbers', () => {
        expect(formatCurrency(-50)).toBe('-$50.00');
    });
});

describe('formatDate', () => {
    it('should format valid dates', () => {
        const date = new Date(2024, 0, 15); // Jan 15, 2024
        expect(formatDate(date)).toBe('Jan 15, 2024');
    });

    it('should handle different months', () => {
        const date = new Date(2024, 11, 25); // Dec 25, 2024
        expect(formatDate(date)).toBe('Dec 25, 2024');
    });

    it('should return "Invalid Date" for invalid input', () => {
        expect(formatDate(null)).toBe('Invalid Date');
        expect(formatDate(undefined)).toBe('Invalid Date');
        expect(formatDate(new Date('invalid'))).toBe('Invalid Date');
    });
});

describe('parseCurrency', () => {
    it('should parse currency strings', () => {
        expect(parseCurrency('$100.00')).toBe(100);
        expect(parseCurrency('$1,234.56')).toBe(1234.56);
    });

    it('should handle strings without currency symbol', () => {
        expect(parseCurrency('500')).toBe(500);
        expect(parseCurrency('99.99')).toBe(99.99);
    });

    it('should return 0 for invalid input', () => {
        expect(parseCurrency('')).toBe(0);
        expect(parseCurrency('abc')).toBe(0);
    });
});
