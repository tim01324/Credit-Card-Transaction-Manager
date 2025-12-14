# Credit Card Transaction Manager

A React-based web application for managing and analyzing credit card expenses. Upload transaction files, add manual entries, filter by date, and export PDF reports.

## Features

- 📁 Upload VISA (CSV), AMEX (Excel), and ROGERS (CSV) transaction files
- ✏️ Manual transaction entry
- 📅 Date range filtering per card type
- 💰 Split expenses (divide by 2)
- 🏢 Mark transactions as company expenses
- 📊 Automatic total calculations
- 📄 PDF export with detailed report
- 💾 Auto-save to browser storage

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Deploy automatically

## Tech Stack

- React 18 + Vite
- SheetJS (xlsx) for Excel parsing
- jsPDF for PDF export
- Vitest for testing

---

Built with ❤️
