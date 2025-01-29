import React, { useEffect } from 'react';
import {useNavigate} from 'react-router-dom';

function Dashboard(){
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            const token=localStorage.getItem('token');
            //For the test
            console.log(token);
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