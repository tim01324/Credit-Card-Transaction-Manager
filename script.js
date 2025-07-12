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

// Company Total Spans
const visaCompanyTotalAmountSpan = getElement('visaCompanyTotalAmount');
const amexCompanyTotalAmountSpan = getElement('amexCompanyTotalAmount');
const rogersCompanyTotalAmountSpan = getElement('rogersCompanyTotalAmount');
const manualCompanyTotalAmountSpan = getElement('manualCompanyTotalAmount');
const companyGrandTotalAmountSpan = getElement('companyGrandTotalAmount');
const clearAllDataBtn = getElement('clearAllDataBtn');

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

// Ensure all existing transactions have isCompany property
function initializeTransactions() {
  [transactions, amexTransactions, rogersTransactions, manualTransactions].forEach(transactionArray => {
    transactionArray.forEach(transaction => {
      if (transaction.isCompany === undefined) {
        transaction.isCompany = false;
      }
    });
  });
}

// Force refresh all tables
function forceRefreshAllTables() {
  console.log('Forcing refresh of all tables...');
  initializeTransactions();
  renderTableWithFilters();
  renderAmexTableWithFilters();
  renderRogersTableWithFilters();
  renderManualTable();
  updateGrandTotal();
  console.log('All tables refreshed!');
}

// Global debug function - can be called from browser console
window.fixTables = function () {
  console.log('--- Manual Table Fix Initiated ---');

  // Force add isCompany to all transactions
  [transactions, amexTransactions, rogersTransactions, manualTransactions].forEach((arr, index) => {
    const names = ['VISA', 'AMEX', 'ROGERS', 'MANUAL'];
    console.log(`Fixing ${arr.length} ${names[index]} transactions...`);
    arr.forEach(t => {
      if (typeof t.isCompany !== 'boolean') {
        t.isCompany = false;
        console.log(` -> Added 'isCompany' to: ${t.name}`);
      }
    });
  });

  forceRefreshAllTables();
  console.log('--- Manual Fix Complete! Please check your tables now. ---');
};

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Load data from localStorage first
  loadTransactionsFromLocalStorage();

  // Load filter settings from localStorage
  const filtersLoaded = loadFilterSettingsFromLocalStorage();

  // Initialize existing transactions
  initializeTransactions();

  // Force refresh all tables to ensure proper display
  setTimeout(() => {
    forceRefreshAllTables();

    // If filters were loaded, apply them after tables are refreshed
    if (filtersLoaded) {
      console.log('Applying saved filters...');
      renderTableWithFilters();
      renderAmexTableWithFilters();
      renderRogersTableWithFilters();
      updateGrandTotal();
    }
  }, 100);

  // File Uploads
  fileInput.addEventListener('change', handleFileUpload);
  amexFileInput.addEventListener('change', handleAmexFileUpload);
  rogersFileInput.addEventListener('change', handleRogersFileUpload);

  // Filter Buttons
  visaFilterBtn.addEventListener('click', () => {
    renderTableWithFilters();
    updateGrandTotal();
    saveFilterSettingsToLocalStorage();
  });
  amexFilterBtn.addEventListener('click', () => {
    renderAmexTableWithFilters();
    updateGrandTotal();
    saveFilterSettingsToLocalStorage();
  });
  rogersFilterBtn.addEventListener('click', () => {
    renderRogersTableWithFilters();
    updateGrandTotal();
    saveFilterSettingsToLocalStorage();
  });

  // Clear Filter Buttons
  visaClearFilterBtn.addEventListener('click', () => {
    visaStartDateInput.value = '';
    visaEndDateInput.value = '';
    renderTableWithFilters();
    updateGrandTotal();
    saveFilterSettingsToLocalStorage();
  });
  amexClearFilterBtn.addEventListener('click', () => {
    amexStartDateInput.value = '';
    amexEndDateInput.value = '';
    renderAmexTableWithFilters();
    updateGrandTotal();
    saveFilterSettingsToLocalStorage();
  });
  rogersClearFilterBtn.addEventListener('click', () => {
    rogersStartDateInput.value = '';
    rogersEndDateInput.value = '';
    renderRogersTableWithFilters();
    updateGrandTotal();
    saveFilterSettingsToLocalStorage();
  });

  // Manual transaction event listener
  addManualTransactionBtn.addEventListener('click', handleAddManualTransaction);

  // PDF Export
  getElement('exportPdfBtn').addEventListener('click', exportToPdf);

  // Auto-save filter settings when date inputs change and apply filters
  visaStartDateInput.addEventListener('change', () => {
    saveFilterSettingsToLocalStorage();
    renderTableWithFilters();
    updateGrandTotal();
  });
  visaEndDateInput.addEventListener('change', () => {
    saveFilterSettingsToLocalStorage();
    renderTableWithFilters();
    updateGrandTotal();
  });
  amexStartDateInput.addEventListener('change', () => {
    saveFilterSettingsToLocalStorage();
    renderAmexTableWithFilters();
    updateGrandTotal();
  });
  amexEndDateInput.addEventListener('change', () => {
    saveFilterSettingsToLocalStorage();
    renderAmexTableWithFilters();
    updateGrandTotal();
  });
  rogersStartDateInput.addEventListener('change', () => {
    saveFilterSettingsToLocalStorage();
    renderRogersTableWithFilters();
    updateGrandTotal();
  });
  rogersEndDateInput.addEventListener('change', () => {
    saveFilterSettingsToLocalStorage();
    renderRogersTableWithFilters();
    updateGrandTotal();
  });

  // Other Actions
  clearAllDataBtn.addEventListener('click', clearAllData);
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
    saveTransactionsToLocalStorage();
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
    saveTransactionsToLocalStorage();
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
    saveTransactionsToLocalStorage();
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
  saveTransactionsToLocalStorage();
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
  let processed = 0;
  let skipped = 0;
  let headerFound = false;
  let dataStartIndex = -1;

  // Find the header row dynamically
  for (let i = 0; i < excelData.length; i++) {
    const row = excelData[i];
    if (Array.isArray(row) && row.length > 1 &&
      String(row[0]).trim() === 'Date' &&
      String(row[1]).trim() === 'Description') {
      dataStartIndex = i + 1;
      headerFound = true;
      break;
    }
  }

  if (!headerFound) {
    console.error('AMEX Excel file format is incorrect. Could not find transaction header row.');
    alert('AMEX file format error: Could not find the transaction header row (expected "Date" and "Description").');
    return;
  }

  // Start from the row after the header
  for (let i = dataStartIndex; i < excelData.length; i++) {
    const row = excelData[i];
    if (!Array.isArray(row) || row.length < 2 || !row[0]) {
      // Stop if we reach the end of the transactions
      if (row && row.length > 0 && String(row[0]).includes('Total')) {
        break;
      }
      skipped++;
      continue;
    }

    try {
      // Parse date with enhanced validation
      let date = null;
      if (row[0]) {
        const dateStr = String(row[0]).trim();

        // Month name map for parsing
        const monthMap = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };

        if (typeof row[0] === 'number') {
          // Excel serial date conversion
          date = new Date(Date.UTC(1900, 0, row[0] - 1, 12, 0, 0));
        } else {
          // Replace all dots and commas, and split by one or more whitespace characters
          const parts = dateStr.replace(/[.,]/g, '').split(/\s+/);

          console.log(`[AMEX Debug] Original: "${dateStr}", Cleaned Parts:`, parts);

          if (parts.length === 3 && parts[1].slice(0, 3) in monthMap) {
            const day = parseInt(parts[0], 10);
            const monthKey = parts[1].slice(0, 3);
            const month = monthMap[monthKey];
            const year = parseInt(parts[2], 10);

            console.log(`[AMEX Debug] Parsed -> Day: ${day}, MonthKey: "${monthKey}", Month: ${month}, Year: ${year}`);

            if (!isNaN(day) && month !== undefined && !isNaN(year)) {
              date = new Date(Date.UTC(year, month, day, 12, 0, 0));
              console.log(`[AMEX Debug] Successfully created Date:`, date.toUTCString());
            } else {
              console.error(`[AMEX Debug] Parsing of parts failed. day, month, or year is NaN or undefined.`);
            }
          } else {
            console.warn(`[AMEX Debug] Fallback to ISO parsing for: "${dateStr}"`);
            date = new Date(dateStr + 'T12:00:00Z');
          }
        }

        if (!date || isNaN(date.getTime())) {
          console.error(`AMEX Date Parse Fail: Original='${row[0]}'. The final date object was invalid.`);
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
        // Handle credits which might be negative or in a separate column in some formats
        if (row[5] !== undefined && row[5] !== null) {
          let creditStr = String(row[5]).trim().replace(/,/g, '');
          if (parseFloat(creditStr) > 0) {
            amountStr = `-${creditStr}`;
          }
        }
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
  updateCompanyTotal(amexTransactions, amexCompanyTotalAmountSpan);
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
  updateCompanyTotal(rogersTransactions, rogersCompanyTotalAmountSpan);
}

// --- RENDERING LOGIC ---
function renderTableWithFilters() {
  const transactionsToRender = filterTransactions(transactions, visaStartDateInput.value, visaEndDateInput.value);
  renderTable(tableBody, transactionsToRender, renderTransaction);
  updateTotal(transactionsToRender);
  updateCompanyTotal(transactionsToRender, visaCompanyTotalAmountSpan);
}

function renderAmexTableWithFilters() {
  const transactionsToRender = filterTransactions(amexTransactions, amexStartDateInput.value, amexEndDateInput.value);
  renderTable(amexTableBody, transactionsToRender, renderAmexTransaction);
  updateAmexTotal(transactionsToRender);
  updateCompanyTotal(transactionsToRender, amexCompanyTotalAmountSpan);
}

function renderRogersTableWithFilters() {
  const transactionsToRender = filterTransactions(rogersTransactions, rogersStartDateInput.value, rogersEndDateInput.value);
  renderTable(rogersTableBody, transactionsToRender, renderRogersTransaction);
  updateRogersTotal(transactionsToRender);
  updateCompanyTotal(transactionsToRender, rogersCompanyTotalAmountSpan);
}

function renderManualTable() {
  renderTable(manualTableBody, manualTransactions, renderManualTransaction);
  updateManualTotal(manualTransactions);
  updateCompanyTotal(manualTransactions, manualCompanyTotalAmountSpan);
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
  // 確保向後兼容
  if (typeof transaction.isCompany !== 'boolean') {
    transaction.isCompany = false;
  }

  const row = document.createElement('tr');

  // 創建所有單元格
  const dateCell = `<td>${formatDate(transaction.date)}</td>`;
  const nameCell = `<td title="${transaction.name}">${transaction.name}</td>`;
  const expenseCell = `<td style="font-weight: bold; color: ${transaction.isSplit ? 'var(--success-color)' : 'inherit'};">${formatCurrency(transaction.expense)}</td>`;

  // 創建按鈕
  const splitButton = `<button class="btn-split ${transaction.isSplit ? 'active' : ''}" title="${transaction.isSplit ? 'Remove split' : 'Split expense'}">P</button>`;
  const companyButton = `<button class="btn-company ${transaction.isCompany ? 'active' : ''}" title="${transaction.isCompany ? 'Remove company expense' : 'Mark as company expense'}">C</button>`;
  const deleteButton = `<button class="btn-delete" title="Delete transaction">Delete</button>`;

  // 組合HTML
  row.innerHTML = `
      ${dateCell}
      ${nameCell}
      ${expenseCell}
      <td>${splitButton}</td>
      <td>${companyButton}</td>
      <td>${deleteButton}</td>
  `;

  // 綁定事件
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
  saveTransactionsToLocalStorage();
}

function generalToggleCompany(id, transactionsArray, renderFn) {
  const transaction = transactionsArray.find(t => t.id === id);
  if (transaction) {
    transaction.isCompany = !transaction.isCompany;
    renderFn();
    updateGrandTotal();
    saveTransactionsToLocalStorage();
  }
}

function generalDelete(id, transactionsArray, renderFn, typeName) {
  const transaction = transactionsArray.find(t => t.id === id);
  if (!transaction) return;
  if (confirm(`⚠️ Permanently delete this ${typeName} transaction?\n\n${formatDate(transaction.date)}\n${transaction.name}\n${formatCurrency(transaction.expense)}`)) {
    const index = transactionsArray.findIndex(t => t.id === id);
    transactionsArray.splice(index, 1);
    renderFn();
    updateGrandTotal();
    saveTransactionsToLocalStorage();
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
function updateTotal(filtered) {
  const total = filtered.reduce((sum, t) => sum + t.expense, 0);
  totalAmountSpan.textContent = formatCurrency(total);
}
function updateAmexTotal(filtered) {
  const total = filtered.reduce((sum, t) => sum + t.expense, 0);
  amexTotalAmountSpan.textContent = formatCurrency(total);
}
function updateRogersTotal(filtered) {
  const total = filtered.reduce((sum, t) => sum + t.expense, 0);
  rogersTotalAmountSpan.textContent = formatCurrency(total);
}
function updateManualTotal(filtered) {
  const total = filtered.reduce((sum, t) => sum + t.expense, 0);
  manualTotalAmountSpan.textContent = formatCurrency(total);
}

function updateCompanyTotal(filtered, span) {
  const companyTotal = filtered.filter(t => t.isCompany).reduce((sum, t) => sum + t.expense, 0);
  span.textContent = formatCurrency(companyTotal);
}

function updateCompanyTotalVisibility() {
  // Check if any transaction is marked as company
  const hasCompanyTransactions =
    transactions.some(t => t.isCompany) ||
    amexTransactions.some(t => t.isCompany) ||
    rogersTransactions.some(t => t.isCompany) ||
    manualTransactions.some(t => t.isCompany);

  // Show/hide individual company total containers
  const visaContainer = document.getElementById('visaCompanyTotalContainer');
  const amexContainer = document.getElementById('amexCompanyTotalContainer');
  const rogersContainer = document.getElementById('rogersCompanyTotalContainer');
  const manualContainer = document.getElementById('manualCompanyTotalContainer');
  const grandContainer = document.getElementById('companyGrandTotalContainer');

  if (hasCompanyTransactions) {
    visaContainer.style.display = transactions.some(t => t.isCompany) ? 'block' : 'none';
    amexContainer.style.display = amexTransactions.some(t => t.isCompany) ? 'block' : 'none';
    rogersContainer.style.display = rogersTransactions.some(t => t.isCompany) ? 'block' : 'none';
    manualContainer.style.display = manualTransactions.some(t => t.isCompany) ? 'block' : 'none';
    grandContainer.style.display = 'block';
  } else {
    visaContainer.style.display = 'none';
    amexContainer.style.display = 'none';
    rogersContainer.style.display = 'none';
    manualContainer.style.display = 'none';
    grandContainer.style.display = 'none';
  }
}

function updateGrandTotal() {
  // We get the totals directly from the displayed text content for simplicity and consistency.
  const parseCurrency = (text) => parseFloat(text.replace(/[^0-9.-]+/g, "")) || 0;

  const visaTotal = parseCurrency(totalAmountSpan.textContent);
  const amexTotal = parseCurrency(amexTotalAmountSpan.textContent);
  const rogersTotal = parseCurrency(rogersTotalAmountSpan.textContent);
  const manualTotal = parseCurrency(manualTotalAmountSpan.textContent);

  const visaCompany = parseCurrency(visaCompanyTotalAmountSpan.textContent);
  const amexCompany = parseCurrency(amexCompanyTotalAmountSpan.textContent);
  const rogersCompany = parseCurrency(rogersCompanyTotalAmountSpan.textContent);
  const manualCompany = parseCurrency(manualCompanyTotalAmountSpan.textContent);

  const grandTotal = visaTotal + amexTotal + rogersTotal + manualTotal;
  const totalCompany = visaCompany + amexCompany + rogersCompany + manualCompany;

  grandTotalAmountSpan.textContent = formatCurrency(grandTotal);
  companyGrandTotalAmountSpan.textContent = formatCurrency(totalCompany);

  // Update company total visibility
  updateCompanyTotalVisibility();
}

// --- PDF EXPORT ---
function exportToPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add professional header
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

    // Add filter information if any filters are applied
    const filterInfo = [];
    if (visaStartDateInput.value || visaEndDateInput.value) {
      filterInfo.push(`VISA: ${visaStartDateInput.value || 'No start'} to ${visaEndDateInput.value || 'No end'}`);
    }
    if (amexStartDateInput.value || amexEndDateInput.value) {
      filterInfo.push(`AMEX: ${amexStartDateInput.value || 'No start'} to ${amexEndDateInput.value || 'No end'}`);
    }
    if (rogersStartDateInput.value || rogersEndDateInput.value) {
      filterInfo.push(`ROGERS: ${rogersStartDateInput.value || 'No start'} to ${rogersEndDateInput.value || 'No end'}`);
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

  const addTransactionTableToPdf = (title, transactions, totalSpan, startY) => {
    if (transactions.length === 0) return startY;

    // Add section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, startY);

    // Add line under title
    doc.setLineWidth(0.5);
    doc.line(14, startY + 2, 196, startY + 2);

    // Separate personal and company transactions
    const personalTransactions = transactions.filter(t => !t.isCompany);
    const companyTransactions = transactions.filter(t => t.isCompany);

    let currentY = startY + 10;

    // Add personal transactions
    if (personalTransactions.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Personal Expenses', 14, currentY);

      doc.autoTable({
        head: [['Date', 'Description', 'Amount', 'Split']],
        body: personalTransactions.map(t => [
          formatDate(t.date),
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

    // Add company transactions
    if (companyTransactions.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Company Expenses', 14, currentY);

      doc.autoTable({
        head: [['Date', 'Description', 'Amount', 'Split']],
        body: companyTransactions.map(t => [
          formatDate(t.date),
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

    // Add section totals in a professional box
    const personalTotal = personalTransactions.reduce((sum, t) => sum + t.expense, 0);
    const companyTotal = companyTransactions.reduce((sum, t) => sum + t.expense, 0);
    const sectionTotal = personalTotal + companyTotal;

    // Draw totals box
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

  // Apply the same filters that are used in the UI
  const filteredVisaTransactions = filterTransactions(transactions, visaStartDateInput.value, visaEndDateInput.value);
  const filteredAmexTransactions = filterTransactions(amexTransactions, amexStartDateInput.value, amexEndDateInput.value);
  const filteredRogersTransactions = filterTransactions(rogersTransactions, rogersStartDateInput.value, rogersEndDateInput.value);
  const filteredManualTransactions = manualTransactions; // Manual transactions don't have date filters

  // Add header
  let currentY = addPdfHeader(doc);
  currentY += 10;

  // Add transaction sections
  if (filteredVisaTransactions.length > 0) {
    currentY = addTransactionTableToPdf('VISA Transactions', filteredVisaTransactions, totalAmountSpan, currentY);
  }

  if (filteredAmexTransactions.length > 0) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }
    currentY = addTransactionTableToPdf('AMEX Transactions', filteredAmexTransactions, amexTotalAmountSpan, currentY);
  }

  if (filteredRogersTransactions.length > 0) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }
    currentY = addTransactionTableToPdf('ROGERS Transactions', filteredRogersTransactions, rogersTotalAmountSpan, currentY);
  }

  if (filteredManualTransactions.length > 0) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }
    currentY = addTransactionTableToPdf('Manual Transactions', filteredManualTransactions, manualTotalAmountSpan, currentY);
  }

  // Add Grand Total section
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  currentY += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GRAND TOTAL SUMMARY', 14, currentY);

  // Add line under title
  doc.setLineWidth(0.8);
  doc.line(14, currentY + 2, 196, currentY + 2);

  currentY += 15;

  // Calculate all totals
  const parseCurrency = (text) => parseFloat(text.replace(/[^0-9.-]+/g, "")) || 0;
  const visaTotal = parseCurrency(totalAmountSpan.textContent);
  const amexTotal = parseCurrency(amexTotalAmountSpan.textContent);
  const rogersTotal = parseCurrency(rogersTotalAmountSpan.textContent);
  const manualTotal = parseCurrency(manualTotalAmountSpan.textContent);
  const grandTotal = visaTotal + amexTotal + rogersTotal + manualTotal;

  // Company totals
  const visaCompanyTotal = parseCurrency(visaCompanyTotalAmountSpan.textContent);
  const amexCompanyTotal = parseCurrency(amexCompanyTotalAmountSpan.textContent);
  const rogersCompanyTotal = parseCurrency(rogersCompanyTotalAmountSpan.textContent);
  const manualCompanyTotal = parseCurrency(manualCompanyTotalAmountSpan.textContent);
  const totalCompanyExpenses = visaCompanyTotal + amexCompanyTotal + rogersCompanyTotal + manualCompanyTotal;
  const totalPersonalExpenses = grandTotal - totalCompanyExpenses;

  // Draw grand total box
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

  // Add personal vs company breakdown
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Personal Expenses: ${formatCurrency(totalPersonalExpenses)}`, 20, currentY + 40);
  if (totalCompanyExpenses > 0) {
    doc.text(`Total Company Expenses: ${formatCurrency(totalCompanyExpenses)}`, 110, currentY + 40);
  }

  // Add final grand total
  currentY += 55;
  doc.setFillColor(34, 139, 34);
  doc.rect(14, currentY, 182, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`GRAND TOTAL: ${formatCurrency(grandTotal)}`, 20, currentY + 10);

  doc.save(`Credit_Card_Expenses_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// --- LOCALSTORAGE FUNCTIONS ---
function saveTransactionsToLocalStorage() {
  const dataToSave = {
    transactions,
    amexTransactions,
    rogersTransactions,
    manualTransactions,
  };
  localStorage.setItem('creditCardTransactions', JSON.stringify(dataToSave));
  console.log('Transactions saved to localStorage.');
}

function saveFilterSettingsToLocalStorage() {
  const filterSettings = {
    visaStartDate: visaStartDateInput.value,
    visaEndDate: visaEndDateInput.value,
    amexStartDate: amexStartDateInput.value,
    amexEndDate: amexEndDateInput.value,
    rogersStartDate: rogersStartDateInput.value,
    rogersEndDate: rogersEndDateInput.value,
  };
  localStorage.setItem('creditCardFilters', JSON.stringify(filterSettings));
  console.log('Filter settings saved to localStorage.');
}

function loadTransactionsFromLocalStorage() {
  const savedData = localStorage.getItem('creditCardTransactions');
  if (savedData) {
    console.log('Loading transactions from localStorage...');
    const parsedData = JSON.parse(savedData);
    // Ensure dates are converted back to Date objects
    transactions = parsedData.transactions.map(t => ({ ...t, date: new Date(t.date) })) || [];
    amexTransactions = parsedData.amexTransactions.map(t => ({ ...t, date: new Date(t.date) })) || [];
    rogersTransactions = parsedData.rogersTransactions.map(t => ({ ...t, date: new Date(t.date) })) || [];
    manualTransactions = parsedData.manualTransactions.map(t => ({ ...t, date: new Date(t.date) })) || [];
    forceRefreshAllTables();
  }
}

function loadFilterSettingsFromLocalStorage() {
  const savedFilters = localStorage.getItem('creditCardFilters');
  if (savedFilters) {
    console.log('Loading filter settings from localStorage...');
    const parsedFilters = JSON.parse(savedFilters);

    // Restore filter values
    visaStartDateInput.value = parsedFilters.visaStartDate || '';
    visaEndDateInput.value = parsedFilters.visaEndDate || '';
    amexStartDateInput.value = parsedFilters.amexStartDate || '';
    amexEndDateInput.value = parsedFilters.amexEndDate || '';
    rogersStartDateInput.value = parsedFilters.rogersStartDate || '';
    rogersEndDateInput.value = parsedFilters.rogersEndDate || '';

    console.log('Filter settings loaded from localStorage.');
    return true; // Return true if filters were loaded
  }
  return false; // Return false if no filters were found
}

function clearAllData() {
  const confirmation = confirm(
    "⚠️ ARE YOU SURE? ⚠️\n\nThis will permanently delete ALL transactions from this page and your browser's storage.\n\nThis action cannot be undone."
  );

  if (confirmation) {
    // Clear all transaction arrays
    transactions = [];
    amexTransactions = [];
    rogersTransactions = [];
    manualTransactions = [];

    // Clear filter inputs
    visaStartDateInput.value = '';
    visaEndDateInput.value = '';
    amexStartDateInput.value = '';
    amexEndDateInput.value = '';
    rogersStartDateInput.value = '';
    rogersEndDateInput.value = '';

    // Clear from localStorage
    localStorage.removeItem('creditCardTransactions');
    localStorage.removeItem('creditCardFilters');
    console.log('All transaction data and filter settings cleared from arrays and localStorage.');

    // Refresh UI
    forceRefreshAllTables();
    alert('All data has been cleared.');
  } else {
    console.log('Clear data action cancelled by user.');
  }
} 