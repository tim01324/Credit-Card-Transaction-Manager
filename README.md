# Credit Card Transaction Manager

A streamlined web application for managing and analyzing credit card expenses from multiple sources. This tool allows users to upload transaction data from CSV (VISA, ROGERS) and Excel (AMEX) files, add transactions manually, and export a consolidated report as a PDF.

## Features

-   **Multi-Card Support**: Upload and process transaction files for VISA, AMEX, and ROGERS cards simultaneously.
-   **File Upload**: Supports `.csv` for VISA/ROGERS and `.xls`/`.xlsx` for AMEX. Multiple files can be uploaded at once.
-   **Manual Entry**: A dedicated section to manually add transactions that may not be included in statements.
-   **Dynamic Filtering**: Each card has its own date range filter to easily view transactions within a specific period.
-   **Transaction Management**:
    -   **Split Expense**: Divide any transaction amount by two with a single click. The 'P' button will turn green to indicate an active split.
    -   **Delete Transaction**: Permanently remove any transaction from the list.
-   **Consolidated Totals**: View individual totals for each card type, a total for manual entries, and a grand total of all expenses.
-   **PDF Export**: Generate a clean, professional PDF report of all transactions, categorized by card type and including all totals.

## How to Use

1.  **Upload Files**: Click the corresponding button for VISA, AMEX, or ROGERS to select and upload your transaction file(s). Data is processed and displayed automatically.
2.  **Add Manually**: Use the "Manual Transaction Entry" form to add any individual expenses.
3.  **Filter Data**: Use the "From" and "To" date fields for any card type and click "Filter" to narrow down the results. Click "Clear Filter" to see all transactions for that card again.
4.  **Manage Transactions**: Use the 'P' button to split an expense or the 'Delete' button to remove it.
5.  **Export**: Click the "Export as PDF" button at the bottom to save a complete report of your current data.

## File Format Requirements

### VISA/ROGERS CSV Format

The CSV file must contain at least three columns in the following order: `Date`, `Name`, `Amount`.

```csv
Date,Name,Amount
01/15/2024,Starbucks Coffee,4.25
01/16/2024,Gas Station,45.67
```

### AMEX Excel Format

-   The file should be a standard `.xls` or `.xlsx` file.
-   Transaction data is expected to start from **row 18**.
-   **Column A**: Date
-   **Column B**: Description
-   **Column D**: Card Member (optional, will be appended to description)
-   **Column E**: Amount

---

Made by Cursor
