import * as XLSX from 'xlsx';
import { DEFAULT_PERSON } from './transactionPeople';

const AMEX_MONTHS = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
};

function normalizeHeader(value) {
    return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function findColumnIndex(headers, exactMatches, partialMatches = []) {
    const exactSet = exactMatches.map(normalizeHeader);
    let index = headers.findIndex(header => exactSet.includes(header));
    if (index !== -1) return index;

    index = headers.findIndex(header =>
        partialMatches.some(match => header.includes(normalizeHeader(match)))
    );
    return index;
}

function parseAMEXDate(value) {
    if (value instanceof Date) {
        return new Date(Date.UTC(
            value.getFullYear(),
            value.getMonth(),
            value.getDate(),
            12,
            0,
            0
        ));
    }

    if (typeof value === 'number') {
        const parsed = XLSX.SSF.parse_date_code(value);
        if (parsed) {
            return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d, 12, 0, 0));
        }
    }

    const dateStr = String(value ?? '').trim();
    if (!dateStr) return null;

    const parts = dateStr.replace(/[.,]/g, '').split(/\s+/);
    if (parts.length === 3) {
        if (parts[1].slice(0, 3) in AMEX_MONTHS) {
            const day = parseInt(parts[0], 10);
            const month = AMEX_MONTHS[parts[1].slice(0, 3)];
            const year = parseInt(parts[2], 10);
            if (!isNaN(day) && month !== undefined && !isNaN(year)) {
                return new Date(Date.UTC(year, month, day, 12, 0, 0));
            }
        }

        if (parts[0].slice(0, 3) in AMEX_MONTHS) {
            const month = AMEX_MONTHS[parts[0].slice(0, 3)];
            const day = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            if (month !== undefined && !isNaN(day) && !isNaN(year)) {
                return new Date(Date.UTC(year, month, day, 12, 0, 0));
            }
        }
    }

    const parsed = new Date(dateStr + 'T12:00:00Z');
    return isNaN(parsed.getTime()) ? null : parsed;
}

function parseAmount(value) {
    if (typeof value === 'number') return value;

    const originalText = String(value ?? '').trim();
    if (!originalText || originalText === '-') return NaN;

    const normalizedText = originalText.replace(/\u2212/g, '-');
    const isNegative =
        normalizedText.includes('-') ||
        /^\(.*\)$/.test(normalizedText) ||
        /\b(cr|credit)\b/i.test(normalizedText);
    const numericText = normalizedText.replace(/[^\d.]/g, '');
    const amount = parseFloat(numericText);

    if (isNaN(amount)) return NaN;
    return isNegative ? -amount : amount;
}

/**
 * Process VISA CSV file content
 * @param {string} csvContent - Raw CSV content
 * @param {Array} existingTransactions - Existing transactions to check for duplicates
 * @returns {Array} Array of new transaction objects
 */
export function processVISACSV(csvContent, existingTransactions = []) {
    const lines = csvContent.split('\n');
    const newTransactions = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
            const columns = line.split(',');
            if (columns.length < 3) continue;

            // Parse date
            let date = null;
            const dateStr = columns[0].trim();

            if (dateStr.includes('/')) {
                const parts = dateStr.split('/');
                if (parts.length >= 3) {
                    const month = parseInt(parts[0]) - 1;
                    const day = parseInt(parts[1]);
                    const year = parseInt(parts[2]);

                    if (!isNaN(year) && !isNaN(month) && !isNaN(day) &&
                        year >= 1900 && year <= 2100 &&
                        month >= 0 && month <= 11 &&
                        day >= 1 && day <= 31) {
                        date = new Date(year, month, day, 12, 0, 0);
                    }
                }
            } else {
                date = new Date(dateStr + 'T12:00:00');
            }

            if (!date || isNaN(date.getTime())) continue;

            const name = columns[1].trim();
            if (!name) continue;

            const expense = parseFloat(columns[2].trim());
            if (isNaN(expense)) continue;

            // Check for duplicates
            const isDuplicate = existingTransactions.some(t => {
                const tDate = new Date(t.date);
                const sameDate = tDate.getFullYear() === date.getFullYear() &&
                    tDate.getMonth() === date.getMonth() &&
                    tDate.getDate() === date.getDate();
                const sameName = t.name === name;
                const sameAmount = Math.abs(t.originalExpense - expense) < 0.01;
                return sameDate && sameName && sameAmount;
            });

            if (!isDuplicate) {
                newTransactions.push({
                    id: Date.now() + '_' + Math.random().toString(36).substring(2, 9),
                    date,
                    name,
                    expense,
                    originalExpense: expense,
                    isSplit: false,
                    isCompany: false,
                    person: DEFAULT_PERSON
                });
            }
        } catch (error) {
            continue;
        }
    }

    return newTransactions;
}

/**
 * Process AMEX Excel file data
 * @param {ArrayBuffer} data - Excel file as ArrayBuffer
 * @param {Array} existingTransactions - Existing transactions to check for duplicates
 * @returns {Array} Array of new transaction objects
 */
export function processAMEXExcel(data, existingTransactions = []) {
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

    const newTransactions = [];
    let dataStartIndex = -1;
    let dateIndex = -1;
    let descriptionIndex = -1;
    let cardmemberIndex = -1;
    let amountIndex = -1;
    let creditIndex = -1;

    // Find the header row dynamically
    for (let i = 0; i < excelData.length; i++) {
        const row = excelData[i];
        if (!Array.isArray(row) || row.length < 2) continue;

        const headers = row.map(normalizeHeader);
        const possibleDateIndex = findColumnIndex(headers, ['date']);
        const possibleDescriptionIndex = findColumnIndex(headers, ['description']);
        const possibleAmountIndex = findColumnIndex(headers, [
            'amount',
            'charge',
            'debit',
            'charge amount',
            'debit amount'
        ]);

        if (possibleDateIndex !== -1 && possibleDescriptionIndex !== -1) {
            dataStartIndex = i + 1;
            dateIndex = possibleDateIndex;
            descriptionIndex = possibleDescriptionIndex;
            cardmemberIndex = findColumnIndex(headers, ['card member', 'cardmember', 'card member name']);
            amountIndex = possibleAmountIndex !== -1 ? possibleAmountIndex : 4;
            creditIndex = findColumnIndex(headers, ['credit', 'credits', 'credit amount']);
            break;
        }
    }

    if (dataStartIndex === -1) {
        console.error('AMEX Excel file format is incorrect.');
        return [];
    }

    for (let i = dataStartIndex; i < excelData.length; i++) {
        const row = excelData[i];
        if (!Array.isArray(row) || row.length < 2 || !row[dateIndex]) {
            if (row && row.some(cell => String(cell ?? '').includes('Total'))) break;
            continue;
        }

        try {
            const date = parseAMEXDate(row[dateIndex]);

            if (!date || isNaN(date.getTime())) continue;

            const description = row[descriptionIndex] ? String(row[descriptionIndex]).trim() : '';
            const cardmember = cardmemberIndex !== -1 && row[cardmemberIndex] ? String(row[cardmemberIndex]).trim() : '';
            let name = description;
            if (cardmember) {
                name = description ? `${description} - ${cardmember}` : cardmember;
            }
            if (!name) continue;

            let expense = parseAmount(row[amountIndex]);
            if (creditIndex !== -1 && row[creditIndex] !== undefined && row[creditIndex] !== null) {
                const credit = parseAmount(row[creditIndex]);
                if (!isNaN(credit) && credit > 0) expense = -credit;
            }

            if (isNaN(expense)) continue;

            // Check for duplicates
            const isDuplicate = existingTransactions.some(t => {
                const tDate = new Date(t.date);
                const sameDate = tDate.getFullYear() === date.getFullYear() &&
                    tDate.getMonth() === date.getMonth() &&
                    tDate.getDate() === date.getDate();
                const sameName = t.name === name;
                const sameAmount = Math.abs(t.originalExpense - expense) < 0.01;
                return sameDate && sameName && sameAmount;
            });

            if (!isDuplicate) {
                newTransactions.push({
                    id: 'amex_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
                    date,
                    name,
                    expense,
                    originalExpense: expense,
                    isSplit: false,
                    isCompany: false,
                    person: DEFAULT_PERSON
                });
            }
        } catch (error) {
            continue;
        }
    }

    return newTransactions;
}

/**
 * Process ROGERS CSV file content
 * @param {string} csvContent - Raw CSV content
 * @param {Array} existingTransactions - Existing transactions to check for duplicates
 * @returns {Array} Array of new transaction objects
 */
export function processROGERSCSV(csvContent, existingTransactions = []) {
    const lines = csvContent.split('\n');
    const newTransactions = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
            // Parse CSV handling quoted values
            let columns = [];
            let currentCol = '';
            let inQuotes = false;

            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    columns.push(currentCol);
                    currentCol = '';
                } else {
                    currentCol += char;
                }
            }
            columns.push(currentCol);
            columns = columns.map(col => col.trim().replace(/^"|"$/g, ''));

            // Parse date (YYYY-MM-DD)
            let date = null;
            if (columns[0]) {
                const dateStr = columns[0].trim();
                const dateParts = dateStr.split('-');
                if (dateParts.length === 3) {
                    const year = parseInt(dateParts[0]);
                    const month = parseInt(dateParts[1]) - 1;
                    const day = parseInt(dateParts[2]);
                    if (!isNaN(year) && !isNaN(month) && !isNaN(day) &&
                        year >= 1900 && year <= 2100 &&
                        month >= 0 && month <= 11 &&
                        day >= 1 && day <= 31) {
                        date = new Date(year, month, day, 12, 0, 0);
                    }
                } else {
                    date = new Date(dateStr + 'T12:00:00');
                }
                if (!date || isNaN(date.getTime())) continue;
            } else {
                continue;
            }

            const merchantName = columns.length > 7 && columns[7] ? columns[7].trim() : 'Unknown Merchant';

            let expense = 0;
            if (columns.length > 12) {
                let amountStr = columns[12] ? String(columns[12]).trim() : '';
                if (!amountStr || amountStr === '-') {
                    expense = 0;
                } else {
                    amountStr = amountStr.replace(/\$|,/g, '');
                    const isNegative = amountStr.includes('-');
                    amountStr = amountStr.replace(/-/g, '');
                    expense = parseFloat(amountStr);
                    if (isNaN(expense)) expense = 0;
                    else if (isNegative) expense = -expense;
                }
            }

            // Check for duplicates
            const isDuplicate = existingTransactions.some(t => {
                const tDate = new Date(t.date);
                const sameDate = tDate.getFullYear() === date.getFullYear() &&
                    tDate.getMonth() === date.getMonth() &&
                    tDate.getDate() === date.getDate();
                const sameName = t.name === merchantName;
                const sameAmount = Math.abs(t.originalExpense - expense) < 0.01;
                return sameDate && sameName && sameAmount;
            });

            if (!isDuplicate) {
                newTransactions.push({
                    id: 'rogers_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
                    date,
                    name: merchantName,
                    expense,
                    originalExpense: expense,
                    isSplit: false,
                    isCompany: false,
                    person: DEFAULT_PERSON
                });
            }
        } catch (error) {
            continue;
        }
    }

    return newTransactions;
}

/**
 * Read file as text
 * @param {File} file - File object
 * @returns {Promise<string>} File content as text
 */
export function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

/**
 * Read file as ArrayBuffer
 * @param {File} file - File object
 * @returns {Promise<ArrayBuffer>} File content as ArrayBuffer
 */
export function readFileAsBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}
