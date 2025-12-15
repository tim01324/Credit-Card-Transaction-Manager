import { useEffect, useCallback } from 'react';

export function useKeyboardShortcuts(handlers) {
    const handleKeyDown = useCallback((e) => {
        // Check if user is typing in an input field
        const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

        // Ctrl/Cmd + E: Export PDF
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            handlers.onExportPdf?.();
            return;
        }

        // Ctrl/Cmd + S: Save/Backup (prevent browser save dialog)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handlers.onBackup?.();
            return;
        }

        // Ctrl/Cmd + F: Focus search (only if not already typing)
        if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !isTyping) {
            e.preventDefault();
            handlers.onFocusSearch?.();
            return;
        }

        // Escape: Clear search / close modal
        if (e.key === 'Escape') {
            handlers.onEscape?.();
            return;
        }
    }, [handlers]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
}
