import * as XLSX from 'xlsx';

export function exportToCSV(transactions, filename = 'transactions') {
    if (transactions.length === 0) {
        return false;
    }

    const headers = ['Date', 'Name', 'Amount', 'Original Amount', 'Is Split', 'Is Company', 'Category'];
    const rows = transactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.name,
        t.expense.toFixed(2),
        t.originalExpense.toFixed(2),
        t.isSplit ? 'Yes' : 'No',
        t.isCompany ? 'Yes' : 'No',
        t.category || 'Uncategorized'
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
}

export function exportToExcel(allTransactions, filename = 'credit-card-expenses') {
    const { visa, amex, rogers, manual } = allTransactions;

    const formatSheet = (transactions, sheetName) => {
        if (transactions.length === 0) {
            return [['No transactions']];
        }

        const headers = ['Date', 'Name', 'Amount', 'Original Amount', 'Is Split', 'Is Company', 'Category'];
        const rows = transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.name,
            t.expense,
            t.originalExpense,
            t.isSplit ? 'Yes' : 'No',
            t.isCompany ? 'Yes' : 'No',
            t.category || 'Uncategorized'
        ]);

        return [headers, ...rows];
    };

    const workbook = XLSX.utils.book_new();

    // Add each card type as a sheet
    const visaSheet = XLSX.utils.aoa_to_sheet(formatSheet(visa, 'VISA'));
    XLSX.utils.book_append_sheet(workbook, visaSheet, 'VISA');

    const amexSheet = XLSX.utils.aoa_to_sheet(formatSheet(amex, 'AMEX'));
    XLSX.utils.book_append_sheet(workbook, amexSheet, 'AMEX');

    const rogersSheet = XLSX.utils.aoa_to_sheet(formatSheet(rogers, 'ROGERS'));
    XLSX.utils.book_append_sheet(workbook, rogersSheet, 'ROGERS');

    const manualSheet = XLSX.utils.aoa_to_sheet(formatSheet(manual, 'Manual'));
    XLSX.utils.book_append_sheet(workbook, manualSheet, 'Manual');

    // Add summary sheet
    const totalVisa = visa.reduce((sum, t) => sum + t.expense, 0);
    const totalAmex = amex.reduce((sum, t) => sum + t.expense, 0);
    const totalRogers = rogers.reduce((sum, t) => sum + t.expense, 0);
    const totalManual = manual.reduce((sum, t) => sum + t.expense, 0);
    const grandTotal = totalVisa + totalAmex + totalRogers + totalManual;

    const summaryData = [
        ['Summary'],
        [''],
        ['Card Type', 'Count', 'Total'],
        ['VISA', visa.length, totalVisa],
        ['AMEX', amex.length, totalAmex],
        ['ROGERS', rogers.length, totalRogers],
        ['Manual', manual.length, totalManual],
        [''],
        ['Grand Total', visa.length + amex.length + rogers.length + manual.length, grandTotal]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Write file
    XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);

    return true;
}
