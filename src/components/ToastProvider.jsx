import { Toaster } from 'react-hot-toast';

export default function ToastProvider({ children }) {
    return (
        <>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: 'var(--primary-color)',
                        color: 'var(--white)',
                        padding: '16px 24px',
                        borderRadius: 'var(--border-radius)',
                        boxShadow: 'var(--shadow-medium)',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                    },
                    success: {
                        style: {
                            background: 'linear-gradient(135deg, var(--success-color), #1e8449)',
                        },
                        iconTheme: {
                            primary: 'var(--white)',
                            secondary: 'var(--success-color)',
                        },
                    },
                    error: {
                        style: {
                            background: 'linear-gradient(135deg, var(--accent-color), #922b21)',
                        },
                        iconTheme: {
                            primary: 'var(--white)',
                            secondary: 'var(--accent-color)',
                        },
                    },
                }}
            />
        </>
    );
}
