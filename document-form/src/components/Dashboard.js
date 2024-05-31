import React, { useEffect, useState } from 'react';
import './Dashboard.css';

const filterOptions = {
    Salaried: [
        'Serial No.', 'PAN_no', 'PAN card', 'Adhaar card', '3 months salary slip', '6 months bank statement', 'Form 16 AS', 'ID card', 'Photo', 'Mother\'s name', 'Email', 'Working address', 'Phone number', 'WhatsApp number', 'Permanent address'
    ],
    Proprietor_Business: [
        'Serial No.', 'PAN_no', 'PAN card', 'Adhaar card', 'Ownership proof', 'Last 1 year bank statement', 'GST registration/Business proof', 'Last 2 years financials', 'Last 2 years Form 26AS',
    ],
    Partnership_Business: [
        'Serial No.', 'PAN_no', 'PAN card', 'Adhaar card', 'Ownership proof', 'Last 1 year bank statement', 'GST registration/Business proof', 'Last 2 years financials', 'Partnership deed'
    ],
    PrivateLimited_Business: [
        'Serial No.', 'PAN_no', 'PAN card', 'Adhaar card', 'Ownership proof', 'Last 1 year bank statement', 'GST registration/Business proof', 'Last 2 years financials', 'Last 2 years Form 26AS', 'MOA/AOA/COI', 'Board resolution'
    ],
    Salaried_Doctor: [
        'Serial No.', 'PAN_no', 'PAN card', 'Adhaar card', 'High degree ', 'Registration certificate', 'Current address proof', 'ID card', 'Last 6 months bank statement', '3 months salary slip',
    ],
    SelfEmployed_Doctor: [
        'Serial No.', 'PAN_no', 'PAN card', 'Adhaar card', 'High degree ', 'Registration certificate', 'Current address proof', 'Last 1 year bank statement', 'Photo', 'Last 2 years financials', 'Last 2 years Form 26AS', '3 months salary slip',
    ],
    Both: [
        'Serial No.', 'PAN_no', 'PAN card', 'Adhaar card', 'High degree', 'Registration certificate', 'Current address proof', 'ID card', 'Last 2 years Form 26AS', 'Last 1 year bank statement', 'Photo', 'Last 2 years financials', '3 months salary slip',
    ]
};

function Dashboard() {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('Salaried'); // Ensure initial filter matches a key in filterOptions

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://52.66.26.177:3000/dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }

                const result = await response.json();
                if (result.data && Array.isArray(result.data)) {
                    setData(result.data);
                } else {
                    throw new Error('Invalid data format received');
                }
            } catch (err) {
                setError(err.message);
                console.error('Fetch error:', err);
            }
        };

        fetchData();
    }, []);

    const formatValue = (value) => {
        if (typeof value === 'string' && value.startsWith('uploads/')) {
            const filename = value.split('/').pop();
            return (
                <a href={`http://52.66.26.177:3000/${value}`} download={filename}>
                  <button>Download File</button>
                </a>
            );
        }
        return value || '';
    };

    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>
            <div className="filter-container">
                <label htmlFor="filter">Choose a category: </label>
                <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
                    {Object.keys(filterOptions).map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            {filterOptions[filter].map((columnName, colIndex) => (
                                <th key={colIndex}>{columnName}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {error ? (
                            <tr>
                                <td colSpan={filterOptions[filter].length}>Error fetching data: {error}</td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    {filterOptions[filter].slice(1).map((columnName, colIndex) => (
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
                                <td colSpan={filterOptions[filter].length}>No data available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard;
