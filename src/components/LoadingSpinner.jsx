import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 'medium', overlay = false }) {
    const sizeClasses = {
        small: 'spinner-small',
        medium: 'spinner-medium',
        large: 'spinner-large'
    };

    const spinner = (
        <div className={`loading-spinner ${sizeClasses[size]}`}>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
        </div>
    );

    if (overlay) {
        return (
            <div className="loading-overlay">
                {spinner}
            </div>
        );
    }

    return spinner;
}
