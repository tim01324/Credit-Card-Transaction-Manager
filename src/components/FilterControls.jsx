export default function FilterControls({ startDate, endDate, onStartDateChange, onEndDateChange, onFilter, onClear, label }) {
    return (
        <div className="date-filter-container">
            <label htmlFor={`${label}StartDate`}>From:</label>
            <input
                type="date"
                id={`${label}StartDate`}
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
            />
            <label htmlFor={`${label}EndDate`}>To:</label>
            <input
                type="date"
                id={`${label}EndDate`}
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
            />
            <button onClick={onFilter}>Filter {label}</button>
            <button onClick={onClear}>Clear {label} Filter</button>
        </div>
    );
}
