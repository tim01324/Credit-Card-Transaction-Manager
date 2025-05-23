# 💳 Credit Card Expenses Manager

**Never fight over "Who bought THAT?" again!**

A modern, powerful web application for tracking and splitting credit card expenses across multiple cards. Perfect for couples, roommates, or anyone managing shared expenses across VISA, AMEX, and ROGERS credit cards.

## ✨ Live Demo

🌐 **[Try it now!](https://tim01324.github.io/Credit-Card-Transaction-Manager/)**

## 🎯 Why Use This Tool?

-   **🔥 No More Arguments**: Automatically track who spent what and when
-   **⚡ Lightning Fast**: Upload files and see results instantly
-   **🎨 Beautiful Interface**: Modern, intuitive design that's a joy to use
-   **📊 Smart Analytics**: Get instant totals and insights
-   **📱 Mobile Ready**: Works perfectly on any device

---

## 🚀 Key Features

### 💼 **Multi-Card Support**

-   **VISA**: CSV file support
-   **AMEX**: Excel (XLS/XLSX) file support
-   **ROGERS**: CSV file support

### 🎛️ **Independent Filtering System**

-   **Separate date filters** for each credit card
-   **No interference** between different card filters
-   **Smart date handling** with full day coverage

### ⚡ **Auto-Display Technology**

-   **Instant results** - no manual button clicking required
-   **Auto-sorted by date** (newest transactions first)
-   **Real-time updates** as you upload files

### 💰 **Smart Expense Management**

-   **Split expenses** with one click (50/50 sharing)
-   **Delete unwanted** transactions easily
-   **Duplicate detection** prevents data corruption
-   **Live total calculations** with grand totals

### 📄 **Professional Reporting**

-   **PDF export** with beautiful formatting
-   **Filter-aware reports** showing exactly what you filtered
-   **Detailed breakdowns** by card type
-   **Professional presentation** ready for sharing

---

## 📁 Project Structure

```
Credit-Card-Expenses-Manager/
├── 📄 index.html          # Clean HTML structure
├── 🎨 styles.css          # Modern CSS with animations
├── ⚡ script.js           # Enhanced JavaScript logic
└── 📖 README.md           # This documentation
```

## 🔧 How to Use

### 1️⃣ **Upload Your Files**

| Card Type | File Format | Action                                        |
| --------- | ----------- | --------------------------------------------- |
| 💳 VISA   | CSV         | Click "VISA" button → Select CSV file(s)      |
| 💎 AMEX   | Excel       | Click "AMEX" button → Select XLS/XLSX file(s) |
| 📶 ROGERS | CSV         | Click "ROGERS" button → Select CSV file(s)    |

**✅ Pro Tip**: You can upload multiple files at once!

### 2️⃣ **Filter by Date Range**

Each card has its own independent filter system:

-   **From Date**: Set start date for filtering
-   **To Date**: Set end date for filtering
-   **Filter Button**: Apply the date range
-   **Clear Filter**: Remove date restrictions

### 3️⃣ **Manage Transactions**

| Button     | Function           | Description                                   |
| ---------- | ------------------ | --------------------------------------------- |
| **P**      | Split Expense      | Divides amount by 2 (turns green when active) |
| **Delete** | Remove Transaction | Permanently deletes the transaction           |

### 4️⃣ **Global Actions**

-   **Show All Data**: Displays every transaction across all cards
-   **Clear All Filters**: Removes date filters from all cards
-   **Export as PDF**: Generates professional report

---

## 📊 File Format Requirements

### 💳 VISA/ROGERS CSV Format

```csv
Date,Name,Amount
MM/DD/YYYY,Transaction Description,Amount
01/15/2024,Starbucks Coffee,4.25
01/16/2024,Gas Station,45.67
```

### 💎 AMEX Excel Format

-   **Row 18+**: Transaction data starts here
-   **Column A**: Date
-   **Column B**: Description
-   **Column D**: Cardmember Name
-   **Column E**: Amount

### 📶 ROGERS CSV Format

-   **Row 1**: Headers
-   **Row 2+**: Transaction data
-   **Column A**: Date (YYYY-MM-DD)
-   **Column H**: Merchant Name
-   **Column M**: Amount

---

## 🛠️ Technical Stack

| Technology          | Purpose                     | Version |
| ------------------- | --------------------------- | ------- |
| **HTML5**           | Structure & Semantics       | Latest  |
| **CSS3**            | Modern Styling & Animations | Latest  |
| **JavaScript ES6+** | Application Logic           | Latest  |
| **SheetJS**         | Excel File Processing       | v0.19.2 |
| **jsPDF**           | PDF Generation              | v2.5.1  |
| **jsPDF AutoTable** | Table Formatting            | v3.5.25 |

---

## 🌐 Browser Compatibility

| Browser     | Minimum Version | Status          |
| ----------- | --------------- | --------------- |
| **Chrome**  | 60+             | ✅ Full Support |
| **Firefox** | 55+             | ✅ Full Support |
| **Safari**  | 12+             | ✅ Full Support |
| **Edge**    | 79+             | ✅ Full Support |

---

## 🎨 Design Features

### 🌈 **Modern UI Elements**

-   **Gradient backgrounds** with smooth transitions
-   **Hover effects** for better interactivity
-   **Responsive design** for all screen sizes
-   **Professional typography** using Inter font

### 🎭 **Smart Animations**

-   **Fade-in effects** for new transactions
-   **Scale animations** for grand total updates
-   **Shimmer effects** on the main heading
-   **Smooth transitions** throughout the interface

### 📱 **Mobile Optimization**

-   **Touch-friendly** buttons and controls
-   **Responsive tables** that work on small screens
-   **Optimized layouts** for portrait and landscape

---

## 🔒 Security & Privacy

-   **📊 Client-side only**: No data leaves your device
-   **🔐 No accounts required**: Use instantly without registration
-   **💾 No data storage**: Files are processed in memory only
-   **🌐 Works offline**: Download and use without internet

---

## 📈 Performance Features

### ⚡ **Optimized Processing**

-   **Duplicate detection** prevents data corruption
-   **Efficient file parsing** handles large datasets
-   **Smart memory management** prevents browser slowdowns
-   **Progressive loading** for smooth user experience

### 🎯 **Error Handling**

-   **Graceful error recovery** from file format issues
-   **User-friendly messages** for all error states
-   **Detailed logging** for troubleshooting
-   **Automatic retry** mechanisms where appropriate

---

## 🆕 Recent Updates

### **v3.0.0** - Credit Card Expenses Manager _(Latest)_

-   🎨 **Complete visual redesign** with modern gradients and animations
-   🚀 **Enhanced user experience** with real-time notifications
-   💰 **Improved currency formatting** with proper localization
-   📊 **Better PDF reports** with professional layouts
-   🛡️ **Robust error handling** with user-friendly messages
-   📱 **Full mobile optimization** for all screen sizes

### **v2.0.0** - Modular Architecture

-   ✅ **Separated file structure**: HTML, CSS, JS independence
-   ✅ **Fixed auto-display**: Instant results after upload
-   ✅ **Independent filters**: No cross-card interference
-   ✅ **Auto-sorting**: Newest transactions first
-   ✅ **Enhanced maintainability**: Clean, organized code

### **v1.0.0** - Foundation

-   ✅ **Basic functionality**: File upload and display
-   ✅ **Multi-card support**: VISA, AMEX, ROGERS
-   ✅ **Transaction management**: Split and delete functions
-   ✅ **PDF export**: Basic reporting capabilities

---

## 🤝 Contributing

Want to make this even better? Here's how:

1. **🍴 Fork** the repository
2. **🌱 Create** a feature branch (`git checkout -b amazing-feature`)
3. **💾 Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **📤 Push** to the branch (`git push origin amazing-feature`)
5. **🎯 Open** a Pull Request

---

## 🐛 Found a Bug?

We'd love to fix it! Please:

1. **📝 Create an issue** with detailed description
2. **🖼️ Include screenshots** if relevant
3. **💻 Mention your browser** and version
4. **📋 Describe steps** to reproduce

---

## 💡 Feature Requests

Got ideas? We're listening!

-   **💬 Open an issue** with the "enhancement" label
-   **🎯 Describe the use case** and benefits
-   **🎨 Mock up the UI** if you have design ideas

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

-   **🎨 Design inspiration** from modern fintech apps
-   **🔧 Built with love** for the community
-   **🌟 Thanks to all contributors** who make this better

---

<div align="center">

### ⭐ **Star this repo if it helped you!** ⭐

**Made with ❤️ for better expense management**

[🐛 Report Bug](../../issues) • [✨ Request Feature](../../issues) • [💬 Discussions](../../discussions)

</div>
