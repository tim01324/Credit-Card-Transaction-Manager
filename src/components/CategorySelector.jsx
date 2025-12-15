import './CategorySelector.css';

const CATEGORIES = [
    { id: 'food', label: '🍔 Food & Dining', color: '#e74c3c' },
    { id: 'transport', label: '🚗 Transportation', color: '#3498db' },
    { id: 'shopping', label: '🛍️ Shopping', color: '#9b59b6' },
    { id: 'entertainment', label: '🎬 Entertainment', color: '#e67e22' },
    { id: 'bills', label: '📄 Bills & Utilities', color: '#1abc9c' },
    { id: 'health', label: '🏥 Health', color: '#2ecc71' },
    { id: 'travel', label: '✈️ Travel', color: '#f39c12' },
    { id: 'other', label: '📦 Other', color: '#95a5a6' }
];

export { CATEGORIES };

export default function CategorySelector({ value, onChange, compact = false }) {
    if (compact) {
        return (
            <select
                className="category-select-compact"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">No category</option>
                {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                        {cat.label}
                    </option>
                ))}
            </select>
        );
    }

    return (
        <div className="category-selector">
            <div className="category-options">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        type="button"
                        className={`category-option ${value === cat.id ? 'selected' : ''}`}
                        style={{ '--cat-color': cat.color }}
                        onClick={() => onChange(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
