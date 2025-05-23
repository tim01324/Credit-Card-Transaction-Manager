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

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  fileInput.addEventListener('change', handleFileUpload);
  amexFileInput.addEventListener('change', handleAmexFileUpload);
  rogersFileInput.addEventListener('change', handleRogersFileUpload);

  // VISA filter event listeners
  visaFilterBtn.addEventListener('click', function () {
    renderTableWithFilters();
    updateGrandTotal();
  });
  visaClearFilterBtn.addEventListener('click', function () {
    visaStartDateInput.value = '';
    visaEndDateInput.value = '';
    renderTableWithFilters();
    updateGrandTotal();
  });

  // AMEX filter event listeners
  amexFilterBtn.addEventListener('click', function () {
    renderAmexTableWithFilters();
    updateGrandTotal();
  });
  amexClearFilterBtn.addEventListener('click', function () {
    amexStartDateInput.value = '';
    amexEndDateInput.value = '';
    renderAmexTableWithFilters();
    updateGrandTotal();
  });

  // ROGERS filter event listeners
  rogersFilterBtn.addEventListener('click', function () {
    renderRogersTableWithFilters();
    updateGrandTotal();
  });
  rogersClearFilterBtn.addEventListener('click', function () {
    rogersStartDateInput.value = '';
    rogersEndDateInput.value = '';
    renderRogersTableWithFilters();
    updateGrandTotal();
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
    alert('Showing all transactions: ' + transactions.length + ' VISA, ' + amexTransactions.length + ' AMEX, and ' + rogersTransactions.length + ' ROGERS');
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
  });

  document.getElementById('exportPdfBtn').addEventListener('click', exportToPdf);
});

// Handle VISA file upload
function handleFileUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  // Process each file
  let processedCount = 0;
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();

    reader.onload = function (e) {
      processCSV(e.target.result);
      processedCount++;

      // When all files are processed, render the table automatically
      if (processedCount === files.length) {
        renderTableWithFilters();
        updateGrandTotal(); // 确保更新总计
        console.log(`Loaded ${transactions.length} VISA transactions`);
      }
    };

    reader.readAsText(files[i]);
  }

  // Reset file input so same file can be uploaded again
  fileInput.value = '';
}

// Handle AMEX file upload (XLS format)
function handleAmexFileUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

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

        // Convert to array of arrays (first 15 rows will be skipped later)
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

        processAmexExcel(excelData);
        processedCount++;

        // When all files are processed, render the table automatically
        if (processedCount === files.length) {
          renderAmexTableWithFilters();
          updateGrandTotal(); // 确保更新总计
          console.log(`Loaded ${amexTransactions.length} AMEX transactions`);
        }
      } catch (error) {
        console.error("Error processing AMEX Excel file:", error);
        alert('Error processing AMEX Excel file. Please check the format.');
      }
    };

    reader.readAsArrayBuffer(files[i]);
  }

  // Reset file input so same file can be uploaded again
  amexFileInput.value = '';
}

// Handle ROGERS file upload (assuming CSV)
function handleRogersFileUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  let processedCount = 0;
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    reader.onload = function (event) {
      processRogersCSV(event.target.result);
      processedCount++;

      // When all files are processed, render the table automatically
      if (processedCount === files.length) {
        renderRogersTableWithFilters();
        updateGrandTotal(); // 确保更新总计
        console.log(`Loaded ${rogersTransactions.length} ROGERS transactions`);
      }
    };
    reader.readAsText(files[i]);
  }
  rogersFileInput.value = '';
}

// Process AMEX Excel data
function processAmexExcel(excelData) {
  // Data starts from row 18 (index 17), row 17 (index 16) is the header
  if (excelData.length <= 17) { // Need at least one data row + header
    alert('AMEX Excel file seems to be in incorrect format or too short. It must have data starting from row 18.');
    return;
  }

  // Start from row 18 (index 17)
  for (let i = 17; i < excelData.length; i++) {
    const row = excelData[i];
    // Expected: Date (0), Desc (1), Skip (2), Cardmember (3), Amount (4)
    if (!Array.isArray(row) || row.length < 5) {
      console.warn(`Skipping row ${i + 1} due to insufficient columns. Expected at least 5 columns.`, row);
      continue;
    }

    // 1. Date: First column (index 0)
    let date = null;
    try {
      if (row[0]) {
        if (typeof row[0] === 'number') {
          date = new Date(Math.round((row[0] - 25569) * 86400 * 1000));
        } else {
          date = new Date(String(row[0]).trim());
        }
        if (isNaN(date.getTime())) {
          console.warn(`Skipping row ${i + 1} due to invalid date in column 1: ${row[0]}`);
          continue;
        }
      } else {
        console.warn(`Skipping row ${i + 1} due to missing date in column 1.`);
        continue;
      }
    } catch (err) {
      console.warn(`Error parsing date for row ${i + 1}: ${row[0]}`, err);
      continue;
    }

    // 2. Name: Combine Description (index 1) and Cardmember (index 3)
    const description = row[1] ? String(row[1]).trim() : '';
    const cardmember = row[3] ? String(row[3]).trim() : ''; // Cardmember is now at index 3
    let name = description;
    if (cardmember) {
      name = description ? `${description} - ${cardmember}` : cardmember;
    }
    if (!name && !description) { // Only skip if both are truly empty, allowing for just cardmember or just desc if one is missing
      console.warn(`Skipping row ${i + 1} due to missing Description (col 2) and Cardmember (col 4).`);
      continue;
    }

    // 3. Amount: Fifth column (index 4)
    let expense = 0;
    if (row[4] !== undefined && row[4] !== null) {
      let amountStr = String(row[4]).trim();
      // More robust removal of leading dollar sign and any internal commas
      if (amountStr.startsWith('$')) {
        amountStr = amountStr.substring(1);
      }
      amountStr = amountStr.replace(/,/g, ''); // Remove commas
      expense = parseFloat(amountStr);
    } else {
      console.warn(`Skipping row ${i + 1} due to missing Amount in column 5.`);
      continue;
    }

    if (isNaN(expense)) {
      console.warn(`Skipping row ${i + 1} due to invalid Amount in column 5: ${row[4]}`);
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
    } else {
      console.log(`Skipping duplicate AMEX transaction: ${date.toLocaleDateString()}, ${name}, ${expense.toFixed(2)}`);
    }
  }
}

// Process ROGERS CSV content
function processRogersCSV(csvContent) {
  const lines = csvContent.split('\n');
  console.log(`Rogers CSV: Total lines read: ${lines.length}`);

  // Assuming the first line is the header, data starts from the second line (index 1)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      console.log(`Rogers CSV: Empty line at row ${i + 1}, skipping`);
      continue;
    }

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
    // Don't forget to add the last column
    columns.push(currentCol);

    // Clean up the columns (remove quotes and trim)
    columns = columns.map(col => col.trim().replace(/^"|"$/g, ''));

    console.log(`Rogers CSV: Row ${i + 1}, Columns: ${columns.length}, Date: ${columns[0]}, Desc: ${columns[7]}, Amount: ${columns[12]}`);

    // Date (YYYY-MM-DD) is in column 0 (A)
    let date = null;
    try {
      if (columns[0]) { // Check if date column exists and is not empty
        // Fix date parsing to prevent timezone issues causing date to be off by one day
        const dateParts = columns[0].split('-');
        if (dateParts.length === 3) {
          // Create date using year, month (0-based), day with noon time to avoid timezone issues
          date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]), 12, 0, 0);
        } else {
          date = new Date(columns[0] + 'T12:00:00'); // Add noon time to avoid date shift
        }

        if (isNaN(date.getTime())) {
          console.warn(`Rogers CSV: Skipping row ${i + 1} due to invalid date in column A: ${columns[0]}`);
          continue;
        }
      } else {
        console.warn(`Rogers CSV: Skipping row ${i + 1} due to missing date in column A.`);
        continue;
      }
    } catch (err) {
      console.warn(`Rogers CSV: Error parsing date for row ${i + 1}: ${columns[0]}`, err);
      continue;
    }

    // Merchant Name (Description) is in column H (index 7)
    const merchantName = columns.length > 7 && columns[7] ? columns[7].trim() : 'Unknown Merchant';

    // Amount is in column M (index 12)
    let expense = 0;
    if (columns.length > 12) {
      let amountStr = columns[12] ? String(columns[12]).trim() : '';

      // Log the raw amount string
      console.log(`Rogers CSV: Row ${i + 1}, Raw amount value: "${amountStr}"`);

      // Check if it's empty or just contains a dash or other non-numeric
      if (!amountStr || amountStr === '-') {
        console.log(`Rogers CSV: Row ${i + 1} has empty or dash-only amount value, treating as $0.00`);
        expense = 0;
      } else {
        // Process normal amount
        amountStr = amountStr.replace(/\$|,/g, ''); // Remove $ and commas

        // Handle negative values more carefully
        const isNegative = amountStr.includes('-');
        amountStr = amountStr.replace(/-/g, ''); // Remove minus signs

        expense = parseFloat(amountStr);
        if (isNaN(expense)) {
          console.warn(`Rogers CSV: Non-critical error parsing amount in row ${i + 1}: "${columns[12]}", treating as $0.00`);
          expense = 0;
        } else {
          // Set negative if needed - keep the original sign
          if (isNegative) {
            expense = -expense;
          }
        }
      }
    } else {
      console.warn(`Rogers CSV: Missing amount column in row ${i + 1}, treating as $0.00. Columns available: ${columns.length}`);
      expense = 0;
    }

    console.log(`Rogers CSV: Successfully processed row ${i + 1}: ${date.toLocaleDateString()}, "${merchantName}", $${expense.toFixed(2)}`);

    const transactionName = merchantName; // Simplified transaction name

    const isDuplicate = rogersTransactions.some(t =>
      t.date.toDateString() === date.toDateString() &&
      t.name === transactionName &&
      Math.abs(t.originalExpense - expense) < 0.01
    );

    if (!isDuplicate) {
      rogersTransactions.push({
        id: 'rogers_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        date: date,
        name: transactionName,
        expense: expense,
        originalExpense: expense,
        isSplit: false
      });
      console.log(`Rogers CSV: Added transaction for "${transactionName}" on ${date.toLocaleDateString()}`);
    } else {
      console.log(`Rogers CSV: Skipping duplicate transaction for "${transactionName}" on ${date.toLocaleDateString()}`);
    }
  }
}

// Process VISA CSV content - existing function kept as is
function processCSV(csvContent) {
  const lines = csvContent.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(',');
    if (columns.length < 3) continue;

    // Parse date
    let date = null;
    try {
      // Handle MM/DD/YYYY format
      if (columns[0].includes('/')) {
        const parts = columns[0].trim().split('/');
        // Make sure we have at least month, day, year
        if (parts.length >= 3) {
          date = new Date(parts[2], parts[0] - 1, parts[1]);
        }
      } else {
        // Try standard date parsing
        date = new Date(columns[0].trim());
      }

      // Skip if date is invalid
      if (isNaN(date.getTime())) continue;
    } catch (err) {
      continue; // Skip on date parse error
    }

    // Parse name
    const name = columns[1].trim();
    if (!name) continue;

    // Parse expense
    const expense = parseFloat(columns[2].trim());
    if (isNaN(expense)) continue;

    // Check for duplicate (same date, name, and original amount)
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
    }
  }
}

// Render table with filters applied
function renderTableWithFilters() {
  // Clear the table first
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
  // Clear the table first
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

// Render a single transaction row
function renderTransaction(transaction) {
  const row = document.createElement('tr');

  // Date cell
  const dateCell = document.createElement('td');
  dateCell.textContent = transaction.date.toLocaleDateString();
  row.appendChild(dateCell);

  // Name cell
  const nameCell = document.createElement('td');
  nameCell.textContent = transaction.name;
  row.appendChild(nameCell);

  // Expense cell
  const expenseCell = document.createElement('td');
  expenseCell.textContent = transaction.expense.toFixed(2);
  row.appendChild(expenseCell);

  // Split button cell
  const splitCell = document.createElement('td');
  const splitBtn = document.createElement('button');
  splitBtn.textContent = 'P';
  splitBtn.className = transaction.isSplit ? 'btn-split active' : 'btn-split';
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
  deleteBtn.onclick = function () {
    deleteTransaction(transaction.id);
  };
  deleteCell.appendChild(deleteBtn);
  row.appendChild(deleteCell);

  // Add row to table with animation
  addRowAnimation(row);
  tableBody.appendChild(row);
}

// Render a single AMEX transaction row
function renderAmexTransaction(transaction) {
  const row = document.createElement('tr');

  // Date cell
  const dateCell = document.createElement('td');
  dateCell.textContent = transaction.date.toLocaleDateString();
  row.appendChild(dateCell);

  // Name cell
  const nameCell = document.createElement('td');
  nameCell.textContent = transaction.name;
  row.appendChild(nameCell);

  // Expense cell
  const expenseCell = document.createElement('td');
  expenseCell.textContent = transaction.expense.toFixed(2);
  row.appendChild(expenseCell);

  // Split button cell
  const splitCell = document.createElement('td');
  const splitBtn = document.createElement('button');
  splitBtn.textContent = 'P';
  splitBtn.className = transaction.isSplit ? 'btn-split active' : 'btn-split';
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
  deleteBtn.onclick = function () {
    deleteAmexTransaction(transaction.id);
  };
  deleteCell.appendChild(deleteBtn);
  row.appendChild(deleteCell);

  // Add row to table with animation
  addRowAnimation(row);
  amexTableBody.appendChild(row);
}

// Render a single ROGERS transaction row
function renderRogersTransaction(transaction) {
  const row = document.createElement('tr');
  row.insertCell().textContent = transaction.date.toLocaleDateString();
  row.insertCell().textContent = transaction.name;
  const expenseCell = row.insertCell();
  expenseCell.textContent = transaction.expense.toFixed(2);

  const splitCell = row.insertCell();
  const splitBtn = document.createElement('button');
  splitBtn.textContent = 'P';
  splitBtn.className = transaction.isSplit ? 'btn-split active' : 'btn-split';
  splitBtn.onclick = function () { toggleRogersSplit(transaction.id); };
  splitCell.appendChild(splitBtn);

  const deleteCell = row.insertCell();
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'btn-delete';
  deleteBtn.onclick = function () { deleteRogersTransaction(transaction.id); };
  deleteCell.appendChild(deleteBtn);

  // Add row to table with animation
  addRowAnimation(row);
  rogersTableBody.appendChild(row);
}

// Toggle split status of a transaction
function toggleSplit(id) {
  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) return;

  const transaction = transactions[index];
  transaction.isSplit = !transaction.isSplit;

  if (transaction.isSplit) {
    transaction.expense = transaction.originalExpense / 2;
  } else {
    transaction.expense = transaction.originalExpense;
  }

  // Re-render table to reflect changes
  renderTableWithFilters();
}

// Toggle split status of an AMEX transaction
function toggleAmexSplit(id) {
  const index = amexTransactions.findIndex(t => t.id === id);
  if (index === -1) return;

  const transaction = amexTransactions[index];
  transaction.isSplit = !transaction.isSplit;

  if (transaction.isSplit) {
    transaction.expense = transaction.originalExpense / 2;
  } else {
    transaction.expense = transaction.originalExpense;
  }

  // Re-render table to reflect changes
  renderAmexTableWithFilters();
}

// Toggle split status of a ROGERS transaction
function toggleRogersSplit(id) {
  const index = rogersTransactions.findIndex(t => t.id === id);
  if (index === -1) return;
  const transaction = rogersTransactions[index];
  transaction.isSplit = !transaction.isSplit;
  transaction.expense = transaction.isSplit ? transaction.originalExpense / 2 : transaction.originalExpense;
  renderRogersTableWithFilters();
}

// Delete a transaction
function deleteTransaction(id) {
  if (!confirm('Are you sure you want to delete this transaction?')) {
    return;
  }

  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) return;

  transactions.splice(index, 1);
  renderTableWithFilters();
}

// Delete an AMEX transaction
function deleteAmexTransaction(id) {
  if (!confirm('Are you sure you want to delete this AMEX transaction?')) {
    return;
  }

  const index = amexTransactions.findIndex(t => t.id === id);
  if (index === -1) return;

  amexTransactions.splice(index, 1);
  renderAmexTableWithFilters();
}

// Delete a ROGERS transaction
function deleteRogersTransaction(id) {
  if (!confirm('Are you sure you want to delete this ROGERS transaction?')) return;
  const index = rogersTransactions.findIndex(t => t.id === id);
  if (index === -1) return;
  rogersTransactions.splice(index, 1);
  renderRogersTableWithFilters();
}

// Update total amount display
function updateTotal(filteredTransactions) {
  const total = filteredTransactions.reduce((sum, t) => sum + t.expense, 0);
  totalAmountSpan.textContent = total.toFixed(2);
  updateGrandTotal();
}

// Update AMEX total amount display
function updateAmexTotal(filteredTransactions) {
  const total = filteredTransactions.reduce((sum, t) => sum + t.expense, 0);
  amexTotalAmountSpan.textContent = total.toFixed(2);
  updateGrandTotal();
}

// Update ROGERS total amount display
function updateRogersTotal(filteredTransactions) {
  const total = filteredTransactions.reduce((sum, t) => sum + t.expense, 0);
  rogersTotalAmountSpan.textContent = total.toFixed(2);
  updateGrandTotal();
}

// Calculate and display grand total
function updateGrandTotal() {
  // Get current totals from spans
  const visaTotal = parseFloat(totalAmountSpan.textContent) || 0;
  const amexTotal = parseFloat(amexTotalAmountSpan.textContent) || 0;
  const rogersTotal = parseFloat(rogersTotalAmountSpan.textContent) || 0;

  // Calculate grand total
  const grandTotal = visaTotal + amexTotal + rogersTotal;

  // Update the grand total display
  document.getElementById('grandTotalAmount').textContent = grandTotal.toFixed(2);
}

// Add animation to newly rendered rows
function addRowAnimation(row) {
  // Removed animation for better eye comfort
}

// Export current data to PDF
function exportToPdf() {
  // Get VISA filter dates
  const visaStartDate = visaStartDateInput.value ? new Date(visaStartDateInput.value) : null;
  const visaEndDate = visaEndDateInput.value ? new Date(visaEndDateInput.value) : null;
  if (visaStartDate) visaStartDate.setHours(0, 0, 0, 0);
  if (visaEndDate) visaEndDate.setHours(23, 59, 59, 999);

  // Get AMEX filter dates
  const amexStartDate = amexStartDateInput.value ? new Date(amexStartDateInput.value) : null;
  const amexEndDate = amexEndDateInput.value ? new Date(amexEndDateInput.value) : null;
  if (amexStartDate) amexStartDate.setHours(0, 0, 0, 0);
  if (amexEndDate) amexEndDate.setHours(23, 59, 59, 999);

  // Get ROGERS filter dates
  const rogersStartDate = rogersStartDateInput.value ? new Date(rogersStartDateInput.value) : null;
  const rogersEndDate = rogersEndDateInput.value ? new Date(rogersEndDateInput.value) : null;
  if (rogersStartDate) rogersStartDate.setHours(0, 0, 0, 0);
  if (rogersEndDate) rogersEndDate.setHours(23, 59, 59, 999);

  // Filter transactions with their respective filters
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

  // Sort all filtered transactions by date (newest first)
  filteredVisaTransactions.sort((a, b) => b.date - a.date);
  filteredAmexTransactions.sort((a, b) => b.date - a.date);
  filteredRogersTransactions.sort((a, b) => b.date - a.date);

  // Calculate totals
  const visaTotal = filteredVisaTransactions.reduce((sum, t) => sum + t.expense, 0);
  const amexTotal = filteredAmexTransactions.reduce((sum, t) => sum + t.expense, 0);
  const rogersTotal = filteredRogersTransactions.reduce((sum, t) => sum + t.expense, 0);
  const grandTotal = visaTotal + amexTotal + rogersTotal;

  try {
    // Create new jsPDF instance
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Bank Transaction Report", doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });

    // Add date range information if any filters are applied
    const hasFilters = visaStartDateInput.value || visaEndDateInput.value ||
      amexStartDateInput.value || amexEndDateInput.value ||
      rogersStartDateInput.value || rogersEndDateInput.value;

    if (hasFilters) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      let filterInfo = 'Applied Filters: ';
      const filterParts = [];

      if (visaStartDateInput.value || visaEndDateInput.value) {
        let visaFilter = 'VISA: ';
        if (visaStartDateInput.value && visaEndDateInput.value) {
          visaFilter += `${visaStartDateInput.value} to ${visaEndDateInput.value}`;
        } else if (visaStartDateInput.value) {
          visaFilter += `From ${visaStartDateInput.value}`;
        } else {
          visaFilter += `To ${visaEndDateInput.value}`;
        }
        filterParts.push(visaFilter);
      }

      if (amexStartDateInput.value || amexEndDateInput.value) {
        let amexFilter = 'AMEX: ';
        if (amexStartDateInput.value && amexEndDateInput.value) {
          amexFilter += `${amexStartDateInput.value} to ${amexEndDateInput.value}`;
        } else if (amexStartDateInput.value) {
          amexFilter += `From ${amexStartDateInput.value}`;
        } else {
          amexFilter += `To ${amexEndDateInput.value}`;
        }
        filterParts.push(amexFilter);
      }

      if (rogersStartDateInput.value || rogersEndDateInput.value) {
        let rogersFilter = 'ROGERS: ';
        if (rogersStartDateInput.value && rogersEndDateInput.value) {
          rogersFilter += `${rogersStartDateInput.value} to ${rogersEndDateInput.value}`;
        } else if (rogersStartDateInput.value) {
          rogersFilter += `From ${rogersStartDateInput.value}`;
        } else {
          rogersFilter += `To ${rogersEndDateInput.value}`;
        }
        filterParts.push(rogersFilter);
      }

      filterInfo += filterParts.join('; ');
      doc.text(filterInfo, doc.internal.pageSize.getWidth() / 2, 22, { align: "center" });
    }

    let yPos = 30;

    // Add VISA transactions if any
    if (filteredVisaTransactions.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("VISA Transactions", 14, yPos);
      yPos += 8;

      // Prepare table data
      const visaTableData = filteredVisaTransactions.map(t => [
        t.date.toLocaleDateString(),
        t.name,
        '$' + t.expense.toFixed(2),
        t.isSplit ? 'Yes' : 'No'
      ]);

      // Add table
      doc.autoTable({
        startY: yPos,
        head: [['Date', 'Name', 'Expenses', 'Split']],
        body: visaTableData,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219], textColor: 255 },
        margin: { top: 10, right: 14, bottom: 10, left: 14 },
        styles: { overflow: 'linebreak' },
        columnStyles: {
          2: { halign: 'right' },
          3: { halign: 'center' }
        }
      });

      // Get Y position after table
      yPos = doc.lastAutoTable.finalY + 5;

      // Add VISA total
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const visaTotalText = "Total VISA Expenses: $" + visaTotal.toFixed(2);
      doc.text(visaTotalText, doc.internal.pageSize.getWidth() - 14, yPos, { align: "right" });
      yPos += 10;
    }

    // Add page break if needed
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = 20;
    }

    // Add AMEX transactions if any
    if (filteredAmexTransactions.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("AMEX Transactions", 14, yPos);
      yPos += 8;

      // Prepare table data
      const amexTableData = filteredAmexTransactions.map(t => [
        t.date.toLocaleDateString(),
        t.name,
        '$' + t.expense.toFixed(2),
        t.isSplit ? 'Yes' : 'No'
      ]);

      // Add table
      doc.autoTable({
        startY: yPos,
        head: [['Date', 'Name', 'Expenses', 'Split']],
        body: amexTableData,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219], textColor: 255 },
        margin: { top: 10, right: 14, bottom: 10, left: 14 },
        styles: { overflow: 'linebreak' },
        columnStyles: {
          2: { halign: 'right' },
          3: { halign: 'center' }
        }
      });

      // Get Y position after table
      yPos = doc.lastAutoTable.finalY + 5;

      // Add AMEX total
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const amexTotalText = "Total AMEX Expenses: $" + amexTotal.toFixed(2);
      doc.text(amexTotalText, doc.internal.pageSize.getWidth() - 14, yPos, { align: "right" });
      yPos += 10;
    }

    // Add page break if needed
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = 20;
    }

    // Add ROGERS transactions if any
    if (filteredRogersTransactions.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("ROGERS Transactions", 14, yPos);
      yPos += 8;

      // Prepare table data
      const rogersTableData = filteredRogersTransactions.map(t => [
        t.date.toLocaleDateString(),
        t.name,
        '$' + t.expense.toFixed(2),
        t.isSplit ? 'Yes' : 'No'
      ]);

      // Add table
      doc.autoTable({
        startY: yPos,
        head: [['Date', 'Name', 'Expenses', 'Split']],
        body: rogersTableData,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219], textColor: 255 },
        margin: { top: 10, right: 14, bottom: 10, left: 14 },
        styles: { overflow: 'linebreak' },
        columnStyles: {
          2: { halign: 'right' },
          3: { halign: 'center' }
        }
      });

      // Get Y position after table
      yPos = doc.lastAutoTable.finalY + 5;

      // Add ROGERS total
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const rogersTotalText = "Total ROGERS Expenses: $" + rogersTotal.toFixed(2);
      doc.text(rogersTotalText, doc.internal.pageSize.getWidth() - 14, yPos, { align: "right" });
      yPos += 15;
    }

    // Add page break if needed for grand total
    if (yPos > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      yPos = 30;
    }

    // Add Grand Total box
    doc.setFillColor(52, 152, 219);
    doc.rect(doc.internal.pageSize.getWidth() / 2 - 50, yPos, 100, 20, 'F');
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("GRAND TOTAL: $" + grandTotal.toFixed(2), doc.internal.pageSize.getWidth() / 2, yPos + 13, { align: "center" });

    // Reset text color and add footer
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const footer = `Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    doc.text(footer, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

    // Save the PDF
    doc.save("bank_transactions_report.pdf");

    alert('PDF export completed successfully!');
  } catch (error) {
    console.error('PDF export error:', error);
    alert('Error generating PDF. Please check console for details.');
  }
} 