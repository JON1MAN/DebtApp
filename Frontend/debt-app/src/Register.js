import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validateForm = () => {
        if (!username || !password) {
            setError('Username and password are required!');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        const formDetails = {
            username,
            email,
            password
        }

        try {
            const response = await fetch("http://localhost:8000/register", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    //Because UserBase is Pydantic model in FastAPI so it have to parse JSON body not URL
                },
                body: JSON.stringify(formDetails),
            });

            setLoading(false);

            if (response.ok) {
                alert("Succesfuly Registered!");
                navigate('/login');
            } else {
                const errorData = await response.json();
                setError(errorData.detail);
            }
        } catch (error) {
            setLoading(false);
            setError("Error occured. Try again later.");
        }
    };

    return (
        <div className="container">
            <h2 className='center-text paddings'>Register new user</h2>
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
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                <button type="submit" disabled={loading} style={{marginTop:'1em'}}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
            <footer className="center-button">
                <h4 style={{width:'100%'}} className='center-text'>Already registered?</h4>
                <button className='outline' onClick={() => navigate('/login')}>Login</button>
            </footer>
        </div>
    );

}
export default Register;