import './EmptyState.css';

export default function EmptyState({
    icon = '📋',
    title = 'No transactions yet',
    description = 'Upload a file or add a manual entry to get started.'
}) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">{icon}</div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-description">{description}</p>
        </div>
    );
}
