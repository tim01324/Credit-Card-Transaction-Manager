// Credit Card Expenses Manager - Enhanced JavaScript
// Global variables and DOM elements
let transactions = [];
let amexTransactions = [];
let rogersTransactions = [];
const fileInput = document.getElementById('visaCsvInput');
const amexFileInput = document.getElementById('amexCsvInput');
const rogersFileInput = document.getElementById('rogersCsvInput');
const tableBody = document.getElementById('visaTableBody');
const amexTableBody = document.getElementById('amexTableBody');
const rogersTableBody = document.getElementById('rogersTableBody');
const totalAmountSpan = document.getElementById('visaTotalAmount');
const amexTotalAmountSpan = document.getElementById('amexTotalAmount');
const rogersTotalAmountSpan = document.getElementById('rogersTotalAmount');

// VISA filter elements
const visaStartDateInput = document.getElementById('visaStartDate');
const visaEndDateInput = document.getElementById('visaEndDate');
const visaFilterBtn = document.getElementById('visaFilterButton');
const visaClearFilterBtn = document.getElementById('visaClearFilterButton');

// AMEX filter elements
const amexStartDateInput = document.getElementById('amexStartDate');
const amexEndDateInput = document.getElementById('amexEndDate');
const amexFilterBtn = document.getElementById('amexFilterButton');
const amexClearFilterBtn = document.getElementById('amexClearFilterButton');

// ROGERS filter elements
const rogersStartDateInput = document.getElementById('rogersStartDate');
const rogersEndDateInput = document.getElementById('rogersEndDate');
const rogersFilterBtn = document.getElementById('rogersFilterButton');
const rogersClearFilterBtn = document.getElementById('rogersClearFilterButton');

// Global action buttons
const showAllBtn = document.getElementById('showAllButton');
const clearAllFiltersBtn = document.getElementById('clearAllFiltersButton');

// Utility functions for enhanced user experience
function showMessage(message, type = 'success') {
  // Remove existing messages
  const existingMessages = document.querySelectorAll('.message');
  existingMessages.forEach(msg => msg.remove());

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;

  // Insert after the main heading
  const heading = document.querySelector('h1');
  heading.parentNode.insertBefore(messageDiv, heading.nextSibling);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  showMessage('🚀 Credit Card Expenses Manager loaded successfully! Upload your files to get started.', 'success');

  fileInput.addEventListener('change', handleFileUpload);
  amexFileInput.addEventListener('change', handleAmexFileUpload);
  rogersFileInput.addEventListener('change', handleRogersFileUpload);

  // VISA filter event listeners
  visaFilterBtn.addEventListener('click', function () {
    renderTableWithFilters();
    updateGrandTotal();
    showMessage('VISA transactions filtered successfully! 📊');
  });
  visaClearFilterBtn.addEventListener('click', function () {
    visaStartDateInput.value = '';
    visaEndDateInput.value = '';
    renderTableWithFilters();
    updateGrandTotal();
    showMessage('VISA filters cleared! All VISA transactions are now visible. ✨');
  });

  // AMEX filter event listeners
  amexFilterBtn.addEventListener('click', function () {
    renderAmexTableWithFilters();
    updateGrandTotal();
    showMessage('AMEX transactions filtered successfully! 📊');
  });
  amexClearFilterBtn.addEventListener('click', function () {
    amexStartDateInput.value = '';
    amexEndDateInput.value = '';
    renderAmexTableWithFilters();
    updateGrandTotal();
    showMessage('AMEX filters cleared! All AMEX transactions are now visible. ✨');
  });

  // ROGERS filter event listeners
  rogersFilterBtn.addEventListener('click', function () {
    renderRogersTableWithFilters();
    updateGrandTotal();
    showMessage('ROGERS transactions filtered successfully! 📊');
  });
  rogersClearFilterBtn.addEventListener('click', function () {
    rogersStartDateInput.value = '';
    rogersEndDateInput.value = '';
    renderRogersTableWithFilters();
    updateGrandTotal();
    showMessage('ROGERS filters cleared! All ROGERS transactions are now visible. ✨');
  });

  // Global action event listeners
  showAllBtn.addEventListener('click', function () {
    visaStartDateInput.value = '';
    visaEndDateInput.value = '';
    amexStartDateInput.value = '';
    amexEndDateInput.value = '';
    rogersStartDateInput.value = '';
    rogersEndDateInput.value = '';
    renderTableWithFilters();
    renderAmexTableWithFilters();
    renderRogersTableWithFilters();
    updateGrandTotal();

    const totalTransactions = transactions.length + amexTransactions.length + rogersTransactions.length;
    showMessage(`📈 Displaying all ${totalTransactions} transactions: ${transactions.length} VISA, ${amexTransactions.length} AMEX, and ${rogersTransactions.length} ROGERS`, 'success');
  });

  clearAllFiltersBtn.addEventListener('click', function () {
    visaStartDateInput.value = '';
    visaEndDateInput.value = '';
    amexStartDateInput.value = '';
    amexEndDateInput.value = '';
    rogersStartDateInput.value = '';
    rogersEndDateInput.value = '';
    renderTableWithFilters();
    renderAmexTableWithFilters();
    renderRogersTableWithFilters();
    updateGrandTotal();
    showMessage('🧹 All filters cleared! All transactions are now visible.', 'success');
  });

  document.getElementById('exportPdfBtn').addEventListener('click', exportToPdf);
});

// Handle VISA file upload with enhanced feedback
function handleFileUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  showMessage(`📤 Processing ${files.length} VISA file(s)...`, 'success');

  // Process each file
  let processedCount = 0;
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const initialCount = transactions.length;
        processCSV(e.target.result);
        const newTransactions = transactions.length - initialCount;
        processedCount++;

        // When all files are processed, render the table automatically
        if (processedCount === files.length) {
          renderTableWithFilters();
          updateGrandTotal();
          showMessage(`✅ Successfully loaded ${newTransactions} new VISA transaction(s). Total: ${transactions.length}`, 'success');
        }
      } catch (error) {
        showMessage(`❌ Error processing VISA file: ${error.message}`, 'error');
      }
    };

    reader.onerror = function () {
      showMessage('❌ Error reading VISA file. Please check the file format.', 'error');
    };

    reader.readAsText(files[i]);
  }

  // Reset file input so same file can be uploaded again
  fileInput.value = '';
}

// Handle AMEX file upload with enhanced feedback
function handleAmexFileUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  showMessage(`📤 Processing ${files.length} AMEX Excel file(s)...`, 'success');

  // Process each file
  let processedCount = 0;
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        // Parse Excel file using SheetJS
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });

        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to array of arrays
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

        const initialCount = amexTransactions.length;
        processAmexExcel(excelData);
        const newTransactions = amexTransactions.length - initialCount;
        processedCount++;

        // When all files are processed, render the table automatically
        if (processedCount === files.length) {
          renderAmexTableWithFilters();
          updateGrandTotal();
          showMessage(`✅ Successfully loaded ${newTransactions} new AMEX transaction(s). Total: ${amexTransactions.length}`, 'success');
        }
      } catch (error) {
        console.error("Error processing AMEX Excel file:", error);
        showMessage('❌ Error processing AMEX Excel file. Please ensure it\'s a valid Excel format and try again.', 'error');
      }
    };

    reader.onerror = function () {
      showMessage('❌ Error reading AMEX file. Please check the file format.', 'error');
    };

    reader.readAsArrayBuffer(files[i]);
  }

  // Reset file input
  amexFileInput.value = '';
}

// Handle ROGERS file upload with enhanced feedback
function handleRogersFileUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  showMessage(`📤 Processing ${files.length} ROGERS file(s)...`, 'success');

  let processedCount = 0;
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const initialCount = rogersTransactions.length;
        processRogersCSV(event.target.result);
        const newTransactions = rogersTransactions.length - initialCount;
        processedCount++;

        // When all files are processed, render the table automatically
        if (processedCount === files.length) {
          renderRogersTableWithFilters();
          updateGrandTotal();
          showMessage(`✅ Successfully loaded ${newTransactions} new ROGERS transaction(s). Total: ${rogersTransactions.length}`, 'success');
        }
      } catch (error) {
        showMessage(`❌ Error processing ROGERS file: ${error.message}`, 'error');
      }
    };

    reader.onerror = function () {
      showMessage('❌ Error reading ROGERS file. Please check the file format.', 'error');
    };

    reader.readAsText(files[i]);
  }
  rogersFileInput.value = '';
}

// Process AMEX Excel data with improved error handling
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
      // Parse date
      let date = null;
      if (row[0]) {
        if (typeof row[0] === 'number') {
          date = new Date(Math.round((row[0] - 25569) * 86400 * 1000));
        } else {
          date = new Date(String(row[0]).trim());
        }
        if (isNaN(date.getTime())) {
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

      // Check for duplicate
      const isDuplicate = amexTransactions.some(t =>
        t.date.toDateString() === date.toDateString() &&
        t.name === name &&
        Math.abs(t.originalExpense - expense) < 0.01
      );

      if (!isDuplicate) {
        amexTransactions.push({
          id: 'amex_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
          date: date,
          name: name,
          expense: expense,
          originalExpense: expense,
          isSplit: false
        });
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
}

// Process ROGERS CSV content with improved error handling
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
        const dateParts = columns[0].split('-');
        if (dateParts.length === 3) {
          date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]), 12, 0, 0);
        } else {
          date = new Date(columns[0] + 'T12:00:00');
        }

        if (isNaN(date.getTime())) {
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

      // Check for duplicate
      const isDuplicate = rogersTransactions.some(t =>
        t.date.toDateString() === date.toDateString() &&
        t.name === merchantName &&
        Math.abs(t.originalExpense - expense) < 0.01
      );

      if (!isDuplicate) {
        rogersTransactions.push({
          id: 'rogers_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
          date: date,
          name: merchantName,
          expense: expense,
          originalExpense: expense,
          isSplit: false
        });
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
}

// Process VISA CSV content with improved error handling
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

      // Parse date
      let date = null;
      if (columns[0].includes('/')) {
        const parts = columns[0].trim().split('/');
        if (parts.length >= 3) {
          date = new Date(parts[2], parts[0] - 1, parts[1]);
        }
      } else {
        date = new Date(columns[0].trim());
      }

      if (isNaN(date.getTime())) {
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

      // Check for duplicate
      const isDuplicate = transactions.some(t =>
        t.date.toDateString() === date.toDateString() &&
        t.name === name &&
        Math.abs(t.originalExpense - expense) < 0.01
      );

      if (!isDuplicate) {
        transactions.push({
          id: Date.now() + '_' + Math.random().toString(36).substring(2, 9),
          date: date,
          name: name,
          expense: expense,
          originalExpense: expense,
          isSplit: false
        });
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

  if (skipped > 0) {
    console.log(`VISA processing complete: ${processed} processed, ${skipped} skipped`);
  }
}

// Render table with filters applied
function renderTableWithFilters() {
  tableBody.innerHTML = '';

  // Get VISA filter dates
  const startDate = visaStartDateInput.value ? new Date(visaStartDateInput.value) : null;
  const endDate = visaEndDateInput.value ? new Date(visaEndDateInput.value) : null;

  // Adjust date ranges to include full days
  if (startDate) startDate.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(23, 59, 59, 999);

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    return true;
  });

  // Sort transactions by date (newest first)
  filteredTransactions.sort((a, b) => b.date - a.date);

  // Render each transaction
  filteredTransactions.forEach(renderTransaction);

  // Update total
  updateTotal(filteredTransactions);
}

// Render AMEX table with filters applied
function renderAmexTableWithFilters() {
  amexTableBody.innerHTML = '';

  // Get AMEX filter dates
  const startDate = amexStartDateInput.value ? new Date(amexStartDateInput.value) : null;
  const endDate = amexEndDateInput.value ? new Date(amexEndDateInput.value) : null;

  // Adjust date ranges to include full days
  if (startDate) startDate.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(23, 59, 59, 999);

  // Filter transactions
  const filteredTransactions = amexTransactions.filter(t => {
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    return true;
  });

  // Sort transactions by date (newest first)
  filteredTransactions.sort((a, b) => b.date - a.date);

  // Render each transaction
  filteredTransactions.forEach(renderAmexTransaction);

  // Update total
  updateAmexTotal(filteredTransactions);
}

// Render ROGERS table with filters applied
function renderRogersTableWithFilters() {
  rogersTableBody.innerHTML = '';

  // Get ROGERS filter dates
  const startDate = rogersStartDateInput.value ? new Date(rogersStartDateInput.value) : null;
  const endDate = rogersEndDateInput.value ? new Date(rogersEndDateInput.value) : null;
  if (startDate) startDate.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(23, 59, 59, 999);

  const filteredTransactions = rogersTransactions.filter(t => {
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    return true;
  });

  // Sort transactions by date (newest first)
  filteredTransactions.sort((a, b) => b.date - a.date);

  filteredTransactions.forEach(renderRogersTransaction);
  updateRogersTotal(filteredTransactions);
}

// Render a single transaction row - no animations
function renderTransaction(transaction) {
  const row = document.createElement('tr');

  // Date cell
  const dateCell = document.createElement('td');
  dateCell.textContent = formatDate(transaction.date);
  row.appendChild(dateCell);

  // Name cell
  const nameCell = document.createElement('td');
  nameCell.textContent = transaction.name;
  nameCell.title = transaction.name; // Tooltip for long names
  row.appendChild(nameCell);

  // Expense cell
  const expenseCell = document.createElement('td');
  expenseCell.textContent = formatCurrency(transaction.expense);
  expenseCell.style.fontWeight = 'bold';
  if (transaction.isSplit) {
    expenseCell.style.color = 'var(--success-color)';
  }
  row.appendChild(expenseCell);

  // Split button cell
  const splitCell = document.createElement('td');
  const splitBtn = document.createElement('button');
  splitBtn.textContent = 'P';
  splitBtn.className = transaction.isSplit ? 'btn-split active' : 'btn-split';
  splitBtn.title = transaction.isSplit ? 'Remove split (restore full amount)' : 'Split expense in half';
  splitBtn.onclick = function () {
    toggleSplit(transaction.id);
  };
  splitCell.appendChild(splitBtn);
  row.appendChild(splitCell);

  // Delete button cell
  const deleteCell = document.createElement('td');
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'btn-delete';
  deleteBtn.title = 'Permanently delete this transaction';
  deleteBtn.onclick = function () {
    deleteTransaction(transaction.id);
  };
  deleteCell.appendChild(deleteBtn);
  row.appendChild(deleteCell);

  tableBody.appendChild(row);
}

// Render a single AMEX transaction row - no animations
function renderAmexTransaction(transaction) {
  const row = document.createElement('tr');

  // Date cell
  const dateCell = document.createElement('td');
  dateCell.textContent = formatDate(transaction.date);
  row.appendChild(dateCell);

  // Name cell
  const nameCell = document.createElement('td');
  nameCell.textContent = transaction.name;
  nameCell.title = transaction.name;
  row.appendChild(nameCell);

  // Expense cell
  const expenseCell = document.createElement('td');
  expenseCell.textContent = formatCurrency(transaction.expense);
  expenseCell.style.fontWeight = 'bold';
  if (transaction.isSplit) {
    expenseCell.style.color = 'var(--success-color)';
  }
  row.appendChild(expenseCell);

  // Split button cell
  const splitCell = document.createElement('td');
  const splitBtn = document.createElement('button');
  splitBtn.textContent = 'P';
  splitBtn.className = transaction.isSplit ? 'btn-split active' : 'btn-split';
  splitBtn.title = transaction.isSplit ? 'Remove split (restore full amount)' : 'Split expense in half';
  splitBtn.onclick = function () {
    toggleAmexSplit(transaction.id);
  };
  splitCell.appendChild(splitBtn);
  row.appendChild(splitCell);

  // Delete button cell
  const deleteCell = document.createElement('td');
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'btn-delete';
  deleteBtn.title = 'Permanently delete this transaction';
  deleteBtn.onclick = function () {
    deleteAmexTransaction(transaction.id);
  };
  deleteCell.appendChild(deleteBtn);
  row.appendChild(deleteCell);

  amexTableBody.appendChild(row);
}

// Render a single ROGERS transaction row - no animations
function renderRogersTransaction(transaction) {
  const row = document.createElement('tr');

  const dateCell = row.insertCell();
  dateCell.textContent = formatDate(transaction.date);

  const nameCell = row.insertCell();
  nameCell.textContent = transaction.name;
  nameCell.title = transaction.name;

  const expenseCell = row.insertCell();
  expenseCell.textContent = formatCurrency(transaction.expense);
  expenseCell.style.fontWeight = 'bold';
  if (transaction.isSplit) {
    expenseCell.style.color = 'var(--success-color)';
  }

  const splitCell = row.insertCell();
  const splitBtn = document.createElement('button');
  splitBtn.textContent = 'P';
  splitBtn.className = transaction.isSplit ? 'btn-split active' : 'btn-split';
  splitBtn.title = transaction.isSplit ? 'Remove split (restore full amount)' : 'Split expense in half';
  splitBtn.onclick = function () { toggleRogersSplit(transaction.id); };
  splitCell.appendChild(splitBtn);

  const deleteCell = row.insertCell();
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'btn-delete';
  deleteBtn.title = 'Permanently delete this transaction';
  deleteBtn.onclick = function () { deleteRogersTransaction(transaction.id); };
  deleteCell.appendChild(deleteBtn);

  rogersTableBody.appendChild(row);
}

// Toggle split status functions with notifications
function toggleSplit(id) {
  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) return;

  const transaction = transactions[index];
  transaction.isSplit = !transaction.isSplit;

  if (transaction.isSplit) {
    transaction.expense = transaction.originalExpense / 2;
    showMessage(`💰 Split applied! ${transaction.name} is now ${formatCurrency(transaction.expense)} (50% of original)`, 'success');
  } else {
    transaction.expense = transaction.originalExpense;
    showMessage(`↩️ Split removed! ${transaction.name} restored to ${formatCurrency(transaction.expense)}`, 'success');
  }

  renderTableWithFilters();
  updateGrandTotal();
}

function toggleAmexSplit(id) {
  const index = amexTransactions.findIndex(t => t.id === id);
  if (index === -1) return;

  const transaction = amexTransactions[index];
  transaction.isSplit = !transaction.isSplit;

  if (transaction.isSplit) {
    transaction.expense = transaction.originalExpense / 2;
    showMessage(`💰 Split applied! ${transaction.name} is now ${formatCurrency(transaction.expense)} (50% of original)`, 'success');
  } else {
    transaction.expense = transaction.originalExpense;
    showMessage(`↩️ Split removed! ${transaction.name} restored to ${formatCurrency(transaction.expense)}`, 'success');
  }

  renderAmexTableWithFilters();
  updateGrandTotal();
}

function toggleRogersSplit(id) {
  const index = rogersTransactions.findIndex(t => t.id === id);
  if (index === -1) return;

  const transaction = rogersTransactions[index];
  transaction.isSplit = !transaction.isSplit;
  transaction.expense = transaction.isSplit ? transaction.originalExpense / 2 : transaction.originalExpense;

  if (transaction.isSplit) {
    showMessage(`💰 Split applied! ${transaction.name} is now ${formatCurrency(transaction.expense)} (50% of original)`, 'success');
  } else {
    showMessage(`↩️ Split removed! ${transaction.name} restored to ${formatCurrency(transaction.expense)}`, 'success');
  }

  renderRogersTableWithFilters();
  updateGrandTotal();
}

// Delete functions with confirmation and notifications
function deleteTransaction(id) {
  const transaction = transactions.find(t => t.id === id);
  if (!transaction) return;

  if (!confirm(`⚠️ Are you sure you want to permanently delete this transaction?\n\n${formatDate(transaction.date)}\n${transaction.name}\n${formatCurrency(transaction.expense)}`)) {
    return;
  }

  const index = transactions.findIndex(t => t.id === id);
  transactions.splice(index, 1);
  renderTableWithFilters();
  updateGrandTotal();
  showMessage(`🗑️ Transaction deleted: ${transaction.name}`, 'success');
}

function deleteAmexTransaction(id) {
  const transaction = amexTransactions.find(t => t.id === id);
  if (!transaction) return;

  if (!confirm(`⚠️ Are you sure you want to permanently delete this AMEX transaction?\n\n${formatDate(transaction.date)}\n${transaction.name}\n${formatCurrency(transaction.expense)}`)) {
    return;
  }

  const index = amexTransactions.findIndex(t => t.id === id);
  amexTransactions.splice(index, 1);
  renderAmexTableWithFilters();
  updateGrandTotal();
  showMessage(`🗑️ AMEX transaction deleted: ${transaction.name}`, 'success');
}

function deleteRogersTransaction(id) {
  const transaction = rogersTransactions.find(t => t.id === id);
  if (!transaction) return;

  if (!confirm(`⚠️ Are you sure you want to permanently delete this ROGERS transaction?\n\n${formatDate(transaction.date)}\n${transaction.name}\n${formatCurrency(transaction.expense)}`)) {
    return;
  }

  const index = rogersTransactions.findIndex(t => t.id === id);
  rogersTransactions.splice(index, 1);
  renderRogersTableWithFilters();
  updateGrandTotal();
  showMessage(`🗑️ ROGERS transaction deleted: ${transaction.name}`, 'success');
}

// Update total amount displays with improved formatting
function updateTotal(filteredTransactions) {
  const total = filteredTransactions.reduce((sum, t) => sum + t.expense, 0);
  totalAmountSpan.textContent = total.toFixed(2);
  updateGrandTotal();
}

function updateAmexTotal(filteredTransactions) {
  const total = filteredTransactions.reduce((sum, t) => sum + t.expense, 0);
  amexTotalAmountSpan.textContent = total.toFixed(2);
  updateGrandTotal();
}

function updateRogersTotal(filteredTransactions) {
  const total = filteredTransactions.reduce((sum, t) => sum + t.expense, 0);
  rogersTotalAmountSpan.textContent = total.toFixed(2);
  updateGrandTotal();
}

// Calculate and display grand total without animations
function updateGrandTotal() {
  // Get current totals from spans
  const visaTotal = parseFloat(totalAmountSpan.textContent) || 0;
  const amexTotal = parseFloat(amexTotalAmountSpan.textContent) || 0;
  const rogersTotal = parseFloat(rogersTotalAmountSpan.textContent) || 0;

  // Calculate grand total
  const grandTotal = visaTotal + amexTotal + rogersTotal;

  // Update the grand total display without animation
  const grandTotalElement = document.getElementById('grandTotalAmount');
  grandTotalElement.textContent = grandTotal.toFixed(2);
}

// Enhanced PDF export with better formatting and error handling
function exportToPdf() {
  try {
    showMessage('📄 Generating PDF report...', 'success');

    // Get filter dates for all card types
    const visaStartDate = visaStartDateInput.value ? new Date(visaStartDateInput.value) : null;
    const visaEndDate = visaEndDateInput.value ? new Date(visaEndDateInput.value) : null;
    const amexStartDate = amexStartDateInput.value ? new Date(amexStartDateInput.value) : null;
    const amexEndDate = amexEndDateInput.value ? new Date(amexEndDateInput.value) : null;
    const rogersStartDate = rogersStartDateInput.value ? new Date(rogersStartDateInput.value) : null;
    const rogersEndDate = rogersEndDateInput.value ? new Date(rogersEndDateInput.value) : null;

    // Adjust date ranges
    if (visaStartDate) visaStartDate.setHours(0, 0, 0, 0);
    if (visaEndDate) visaEndDate.setHours(23, 59, 59, 999);
    if (amexStartDate) amexStartDate.setHours(0, 0, 0, 0);
    if (amexEndDate) amexEndDate.setHours(23, 59, 59, 999);
    if (rogersStartDate) rogersStartDate.setHours(0, 0, 0, 0);
    if (rogersEndDate) rogersEndDate.setHours(23, 59, 59, 999);

    // Filter transactions
    const filteredVisaTransactions = transactions.filter(t => {
      if (visaStartDate && t.date < visaStartDate) return false;
      if (visaEndDate && t.date > visaEndDate) return false;
      return true;
    });

    const filteredAmexTransactions = amexTransactions.filter(t => {
      if (amexStartDate && t.date < amexStartDate) return false;
      if (amexEndDate && t.date > amexEndDate) return false;
      return true;
    });

    const filteredRogersTransactions = rogersTransactions.filter(t => {
      if (rogersStartDate && t.date < rogersStartDate) return false;
      if (rogersEndDate && t.date > rogersEndDate) return false;
      return true;
    });

    // Sort all transactions by date (newest first)
    filteredVisaTransactions.sort((a, b) => b.date - a.date);
    filteredAmexTransactions.sort((a, b) => b.date - a.date);
    filteredRogersTransactions.sort((a, b) => b.date - a.date);

    // Calculate totals
    const visaTotal = filteredVisaTransactions.reduce((sum, t) => sum + t.expense, 0);
    const amexTotal = filteredAmexTransactions.reduce((sum, t) => sum + t.expense, 0);
    const rogersTotal = filteredRogersTransactions.reduce((sum, t) => sum + t.expense, 0);
    const grandTotal = visaTotal + amexTotal + rogersTotal;

    // Create PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add title with better styling
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("💳 Credit Card Expenses Report", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

    // Add generation timestamp
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const timestamp = `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    doc.text(timestamp, doc.internal.pageSize.getWidth() / 2, 28, { align: "center" });

    // Add filter information if any are applied
    const hasFilters = visaStartDateInput.value || visaEndDateInput.value ||
      amexStartDateInput.value || amexEndDateInput.value ||
      rogersStartDateInput.value || rogersEndDateInput.value;

    let yPos = 40;

    if (hasFilters) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text('Applied Filters:', 14, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      if (visaStartDateInput.value || visaEndDateInput.value) {
        let visaFilter = '• VISA: ';
        if (visaStartDateInput.value && visaEndDateInput.value) {
          visaFilter += `${visaStartDateInput.value} to ${visaEndDateInput.value}`;
        } else if (visaStartDateInput.value) {
          visaFilter += `From ${visaStartDateInput.value}`;
        } else {
          visaFilter += `To ${visaEndDateInput.value}`;
        }
        doc.text(visaFilter, 20, yPos);
        yPos += 6;
      }

      if (amexStartDateInput.value || amexEndDateInput.value) {
        let amexFilter = '• AMEX: ';
        if (amexStartDateInput.value && amexEndDateInput.value) {
          amexFilter += `${amexStartDateInput.value} to ${amexEndDateInput.value}`;
        } else if (amexStartDateInput.value) {
          amexFilter += `From ${amexStartDateInput.value}`;
        } else {
          amexFilter += `To ${amexEndDateInput.value}`;
        }
        doc.text(amexFilter, 20, yPos);
        yPos += 6;
      }

      if (rogersStartDateInput.value || rogersEndDateInput.value) {
        let rogersFilter = '• ROGERS: ';
        if (rogersStartDateInput.value && rogersEndDateInput.value) {
          rogersFilter += `${rogersStartDateInput.value} to ${rogersEndDateInput.value}`;
        } else if (rogersStartDateInput.value) {
          rogersFilter += `From ${rogersStartDateInput.value}`;
        } else {
          rogersFilter += `To ${rogersEndDateInput.value}`;
        }
        doc.text(rogersFilter, 20, yPos);
        yPos += 6;
      }
      yPos += 10;
    }

    // Add summary table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Summary", 14, yPos);
    yPos += 10;

    const summaryData = [
      ['VISA Transactions', filteredVisaTransactions.length.toString(), formatCurrency(visaTotal)],
      ['AMEX Transactions', filteredAmexTransactions.length.toString(), formatCurrency(amexTotal)],
      ['ROGERS Transactions', filteredRogersTransactions.length.toString(), formatCurrency(rogersTotal)],
      ['TOTAL', (filteredVisaTransactions.length + filteredAmexTransactions.length + filteredRogersTransactions.length).toString(), formatCurrency(grandTotal)]
    ];

    doc.autoTable({
      startY: yPos,
      head: [['Card Type', 'Count', 'Amount']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      footStyles: { fillColor: [39, 174, 96], textColor: 255, fontStyle: 'bold' },
      foot: [['GRAND TOTAL', '', formatCurrency(grandTotal)]],
      margin: { top: 10, right: 14, bottom: 10, left: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Add detailed transactions for each card type
    const cardTypes = [
      { name: 'VISA', transactions: filteredVisaTransactions, color: [52, 152, 219] },
      { name: 'AMEX', transactions: filteredAmexTransactions, color: [46, 204, 113] },
      { name: 'ROGERS', transactions: filteredRogersTransactions, color: [155, 89, 182] }
    ];

    cardTypes.forEach(cardType => {
      if (cardType.transactions.length > 0) {
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`${cardType.name} Detailed Transactions`, 14, yPos);
        yPos += 10;

        const tableData = cardType.transactions.map(t => [
          formatDate(t.date),
          t.name.length > 40 ? t.name.substring(0, 37) + '...' : t.name,
          formatCurrency(t.expense),
          t.isSplit ? 'Yes' : 'No'
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['Date', 'Description', 'Amount', 'Split']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: cardType.color, textColor: 255, fontStyle: 'bold' },
          bodyStyles: { fontSize: 9 },
          margin: { top: 10, right: 14, bottom: 10, left: 14 },
          styles: { overflow: 'linebreak' },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 80 },
            2: { halign: 'right', cellWidth: 25 },
            3: { halign: 'center', cellWidth: 20 }
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }

    // Save the PDF
    const filename = `credit_card_expenses_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

    showMessage('✅ PDF report generated successfully! Check your downloads folder.', 'success');
  } catch (error) {
    console.error('PDF export error:', error);
    showMessage('❌ Error generating PDF report. Please try again.', 'error');
  }
} 