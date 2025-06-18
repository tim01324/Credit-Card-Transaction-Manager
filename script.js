// Credit Card Expenses Manager - Enhanced JavaScript
// Global variables and DOM elements
let transactions = [];
let amexTransactions = [];
let rogersTransactions = [];
let manualTransactions = [];

// DOM Element cache
const getElement = (id) => document.getElementById(id);

const fileInput = getElement('visaCsvInput');
const amexFileInput = getElement('amexCsvInput');
const rogersFileInput = getElement('rogersCsvInput');

const tableBody = getElement('visaTableBody');
const amexTableBody = getElement('amexTableBody');
const rogersTableBody = getElement('rogersTableBody');
const manualTableBody = getElement('manualTableBody');

const totalAmountSpan = getElement('visaTotalAmount');
const amexTotalAmountSpan = getElement('amexTotalAmount');
const rogersTotalAmountSpan = getElement('rogersTotalAmount');
const manualTotalAmountSpan = getElement('manualTotalAmount');
const grandTotalAmountSpan = getElement('grandTotalAmount');

// Manual entry form elements
const manualDateInput = getElement('manualDate');
const manualNameInput = getElement('manualName');
const manualExpenseInput = getElement('manualExpense');
const addManualTransactionBtn = getElement('addManualTransactionBtn');

// Filter elements
const visaStartDateInput = getElement('visaStartDate');
const visaEndDateInput = getElement('visaEndDate');
const visaFilterBtn = getElement('visaFilterButton');
const visaClearFilterBtn = getElement('visaClearFilterButton');

const amexStartDateInput = getElement('amexStartDate');
const amexEndDateInput = getElement('amexEndDate');
const amexFilterBtn = getElement('amexFilterButton');
const amexClearFilterBtn = getElement('amexClearFilterButton');

const rogersStartDateInput = getElement('rogersStartDate');
const rogersEndDateInput = getElement('rogersEndDate');
const rogersFilterBtn = getElement('rogersFilterButton');
const rogersClearFilterBtn = getElement('rogersClearFilterButton');

// Utility functions for enhanced user experience
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // File Uploads
  fileInput.addEventListener('change', handleFileUpload);
  amexFileInput.addEventListener('change', handleAmexFileUpload);
  rogersFileInput.addEventListener('change', handleRogersFileUpload);

  // Filter Buttons
  visaFilterBtn.addEventListener('click', () => { renderTableWithFilters(); updateGrandTotal(); });
  amexFilterBtn.addEventListener('click', () => { renderAmexTableWithFilters(); updateGrandTotal(); });
  rogersFilterBtn.addEventListener('click', () => { renderRogersTableWithFilters(); updateGrandTotal(); });

  // Clear Filter Buttons
  visaClearFilterBtn.addEventListener('click', () => {
    visaStartDateInput.value = '';
    visaEndDateInput.value = '';
    renderTableWithFilters();
    updateGrandTotal();
  });
  amexClearFilterBtn.addEventListener('click', () => {
    amexStartDateInput.value = '';
    amexEndDateInput.value = '';
    renderAmexTableWithFilters();
    updateGrandTotal();
  });
  rogersClearFilterBtn.addEventListener('click', () => {
    rogersStartDateInput.value = '';
    rogersEndDateInput.value = '';
    renderRogersTableWithFilters();
    updateGrandTotal();
  });

  // Manual transaction event listener
  addManualTransactionBtn.addEventListener('click', handleAddManualTransaction);

  // PDF Export
  getElement('exportPdfBtn').addEventListener('click', exportToPdf);
});

// Promise-based file readers
function readFileAs(file, type) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    if (type === 'text') reader.readAsText(file);
    else if (type === 'buffer') reader.readAsArrayBuffer(file);
    else reject(new Error("Invalid file read type"));
  });
}

// --- FILE UPLOAD HANDLERS ---
async function handleFileUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  try {
    for (const file of files) {
      const csvContent = await readFileAs(file, 'text');
      processCSV(csvContent);
    }
    renderTableWithFilters();
    updateGrandTotal();
  } catch (error) {
    console.error(`Error processing VISA file: ${error.message}`);
  }
  e.target.value = '';
}

async function handleAmexFileUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  try {
    for (const file of files) {
      const data = await readFileAs(file, 'buffer');
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
      processAmexExcel(excelData);
    }
    renderAmexTableWithFilters();
    updateGrandTotal();
  } catch (error) {
    console.error(`Error processing AMEX file: ${error.message}`);
  }
  e.target.value = '';
}

async function handleRogersFileUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  try {
    for (const file of files) {
      const csvContent = await readFileAs(file, 'text');
      processRogersCSV(csvContent);
    }
    renderRogersTableWithFilters();
    updateGrandTotal();
  } catch (error) {
    console.error(`Error processing ROGERS file: ${error.message}`);
  }
  e.target.value = '';
}

// --- MANUAL TRANSACTION ---
function handleAddManualTransaction() {
  const dateValue = manualDateInput.value;
  const name = manualNameInput.value.trim();
  const expenseValue = manualExpenseInput.value;

  if (!dateValue || !name || !expenseValue) {
    return; // Silently fail
  }
  const expense = parseFloat(expenseValue);
  if (isNaN(expense) || expense <= 0) {
    return; // Silently fail
  }
  const parts = dateValue.split('-');
  if (parts.length !== 3) {
    console.log('Invalid date format for manual transaction');
    return; // Silently fail
  }

  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // JavaScript months are 0-indexed
  const day = parseInt(parts[2]);

  // Validate the date parts
  if (isNaN(year) || isNaN(month) || isNaN(day) ||
    year < 1900 || year > 2100 ||
    month < 0 || month > 11 ||
    day < 1 || day > 31) {
    console.log('Invalid date values for manual transaction');
    return; // Silently fail
  }

  const date = new Date(year, month, day, 12, 0, 0); // Use noon to avoid timezone issues
  if (isNaN(date.getTime())) {
    console.log('Failed to create date for manual transaction');
    return; // Silently fail
  }

  const newTransaction = {
    id: 'manual_' + Date.now(),
    date, name, expense,
    originalExpense: expense,
    isSplit: false,
    isCompany: false
  };

  console.log(`Adding MANUAL transaction: Date: ${formatDate(date)} (${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}), Name: ${name}, Amount: ${formatCurrency(expense)}`);

  manualTransactions.push(newTransaction);
  renderManualTable();
  updateGrandTotal();
  [manualDateInput, manualNameInput, manualExpenseInput].forEach(input => input.value = '');
}

// --- DATA PROCESSING ---
function processCSV(csvContent) {
  const lines = csvContent.split('\n');
  let processed = 0;
  let skipped = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const columns = line.split(',');
      if (columns.length < 3) {
        skipped++;
        continue;
      }

      // Parse date with enhanced validation
      let date = null;
      const dateStr = columns[0].trim();

      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length >= 3) {
          const month = parseInt(parts[0]) - 1; // JavaScript months are 0-indexed
          const day = parseInt(parts[1]);
          const year = parseInt(parts[2]);

          // Validate the date parts
          if (!isNaN(year) && !isNaN(month) && !isNaN(day) &&
            year >= 1900 && year <= 2100 &&
            month >= 0 && month <= 11 &&
            day >= 1 && day <= 31) {
            date = new Date(year, month, day, 12, 0, 0);
          }
        }
      } else {
        // Fallback for other date formats
        date = new Date(dateStr + 'T12:00:00');
      }

      if (!date || isNaN(date.getTime())) {
        console.log(`Invalid date format in VISA file: ${dateStr}`);
        skipped++;
        continue;
      }

      // Parse name
      const name = columns[1].trim();
      if (!name) {
        skipped++;
        continue;
      }

      // Parse expense
      const expense = parseFloat(columns[2].trim());
      if (isNaN(expense)) {
        skipped++;
        continue;
      }

      // Check for duplicate with more robust comparison
      const isDuplicate = transactions.some(t => {
        const sameDate = t.date.getFullYear() === date.getFullYear() &&
          t.date.getMonth() === date.getMonth() &&
          t.date.getDate() === date.getDate();
        const sameName = t.name === name;
        const sameAmount = Math.abs(t.originalExpense - expense) < 0.01;
        return sameDate && sameName && sameAmount;
      });

      if (!isDuplicate) {
        const newTransaction = {
          id: Date.now() + '_' + Math.random().toString(36).substring(2, 9),
          date: date,
          name: name,
          expense: expense,
          originalExpense: expense,
          isSplit: false,
          isCompany: false
        };

        console.log(`Adding VISA transaction: Date: ${formatDate(date)} (${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}), Name: ${name}, Amount: ${formatCurrency(expense)}`);

        transactions.push(newTransaction);
        processed++;
      } else {
        console.log(`Duplicate VISA transaction skipped: ${formatDate(date)}, ${name}, ${formatCurrency(expense)}`);
        skipped++;
      }
    } catch (error) {
      skipped++;
      continue;
    }
  }

  console.log(`VISA processing complete: ${processed} processed, ${skipped} skipped`);
}

function processAmexExcel(excelData) {
  if (excelData.length <= 17) {
    throw new Error('AMEX Excel file format is incorrect. Data should start from row 18.');
  }

  let processed = 0;
  let skipped = 0;

  // Start from row 18 (index 17)
  for (let i = 17; i < excelData.length; i++) {
    const row = excelData[i];
    if (!Array.isArray(row) || row.length < 5) {
      skipped++;
      continue;
    }

    try {
      // Parse date with enhanced validation
      let date = null;
      if (row[0]) {
        if (typeof row[0] === 'number') {
          // Excel serial date conversion
          date = new Date(Math.round((row[0] - 25569) * 86400 * 1000));
          // Set time to noon to avoid timezone issues
          date.setHours(12, 0, 0, 0);
        } else {
          const dateStr = String(row[0]).trim();
          date = new Date(dateStr + 'T12:00:00');
        }

        if (!date || isNaN(date.getTime())) {
          console.log(`Invalid date format in AMEX file: ${row[0]}`);
          skipped++;
          continue;
        }
      } else {
        skipped++;
        continue;
      }

      // Parse name
      const description = row[1] ? String(row[1]).trim() : '';
      const cardmember = row[3] ? String(row[3]).trim() : '';
      let name = description;
      if (cardmember) {
        name = description ? `${description} - ${cardmember}` : cardmember;
      }
      if (!name && !description) {
        skipped++;
        continue;
      }

      // Parse amount
      let expense = 0;
      if (row[4] !== undefined && row[4] !== null) {
        let amountStr = String(row[4]).trim();
        if (amountStr.startsWith('$')) {
          amountStr = amountStr.substring(1);
        }
        amountStr = amountStr.replace(/,/g, '');
        expense = parseFloat(amountStr);
      } else {
        skipped++;
        continue;
      }

      if (isNaN(expense)) {
        skipped++;
        continue;
      }

      expense = Math.abs(expense);

      // Check for duplicate with more robust comparison
      const isDuplicate = amexTransactions.some(t => {
        const sameDate = t.date.getFullYear() === date.getFullYear() &&
          t.date.getMonth() === date.getMonth() &&
          t.date.getDate() === date.getDate();
        const sameName = t.name === name;
        const sameAmount = Math.abs(t.originalExpense - expense) < 0.01;
        return sameDate && sameName && sameAmount;
      });

      if (!isDuplicate) {
        const newTransaction = {
          id: 'amex_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
          date: date,
          name: name,
          expense: expense,
          originalExpense: expense,
          isSplit: false,
          isCompany: false
        };

        console.log(`Adding AMEX transaction: Date: ${formatDate(date)} (${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}), Name: ${name}, Amount: ${formatCurrency(expense)}`);

        amexTransactions.push(newTransaction);
        processed++;
      } else {
        console.log(`Duplicate AMEX transaction skipped: ${formatDate(date)}, ${name}, ${formatCurrency(expense)}`);
        skipped++;
      }
    } catch (error) {
      skipped++;
      continue;
    }
  }

  if (skipped > 0) {
    console.log(`AMEX processing complete: ${processed} processed, ${skipped} skipped`);
  }

  updateAmexTotal(amexTransactions);
}

function processRogersCSV(csvContent) {
  const lines = csvContent.split('\n');
  let processed = 0;
  let skipped = 0;

  // Assuming the first line is the header, data starts from the second line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      continue;
    }

    try {
      // Split the CSV properly, handling quoted values containing commas
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

      // Clean up the columns
      columns = columns.map(col => col.trim().replace(/^"|"$/g, ''));

      // Parse date (YYYY-MM-DD) from column A
      let date = null;
      if (columns[0]) {
        const dateStr = columns[0].trim();
        const dateParts = dateStr.split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
          const day = parseInt(dateParts[2]);

          // Validate the date parts
          if (!isNaN(year) && !isNaN(month) && !isNaN(day) &&
            year >= 1900 && year <= 2100 &&
            month >= 0 && month <= 11 &&
            day >= 1 && day <= 31) {
            date = new Date(year, month, day, 12, 0, 0);
          }
        } else {
          // Fallback for other date formats
          date = new Date(dateStr + 'T12:00:00');
        }

        if (!date || isNaN(date.getTime())) {
          console.log(`Invalid date format in ROGERS file: ${dateStr}`);
          skipped++;
          continue;
        }
      } else {
        skipped++;
        continue;
      }

      // Merchant Name from column H
      const merchantName = columns.length > 7 && columns[7] ? columns[7].trim() : 'Unknown Merchant';

      // Amount from column M
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
          if (isNaN(expense)) {
            expense = 0;
          } else if (isNegative) {
            expense = -expense;
          }
        }
      } else {
        expense = 0;
      }

      // Check for duplicate with more robust comparison
      const isDuplicate = rogersTransactions.some(t => {
        const sameDate = t.date.getFullYear() === date.getFullYear() &&
          t.date.getMonth() === date.getMonth() &&
          t.date.getDate() === date.getDate();
        const sameName = t.name === merchantName;
        const sameAmount = Math.abs(t.originalExpense - expense) < 0.01;
        return sameDate && sameName && sameAmount;
      });

      if (!isDuplicate) {
        const newTransaction = {
          id: 'rogers_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
          date: date,
          name: merchantName,
          expense: expense,
          originalExpense: expense,
          isSplit: false,
          isCompany: false
        };

        console.log(`Adding ROGERS transaction: Date: ${formatDate(date)} (${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}), Merchant: ${merchantName}, Amount: ${formatCurrency(expense)}`);

        rogersTransactions.push(newTransaction);
        processed++;
      } else {
        console.log(`Duplicate ROGERS transaction skipped: ${formatDate(date)}, ${merchantName}, ${formatCurrency(expense)}`);
        skipped++;
      }
    } catch (error) {
      skipped++;
      continue;
    }
  }

  if (skipped > 0) {
    console.log(`ROGERS processing complete: ${processed} processed, ${skipped} skipped`);
  }

  updateRogersTotal(rogersTransactions);
}

// --- RENDERING LOGIC ---
function renderTableWithFilters() {
  const transactionsToRender = filterTransactions(transactions, visaStartDateInput.value, visaEndDateInput.value);
  renderTable(tableBody, transactionsToRender, renderTransaction);
  updateTotal(transactionsToRender);
}

function renderAmexTableWithFilters() {
  const transactionsToRender = filterTransactions(amexTransactions, amexStartDateInput.value, amexEndDateInput.value);
  renderTable(amexTableBody, transactionsToRender, renderAmexTransaction);
  updateAmexTotal(transactionsToRender);
}

function renderRogersTableWithFilters() {
  const transactionsToRender = filterTransactions(rogersTransactions, rogersStartDateInput.value, rogersEndDateInput.value);
  renderTable(rogersTableBody, transactionsToRender, renderRogersTransaction);
  updateRogersTotal(transactionsToRender);
}

function renderManualTable() {
  renderTable(manualTableBody, manualTransactions, renderManualTransaction);
  updateManualTotal(manualTransactions);
}

function filterTransactions(source, startDateValue, endDateValue) {
  let transactionsToRender = [...source];
  if (startDateValue) {
    const parts = startDateValue.split('-');
    const startDate = new Date(parts[0], parts[1] - 1, parts[2]);
    if (!isNaN(startDate.getTime())) {
      startDate.setHours(0, 0, 0, 0);
      transactionsToRender = transactionsToRender.filter(t => t.date && t.date >= startDate);
    }
  }
  if (endDateValue) {
    const parts = endDateValue.split('-');
    const endDate = new Date(parts[0], parts[1] - 1, parts[2]);
    if (!isNaN(endDate.getTime())) {
      endDate.setHours(23, 59, 59, 999);
      transactionsToRender = transactionsToRender.filter(t => t.date && t.date <= endDate);
    }
  }
  return transactionsToRender;
}

function renderTable(tbody, transactions, renderRowFunction) {
  tbody.innerHTML = '';
  transactions.sort((a, b) => b.date - a.date);
  transactions.forEach(renderRowFunction);
}

// --- INDIVIDUAL ROW RENDERERS ---
function createTransactionRow(transaction, toggleSplitFn, toggleCompanyFn, deleteFn) {
  const row = document.createElement('tr');
  row.innerHTML = `
        <td>${formatDate(transaction.date)}</td>
        <td title="${transaction.name}">${transaction.name}</td>
        <td style="font-weight: bold; color: ${transaction.isSplit ? 'var(--success-color)' : 'inherit'};">${formatCurrency(transaction.expense)}</td>
        <td><button class="btn-split ${transaction.isSplit ? 'active' : ''}" title="${transaction.isSplit ? 'Remove split' : 'Split expense'}">P</button></td>
        <td><button class="btn-company ${transaction.isCompany ? 'active' : ''}" title="${transaction.isCompany ? 'Remove company expense' : 'Mark as company expense'}">C</button></td>
        <td><button class="btn-delete" title="Delete transaction">Delete</button></td>
    `;
  row.querySelector('.btn-split').onclick = () => toggleSplitFn(transaction.id);
  row.querySelector('.btn-company').onclick = () => toggleCompanyFn(transaction.id);
  row.querySelector('.btn-delete').onclick = () => deleteFn(transaction.id);
  return row;
}

function renderTransaction(t) { tableBody.appendChild(createTransactionRow(t, toggleSplit, toggleCompany, deleteTransaction)); }
function renderAmexTransaction(t) { amexTableBody.appendChild(createTransactionRow(t, toggleAmexSplit, toggleAmexCompany, deleteAmexTransaction)); }
function renderRogersTransaction(t) { rogersTableBody.appendChild(createTransactionRow(t, toggleRogersSplit, toggleRogersCompany, deleteRogersTransaction)); }
function renderManualTransaction(t) { manualTableBody.appendChild(createTransactionRow(t, toggleManualSplit, toggleManualCompany, deleteManualTransaction)); }


// --- ACTIONS (DELETE, SPLIT & COMPANY) ---
function generalToggleSplit(id, transactionsArray, renderFn) {
  const transaction = transactionsArray.find(t => t.id === id);
  if (!transaction) return;
  transaction.isSplit = !transaction.isSplit;
  if (transaction.isSplit) {
    transaction.expense = transaction.originalExpense / 2;
  } else {
    transaction.expense = transaction.originalExpense;
  }
  renderFn();
  updateGrandTotal();
}

function generalToggleCompany(id, transactionsArray, renderFn) {
  const transaction = transactionsArray.find(t => t.id === id);
  if (!transaction) return;
  transaction.isCompany = !transaction.isCompany;
  renderFn();
  updateGrandTotal();
}

function generalDelete(id, transactionsArray, renderFn, typeName) {
  const transaction = transactionsArray.find(t => t.id === id);
  if (!transaction) return;
  if (confirm(`⚠️ Permanently delete this ${typeName} transaction?\n\n${formatDate(transaction.date)}\n${transaction.name}\n${formatCurrency(transaction.expense)}`)) {
    const index = transactionsArray.findIndex(t => t.id === id);
    transactionsArray.splice(index, 1);
    renderFn();
    updateGrandTotal();
  }
}

function toggleSplit(id) { generalToggleSplit(id, transactions, renderTableWithFilters); }
function toggleCompany(id) { generalToggleCompany(id, transactions, renderTableWithFilters); }
function deleteTransaction(id) { generalDelete(id, transactions, renderTableWithFilters, 'VISA'); }

function toggleAmexSplit(id) { generalToggleSplit(id, amexTransactions, renderAmexTableWithFilters); }
function toggleAmexCompany(id) { generalToggleCompany(id, amexTransactions, renderAmexTableWithFilters); }
function deleteAmexTransaction(id) { generalDelete(id, amexTransactions, renderAmexTableWithFilters, 'AMEX'); }

function toggleRogersSplit(id) { generalToggleSplit(id, rogersTransactions, renderRogersTableWithFilters); }
function toggleRogersCompany(id) { generalToggleCompany(id, rogersTransactions, renderRogersTableWithFilters); }
function deleteRogersTransaction(id) { generalDelete(id, rogersTransactions, renderRogersTableWithFilters, 'ROGERS'); }

function toggleManualSplit(id) { generalToggleSplit(id, manualTransactions, renderManualTable); }
function toggleManualCompany(id) { generalToggleCompany(id, manualTransactions, renderManualTable); }
function deleteManualTransaction(id) { generalDelete(id, manualTransactions, renderManualTable, 'MANUAL'); }


// --- TOTALS & GRAND TOTAL ---
function updateTotal(filtered) { totalAmountSpan.textContent = formatCurrency(filtered.reduce((sum, t) => sum + t.expense, 0)); }
function updateAmexTotal(filtered) { amexTotalAmountSpan.textContent = formatCurrency(filtered.reduce((sum, t) => sum + t.expense, 0)); }
function updateRogersTotal(filtered) { rogersTotalAmountSpan.textContent = formatCurrency(filtered.reduce((sum, t) => sum + t.expense, 0)); }
function updateManualTotal(filtered) { manualTotalAmountSpan.textContent = formatCurrency(filtered.reduce((sum, t) => sum + t.expense, 0)); }

function updateGrandTotal() {
  const totals = [
    totalAmountSpan, amexTotalAmountSpan, rogersTotalAmountSpan, manualTotalAmountSpan
  ].map(span => parseFloat(span.textContent.replace(/[^0-9.-]+/g, "")) || 0);
  const grandTotal = totals.reduce((sum, total) => sum + total, 0);
  grandTotalAmountSpan.textContent = formatCurrency(grandTotal);
}

// --- PDF EXPORT ---
function exportToPdf() {
  const { jsPDF } = window.jspdf;
  const autoTable = window.jspdf.plugin.autotable;
  const doc = new jsPDF();

  const addTransactionTableToPdf = (title, transactions, totalSpan, startY) => {
    if (transactions.length === 0) return startY;
    doc.text(title, 14, startY);

    // Separate personal and company transactions
    const personalTransactions = transactions.filter(t => !t.isCompany);
    const companyTransactions = transactions.filter(t => t.isCompany);

    let currentY = startY + 5;

    // Add personal transactions
    if (personalTransactions.length > 0) {
      doc.text('Personal Expenses:', 14, currentY);
      autoTable(doc, {
        head: [['Date', 'Name', 'Expenses', 'Split']],
        body: personalTransactions.map(t => [
          formatDate(t.date),
          t.name,
          formatCurrency(t.expense),
          t.isSplit ? 'Yes' : 'No'
        ]),
        startY: currentY + 5,
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { cellPadding: 2, fontSize: 8 }
      });
      currentY = doc.autoTable.previous.finalY + 10;
    }

    // Add company transactions
    if (companyTransactions.length > 0) {
      doc.text('Company Expenses:', 14, currentY);
      autoTable(doc, {
        head: [['Date', 'Name', 'Expenses', 'Split']],
        body: companyTransactions.map(t => [
          formatDate(t.date),
          t.name,
          formatCurrency(t.expense),
          t.isSplit ? 'Yes' : 'No'
        ]),
        startY: currentY + 5,
        headStyles: { fillColor: [52, 152, 219], textColor: 255 },
        styles: { cellPadding: 2, fontSize: 8 }
      });
      currentY = doc.autoTable.previous.finalY + 10;
    }

    // Add totals
    const personalTotal = personalTransactions.reduce((sum, t) => sum + t.expense, 0);
    const companyTotal = companyTransactions.reduce((sum, t) => sum + t.expense, 0);

    doc.text(`Personal Total: ${formatCurrency(personalTotal)}`, 14, currentY);
    doc.text(`Company Total: ${formatCurrency(companyTotal)}`, 14, currentY + 10);
    doc.text(`${title} Total: ${totalSpan.textContent}`, 14, currentY + 20);

    return currentY + 35;
  };

  let currentY = 20;
  currentY = addTransactionTableToPdf('VISA Transactions', transactions, totalAmountSpan, currentY);

  if (amexTransactions.length > 0) {
    doc.addPage();
    currentY = 20;
  }
  currentY = addTransactionTableToPdf('AMEX Transactions', amexTransactions, amexTotalAmountSpan, currentY);

  if (rogersTransactions.length > 0) {
    doc.addPage();
    currentY = 20;
  }
  currentY = addTransactionTableToPdf('ROGERS Transactions', rogersTransactions, rogersTotalAmountSpan, currentY);

  if (manualTransactions.length > 0) {
    doc.addPage();
    currentY = 20;
  }
  addTransactionTableToPdf('Manual Transactions', manualTransactions, manualTotalAmountSpan, currentY);

  doc.save(`Credit_Card_Expenses_${new Date().toISOString().slice(0, 10)}.pdf`);
} 