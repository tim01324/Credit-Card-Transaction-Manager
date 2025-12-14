import { useRef } from 'react';

export default function FileUpload({ onVisaUpload, onAmexUpload, onRogersUpload }) {
    const visaRef = useRef(null);
    const amexRef = useRef(null);
    const rogersRef = useRef(null);

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
            <div>
                <label htmlFor="visaCsvInput" className="file-label">VISA:</label>
                <input
                    type="file"
                    id="visaCsvInput"
                    accept=".csv"
                    multiple
                    ref={visaRef}
                    onChange={handleVisaChange}
                />
            </div>
            <div>
                <label htmlFor="amexCsvInput" className="file-label">AMEX:</label>
                <input
                    type="file"
                    id="amexCsvInput"
                    accept=".xls,.xlsx"
                    multiple
                    ref={amexRef}
                    onChange={handleAmexChange}
                />
            </div>
            <div>
                <label htmlFor="rogersCsvInput" className="file-label">ROGERS:</label>
                <input
                    type="file"
                    id="rogersCsvInput"
                    accept=".csv"
                    multiple
                    ref={rogersRef}
                    onChange={handleRogersChange}
                />
            </div>
        </div>
    );
}
