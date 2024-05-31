import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicForm from './DynamicForm';
import './Form.css';

function FormWrapper() {
    const [profession, setProfession] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        fetch('http://52.66.26.177:3000/submit-documents', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                displayMessage('success', data.message);
            })
            .catch(error => {
                displayMessage('error', error.message);
            });
    };

    const displayMessage = (type, message) => {
        setMessage({ type, text: message });
        setTimeout(() => {
            setMessage('');
        }, 5000);
    };

    const updateForm = (e) => {
        setProfession(e.target.value);
    };

    const updateBusinessType = (e) => {
        setBusinessType(e.target.value);
    };

    const navigateToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="formbold-main-wrapper">
            <div className="formbold-form-wrapper">
                <h3>Document Submission for Loan Application</h3>
                <button onClick={navigateToLogin}>Go to Dashboard</button>
                <p>Fill in the details below to proceed with your loan application.</p>
                <form id="documentForm" encType="multipart/form-data" onSubmit={handleFormSubmit}>
                    <label htmlFor="profession">Select Your Employement Type:
                        <select id="profession" onChange={updateForm} required>
                            <option value="">--Select One--</option>
                            <option value="Salaried">Salaried</option>
                            <option value="Business">Business</option>
                            <option value="Doctor">Professional</option>
                        </select>
                    </label>
                    <DynamicForm profession={profession} />
                    <button type="submit">Submit Documents</button>
                </form>
                {message && <div id="message">
                    <p style={{ color: message.type === 'success' ? 'green' : 'red' }}>{message.text}</p>
                </div>}
            </div>
        </div>
    );
}

export default FormWrapper;
