import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

/**
 * Export transactions to PDF
 * @param {Object} params - Export parameters
 * @param {Array} params.visaTransactions - VISA transactions
 * @param {Array} params.amexTransactions - AMEX transactions
 * @param {Array} params.rogersTransactions - ROGERS transactions
 * @param {Array} params.manualTransactions - Manual transactions
 * @param {Object} params.filters - Date filters for each card type
 */
export function exportToPdf({ visaTransactions, amexTransactions, rogersTransactions, manualTransactions, filters }) {
    const doc = new jsPDF();

    const addPdfHeader = (doc) => {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Credit Card Expense Report', 14, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`, 14, 30);

        const filterInfo = [];
        if (filters.visa?.startDate || filters.visa?.endDate) {
            filterInfo.push(`VISA: ${filters.visa?.startDate || 'No start'} to ${filters.visa?.endDate || 'No end'}`);
        }
        if (filters.amex?.startDate || filters.amex?.endDate) {
            filterInfo.push(`AMEX: ${filters.amex?.startDate || 'No start'} to ${filters.amex?.endDate || 'No end'}`);
        }
        if (filters.rogers?.startDate || filters.rogers?.endDate) {
            filterInfo.push(`ROGERS: ${filters.rogers?.startDate || 'No start'} to ${filters.rogers?.endDate || 'No end'}`);
        }

        if (filterInfo.length > 0) {
            doc.text('Date Filters Applied:', 14, 40);
            filterInfo.forEach((info, index) => {
                doc.text(`• ${info}`, 20, 46 + (index * 6));
            });
            return 52 + (filterInfo.length * 6);
        }

        return 40;
    };

    const addTransactionTableToPdf = (title, transactions, startY) => {
        if (transactions.length === 0) return startY;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, startY);
        doc.setLineWidth(0.5);
        doc.line(14, startY + 2, 196, startY + 2);

        const personalTransactions = transactions.filter(t => !t.isCompany);
        const companyTransactions = transactions.filter(t => t.isCompany);

        let currentY = startY + 10;

        if (personalTransactions.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Personal Expenses', 14, currentY);

            doc.autoTable({
                head: [['Date', 'Description', 'Amount', 'Split']],
                body: personalTransactions.map(t => [
                    formatDate(new Date(t.date)),
                    t.name,
                    formatCurrency(t.expense),
                    t.isSplit ? 'Yes' : 'No'
                ]),
                startY: currentY + 5,
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                styles: {
                    cellPadding: 4,
                    fontSize: 9,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1
                },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 30 },
                    1: { halign: 'left', cellWidth: 80 },
                    2: { halign: 'right', cellWidth: 30 },
                    3: { halign: 'center', cellWidth: 20 }
                },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });
            currentY = doc.autoTable.previous.finalY + 8;
        }

        if (companyTransactions.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Company Expenses', 14, currentY);

            doc.autoTable({
                head: [['Date', 'Description', 'Amount', 'Split']],
                body: companyTransactions.map(t => [
                    formatDate(new Date(t.date)),
                    t.name,
                    formatCurrency(t.expense),
                    t.isSplit ? 'Yes' : 'No'
                ]),
                startY: currentY + 5,
                headStyles: {
                    fillColor: [52, 152, 219],
                    textColor: 255,
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                styles: {
                    cellPadding: 4,
                    fontSize: 9,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1
                },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 30 },
                    1: { halign: 'left', cellWidth: 80 },
                    2: { halign: 'right', cellWidth: 30 },
                    3: { halign: 'center', cellWidth: 20 }
                },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });
            currentY = doc.autoTable.previous.finalY + 8;
        }

        const personalTotal = personalTransactions.reduce((sum, t) => sum + t.expense, 0);
        const companyTotal = companyTransactions.reduce((sum, t) => sum + t.expense, 0);
        const sectionTotal = personalTotal + companyTotal;

        doc.setFillColor(248, 249, 250);
        doc.rect(14, currentY, 182, 25, 'F');
        doc.setLineWidth(0.2);
        doc.rect(14, currentY, 182, 25, 'S');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Personal Total: ${formatCurrency(personalTotal)}`, 20, currentY + 8);
        doc.text(`Company Total: ${formatCurrency(companyTotal)}`, 20, currentY + 16);

        doc.setFont('helvetica', 'bold');
        doc.text(`${title} Total: ${formatCurrency(sectionTotal)}`, 20, currentY + 22);

        return currentY + 35;
    };

    let currentY = addPdfHeader(doc);
    currentY += 10;

    if (visaTransactions.length > 0) {
        currentY = addTransactionTableToPdf('VISA Transactions', visaTransactions, currentY);
    }

    if (amexTransactions.length > 0) {
        if (currentY > 200) {
            doc.addPage();
            currentY = 20;
        }
        currentY = addTransactionTableToPdf('AMEX Transactions', amexTransactions, currentY);
    }

    if (rogersTransactions.length > 0) {
        if (currentY > 200) {
            doc.addPage();
            currentY = 20;
        }
        currentY = addTransactionTableToPdf('ROGERS Transactions', rogersTransactions, currentY);
    }

    if (manualTransactions.length > 0) {
        if (currentY > 200) {
            doc.addPage();
            currentY = 20;
        }
        currentY = addTransactionTableToPdf('Manual Transactions', manualTransactions, currentY);
    }

    // Grand Total
    if (currentY > 220) {
        doc.addPage();
        currentY = 20;
    }

    currentY += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('GRAND TOTAL SUMMARY', 14, currentY);
    doc.setLineWidth(0.8);
    doc.line(14, currentY + 2, 196, currentY + 2);

    currentY += 15;

    const allTransactions = [...visaTransactions, ...amexTransactions, ...rogersTransactions, ...manualTransactions];
    const visaTotal = visaTransactions.reduce((sum, t) => sum + t.expense, 0);
    const amexTotal = amexTransactions.reduce((sum, t) => sum + t.expense, 0);
    const rogersTotal = rogersTransactions.reduce((sum, t) => sum + t.expense, 0);
    const manualTotal = manualTransactions.reduce((sum, t) => sum + t.expense, 0);
    const grandTotal = visaTotal + amexTotal + rogersTotal + manualTotal;

    const totalCompanyExpenses = allTransactions.filter(t => t.isCompany).reduce((sum, t) => sum + t.expense, 0);
    const totalPersonalExpenses = grandTotal - totalCompanyExpenses;

    doc.setFillColor(240, 248, 255);
    doc.rect(14, currentY, 182, 45, 'F');
    doc.setLineWidth(0.3);
    doc.rect(14, currentY, 182, 45, 'S');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    if (visaTotal > 0) doc.text(`VISA Total: ${formatCurrency(visaTotal)}`, 20, currentY + 8);
    if (amexTotal > 0) doc.text(`AMEX Total: ${formatCurrency(amexTotal)}`, 20, currentY + 16);
    if (rogersTotal > 0) doc.text(`ROGERS Total: ${formatCurrency(rogersTotal)}`, 20, currentY + 24);
    if (manualTotal > 0) doc.text(`Manual Total: ${formatCurrency(manualTotal)}`, 20, currentY + 32);

    doc.setFont('helvetica', 'bold');
    doc.text(`Total Personal Expenses: ${formatCurrency(totalPersonalExpenses)}`, 20, currentY + 40);
    if (totalCompanyExpenses > 0) {
        doc.text(`Total Company Expenses: ${formatCurrency(totalCompanyExpenses)}`, 110, currentY + 40);
    }

    currentY += 55;
    doc.setFillColor(34, 139, 34);
    doc.rect(14, currentY, 182, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`GRAND TOTAL: ${formatCurrency(grandTotal)}`, 20, currentY + 10);

    doc.save(`Credit_Card_Expenses_${new Date().toISOString().slice(0, 10)}.pdf`);
}
