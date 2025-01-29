import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';

function Dashboard(){
    const navigate = useNavigate();
    const [totalDebt, setTotalDebt] = useState('');
    const [debts, setDebts] = useState([]);
    const [name, setName] = useState('');
    const [allUsers, setUsers] = useState([]);
    const [userId, setUserId] = useState('');
    const [title, setTitle] = useState('');
    const [debtValue, setDebtValue] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            const token=localStorage.getItem('token');
            //For the test
            //console.log(token);
            if (!token) {
                console.error('No token found');
                navigate('/login');
                return;
            }

            const username = localStorage.getItem('username');
            setName(username);

            try{
                const response = await fetch(`http://localhost:8000/verifyToken/${token}`);

                if(!response.ok){
                    throw new Error('Token is verification failed');
                }
            } catch (error){
                localStorage.removeItem('token');
                navigate('/');
            }
        };
        verifyToken();
    }, [navigate]);

    return <div>This is a protected page, visible for authenticated users</div>
}

export default Dashboard;