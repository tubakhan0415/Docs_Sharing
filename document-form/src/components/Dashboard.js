import React, { useEffect, useState } from 'react';
import './Dashboard.css';

function Dashboard() {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    const requiredColumns = [
        'PAN_no',
        'PAN card',
        'Partner 1 PAN Card',
        'Partner 2 PAN Card',
        'Partner 3 PAN Card',
        'Partner 1 Aadhaar Card',
        'Partner 2 Aadhaar Card',
        'Partner 3 Aadhaar Card',
        'Adhaar card',
        '3 months salary slip',
        '6 months bank statement',
        'Last 1 year bank statement',
        'Form 16',
        'Last 2 years financials',
        'Last 2 years Form 26AS',
        'ID card',
        'Adhaar card number',
        'Ownership proof',
        'GST registration/Business proof',
        'Partnership deed',
        'MOA/AOA/COI',
        'Board resolution',
        'High degree certificate',
        'Registration certificate',
        'Photo',
        'Upload any proof',
        'Mother\'s name',
        'Email',
        'Working address',
        'Phone number',
        'WhatsApp number',
        'Permanent address',
        'Current address proof'
    ];

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:3000/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                setData(result.data);
            } catch (err) {
                setError(err.message);
                console.error('Fetch error:', err);
            }
        };

        fetchData();
    }, []);

    const formatValue = (value) => {
        if (typeof value === 'string' && value.startsWith('uploads/')) {
            const formattedValue = value.replace(/\\/g, '/'); // Normalize backslashes
            return (
                <a href={`http://localhost:3000/${formattedValue}`} target="_blank" rel="noopener noreferrer">
                    <button>View File</button>
                </a>
            );
        }
        return value || '';
    };

    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            {requiredColumns.map((columnName, colIndex) => (
                                <th key={colIndex}>{columnName}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {error ? (
                            <tr>
                                <td colSpan={requiredColumns.length}>Error fetching data: {error}</td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((item, index) => (
                                <tr key={index}>
                                    {requiredColumns.map((columnName, colIndex) => (
                                        <td key={colIndex}>
                                            {Array.isArray(item[columnName])
                                                ? item[columnName].map((val, i) => (
                                                    <div key={i}>{formatValue(val)}</div>
                                                ))
                                                : formatValue(item[columnName])}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={requiredColumns.length}>No data available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard;
