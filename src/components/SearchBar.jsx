import { useState, forwardRef } from 'react';
import './SearchBar.css';

const SearchBar = forwardRef(function SearchBar({ value, onChange, placeholder = 'Search transactions...' }, ref) {
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = () => {
        onChange('');
        ref?.current?.focus();
    };

    return (
        <div className={`search-bar ${isFocused ? 'focused' : ''}`}>
            <span className="search-icon">🔍</span>
            <input
                ref={ref}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                aria-label="Search transactions"
            />
            {value && (
                <button
                    className="search-clear"
                    onClick={handleClear}
                    title="Clear search"
                    type="button"
                >
                    ✕
                </button>
            )}
        </div>
    );
});

export default SearchBar;
