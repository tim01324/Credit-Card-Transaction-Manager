import { describe, it, expect } from 'vitest';
import { processVISACSV, processROGERSCSV } from '../utils/fileProcessors';

describe('processVISACSV', () => {
    it('should parse valid VISA CSV content', () => {
        const csvContent = `01/15/2024,Starbucks Coffee,4.25
01/16/2024,Gas Station,45.67`;

        const result = processVISACSV(csvContent, []);

        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('Starbucks Coffee');
        expect(result[0].expense).toBe(4.25);
        expect(result[1].name).toBe('Gas Station');
        expect(result[1].expense).toBe(45.67);
    });

    it('should skip invalid lines', () => {
        const csvContent = `invalid line
01/15/2024,Coffee,5.00`;

        const result = processVISACSV(csvContent, []);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Coffee');
    });

    it('should not add duplicates', () => {
        const existingTransactions = [{
            id: '1',
            date: new Date(2024, 0, 15, 12, 0, 0),
            name: 'Coffee',
            expense: 5.00,
            originalExpense: 5.00
        }];

        const csvContent = `01/15/2024,Coffee,5.00`;
        const result = processVISACSV(csvContent, existingTransactions);

        expect(result).toHaveLength(0);
    });

    it('should initialize transaction properties correctly', () => {
        const csvContent = `01/15/2024,Test,10.00`;
        const result = processVISACSV(csvContent, []);

        expect(result[0].isSplit).toBe(false);
        expect(result[0].isCompany).toBe(false);
        expect(result[0].originalExpense).toBe(10.00);
    });
});

describe('processROGERSCSV', () => {
    it('should parse valid ROGERS CSV with header', () => {
        // ROGERS CSV has header row and merchant name in column H (index 7) and amount in column M (index 12)
        const csvContent = `Date,Col2,Col3,Col4,Col5,Col6,Col7,Merchant,Col9,Col10,Col11,Col12,Amount
2024-01-15,,,,,,,Test Merchant,,,,,25.00`;

        const result = processROGERSCSV(csvContent, []);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Test Merchant');
        expect(result[0].expense).toBe(25.00);
    });

    it('should handle negative amounts', () => {
        const csvContent = `Header row
2024-01-15,,,,,,,Refund Store,,,,,-10.00`;

        const result = processROGERSCSV(csvContent, []);

        expect(result).toHaveLength(1);
        expect(result[0].expense).toBe(-10.00);
    });

    it('should use "Unknown Merchant" for missing merchant name', () => {
        const csvContent = `Header row
2024-01-15,,,,,,,,,,,,50.00`;

        const result = processROGERSCSV(csvContent, []);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Unknown Merchant');
    });
});
