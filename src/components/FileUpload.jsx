import { useRef, useState } from 'react';
import './FileUpload.css';

export default function FileUpload({ onVisaUpload, onAmexUpload, onRogersUpload }) {
    const visaRef = useRef(null);
    const amexRef = useRef(null);
    const rogersRef = useRef(null);

    const [dragStates, setDragStates] = useState({
        visa: false,
        amex: false,
        rogers: false
    });

    const handleDragEnter = (cardType) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragStates(prev => ({ ...prev, [cardType]: true }));
    };

    const handleDragLeave = (cardType) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragStates(prev => ({ ...prev, [cardType]: false }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (cardType, handler, acceptedExtensions) => async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragStates(prev => ({ ...prev, [cardType]: false }));

        const files = Array.from(e.dataTransfer.files).filter(file => {
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            return acceptedExtensions.includes(ext);
        });

        if (files.length > 0) {
            await handler(files);
        }
    };

    const handleVisaChange = async (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await onVisaUpload(files);
            if (visaRef.current) visaRef.current.value = '';
        }
    };

    const handleAmexChange = async (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await onAmexUpload(files);
            if (amexRef.current) amexRef.current.value = '';
        }
    };

    const handleRogersChange = async (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await onRogersUpload(files);
            if (rogersRef.current) rogersRef.current.value = '';
        }
    };

    return (
        <div className="controls-container">
            <div
                className={`file-upload-zone ${dragStates.visa ? 'drag-active' : ''}`}
                onDragEnter={handleDragEnter('visa')}
                onDragLeave={handleDragLeave('visa')}
                onDragOver={handleDragOver}
                onDrop={handleDrop('visa', onVisaUpload, ['.csv'])}
            >
                <label htmlFor="visaCsvInput" className="file-label">💳 VISA</label>
                <input
                    type="file"
                    id="visaCsvInput"
                    accept=".csv"
                    multiple
                    ref={visaRef}
                    onChange={handleVisaChange}
                />
                <span className="drop-hint">or drag & drop CSV</span>
            </div>
            <div
                className={`file-upload-zone ${dragStates.amex ? 'drag-active' : ''}`}
                onDragEnter={handleDragEnter('amex')}
                onDragLeave={handleDragLeave('amex')}
                onDragOver={handleDragOver}
                onDrop={handleDrop('amex', onAmexUpload, ['.xls', '.xlsx'])}
            >
                <label htmlFor="amexCsvInput" className="file-label">💎 AMEX</label>
                <input
                    type="file"
                    id="amexCsvInput"
                    accept=".xls,.xlsx"
                    multiple
                    ref={amexRef}
                    onChange={handleAmexChange}
                />
                <span className="drop-hint">or drag & drop Excel</span>
            </div>
            <div
                className={`file-upload-zone ${dragStates.rogers ? 'drag-active' : ''}`}
                onDragEnter={handleDragEnter('rogers')}
                onDragLeave={handleDragLeave('rogers')}
                onDragOver={handleDragOver}
                onDrop={handleDrop('rogers', onRogersUpload, ['.csv'])}
            >
                <label htmlFor="rogersCsvInput" className="file-label">📱 ROGERS</label>
                <input
                    type="file"
                    id="rogersCsvInput"
                    accept=".csv"
                    multiple
                    ref={rogersRef}
                    onChange={handleRogersChange}
                />
                <span className="drop-hint">or drag & drop CSV</span>
            </div>
        </div>
    );
}
