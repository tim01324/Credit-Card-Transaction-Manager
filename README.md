https://tim01324.github.io/Credit-Card-Transaction-Manager/

# 💳 Credit Card Splitter

**Ever played "Who Spent What?" with your partner?**

This app solves the eternal relationship question: "Who bought THAT?!" Track and split expenses on your shared TD, Amex, and Rogers credit cards without starting World War III in your living room.

## Features

-   Import transactions from TD, Amex, and Rogers
-   Split expenses fairly (or unfairly, we don't judge)
-   Find out who owes who without passive-aggressive Post-it notes

Save your relationship. Use Credit Card Splitter.

# Bank Transaction Manager

一个用于管理银行交易数据的 Web 应用程序，支持 VISA、AMEX 和 ROGERS 三种银行账单。

## 项目结构

```
Credit-Card-Transaction-Manager/
├── index.html          # 主HTML文件（页面结构）
├── styles.css          # CSS样式文件
├── script.js           # JavaScript逻辑文件
└── README.md           # 项目说明文件
```

## 功能特点

### ✅ **三个独立的日期过滤器**

-   **VISA**: 独立的开始和结束日期过滤器
-   **AMEX**: 独立的开始和结束日期过滤器
-   **ROGERS**: 独立的开始和结束日期过滤器

### ✅ **自动显示数据**

-   上传文件后**自动显示所有数据**，不需要手动点击按钮
-   每个银行的数据独立处理，不会被其他银行的过滤器影响
-   **自动日期排序**: 所有交易数据按日期从新到旧自动排序，便于查看

### ✅ **文件支持**

-   **VISA**: 支持 CSV 格式文件
-   **AMEX**: 支持 XLS/XLSX Excel 格式文件
-   **ROGERS**: 支持 CSV 格式文件

### ✅ **交易功能**

-   **分摊功能**: 点击"P"按钮可以将费用分摊（除以 2）
-   **删除功能**: 可以删除不需要的交易记录
-   **重复检测**: 自动检测并跳过重复的交易记录

### ✅ **导出功能**

-   支持 PDF 导出，包含所有应用的过滤器信息
-   PDF 中会显示每个银行具体的日期过滤范围

## 使用方法

### 1. 上传文件

1. 点击对应银行的文件上传按钮
2. 选择相应格式的文件（VISA/ROGERS 用 CSV，AMEX 用 Excel）
3. 文件上传后会自动显示所有交易数据

### 2. 设置过滤器

1. 为每个银行独立设置日期范围
2. 点击对应的"Filter [银行名]"按钮应用过滤器
3. 点击"Clear [银行名] Filter"清除该银行的过滤器

### 3. 全局操作

-   **Show All Data**: 显示所有银行的所有交易数据
-   **Clear All Filters**: 清除所有银行的日期过滤器

### 4. 交易管理

-   点击"P"按钮进行费用分摊
-   点击"Delete"按钮删除交易记录

### 5. 导出报告

-   点击"Export as PDF"按钮生成包含当前过滤结果的 PDF 报告

## 文件格式要求

### VISA/ROGERS CSV 格式

```
Date,Name,Amount
MM/DD/YYYY,Transaction Name,Amount
```

### AMEX Excel 格式

-   Excel 文件第 18 行开始为数据行
-   列结构：Date(A), Description(B), 跳过(C), Cardmember(D), Amount(E)

### ROGERS CSV 格式

-   第 1 行为标题行，第 2 行开始为数据
-   日期在第 A 列（YYYY-MM-DD 格式）
-   商户名称在第 H 列
-   金额在第 M 列

## 技术栈

-   **HTML5**: 页面结构
-   **CSS3**: 样式和动画
-   **JavaScript ES6**: 应用逻辑
-   **SheetJS**: Excel 文件解析
-   **jsPDF**: PDF 生成和导出

## 浏览器兼容性

支持所有现代浏览器：

-   Chrome 60+
-   Firefox 55+
-   Safari 12+
-   Edge 79+

## 更新日志

### v2.0.0 (最新版本)

-   ✅ 分离文件结构：HTML、CSS、JS 独立文件
-   ✅ 修复上传后自动显示问题
-   ✅ 添加独立的日期过滤器
-   ✅ 新增自动日期排序功能：交易数据按日期从新到旧自动排序
-   ✅ 添加视觉排序指示器和提示信息
-   ✅ 改善用户体验和维护性

### v1.0.0

-   ✅ 基础功能：文件上传、数据展示、PDF 导出
-   ✅ 支持三种银行格式
-   ✅ 交易分摊和删除功能
