import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);


    const navigate = useNavigate();

    const validateForm = () => {
        if(!username || !password){
            setError('All fields are required');
            return false;
        }
        setError('');
        return true;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if(!validateForm()){
            return;
        }
        setLoading(true);

        const formDetails = {
            username: username,
            password: password
        };

        try{
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formDetails),
            });

            setLoading(false);

            if(response.ok){
                const data = await response.json();
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('username', username);
                navigate('/dashboard');
            } else{
                const errorData = await response.json();
                setError(errorData.detail || 'Authentication failed!');
            }
        } catch (error){
            setLoading(false);
            setError('An error occured. Try again later.');
        }
    };

    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                {error && <p style={{ color: 'red' }}>{typeof error === 'string' ? error : JSON.stringify(error)}</p>}
            </form>
        </div>
    );

}
export default Login;