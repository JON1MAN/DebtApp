import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';

function Dashboard(){
    const navigate = useNavigate();
    const [totalDebt, setTotalDebt] = useState(null);
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

                //Fetch debt summary
                //--------------------------------------------------------------------------------

                const sumResponse = await fetch(`http://localhost:8000/my_debts/sum`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!sumResponse.ok) {
                    throw new Error("Failed to fetch debts summary!");
                }

                const sumData = await sumResponse.json();
                setTotalDebt(sumData.total_debt);

                //Fetch all user debts
                //--------------------------------------------------------------------------------

                const debtsResponse = await fetch(`http://localhost:8000/debts`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!debtsResponse.ok) {
                    throw new Error("Failed to fetch debts!");
                }

                const debtsData = await debtsResponse.json();
                setDebts(debtsData.debts);

                //--------------------------------------------------------------------------------

            } catch (error){
                localStorage.removeItem('token');
                navigate('/');
            }
        };
        verifyToken();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
        window.location.reload();
    };

    const deleteDebt = async (debtId) => {
        const token = localStorage.getItem('token');
        try {
            const deleteResponse = await fetch(`http://localhost:8000/debts/${debtId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!deleteResponse.ok) {
                throw new Error("Failed to delete debt!");
            }

            setDebts(debts.filter(debt => debt.id !== debtId));
            alert("Debt paid succesfully!")
            window.location.reload();
        } catch (error) {
            console.log("Error deleteing debt:", error)
        }
    };

    return (
        <main>
            <h2>Welcome {name}</h2>
            <h3>Your debt is: {totalDebt} zł</h3>
            <section>
                <h4>Your debts:</h4>
                {debts.length === 0 ? (
                    <p>You have no debts.</p>  // If no debts, show a message
                ) : (
                    <ul>
                        {debts.map((debt) => (
                            <li key={debt.id}>
                                <strong>{debt.title}</strong> to {debt.receiver} — {debt.amount} zł
                                <button onClick={() => deleteDebt(debt.id)}>Paid</button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            <button onClick={handleLogout}>Logout</button>
        </main>
    )
}

export default Dashboard;