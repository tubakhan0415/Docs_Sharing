import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                navigate('/dashboard');
            } else {
                alert('Invalid credentials');
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="container">
            <h2>Login</h2>
            <div className="form-container">
                <form onSubmit={handleLogin}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
