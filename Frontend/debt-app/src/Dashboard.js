import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import CustomAlert from './CustomAlert';

function Dashboard(){
    const navigate = useNavigate();
    const [totalDebt, setTotalDebt] = useState(null);
    const [debts, setDebts] = useState([]);
    const [name, setName] = useState('');
    const [allUsers, setUsers] = useState([]);
    const [userId, setUserId] = useState('');
    const [title, setTitle] = useState('');
    const [debtValue, setDebtValue] = useState('');

    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

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
                setTotalDebt(Number(sumData.total_debt).toFixed(2));

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
            setAlertMessage("Debt paid successfully!");
            setShowAlert(true);
        } catch (error) {
            console.log("Error deleteing debt:", error)
        }
    };

    const getUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            const usersResponse = await fetch(`http://localhost:8000/users/usernames`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!usersResponse.ok) {
                throw new Error("Failed to get all users!");
            }

            const usersData = await usersResponse.json();
            setUsers(usersData.users)

        } catch (error) {
            console.log("Error getting users:", error)
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    const handleSelect = (e) => {
        setUserId(e.target.value);
    };

    const createDebt = async (event) => {
        const token = localStorage.getItem('token');
        event.preventDefault();

        const formDetails = {
            title,
            receiver: name,
            amount: parseFloat(debtValue),
            user_id: parseInt(userId)
        }

        try {
            const response = await fetch("http://localhost:8000/debts", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formDetails)
            });

            if (response.ok) {
                setAlertMessage("Debt added successfully!");
                setShowAlert(true);
            }
            else {
                throw new Error("Failed to add debt!");
            }
        } catch (error) {
            console.error("Error while adding debt", error)
        }
    };


    return (
        <main className="container">
            <h1 className="center-text paddings" >Welcome: 
                <span className='color-change'> {name}</span>
            </h1>
            <h3 className="center-text paddings">Your debt is: <u style={{color: '#ff9500'}}>{totalDebt} zł</u></h3>
            <section>
                <h4>Your debts:</h4>
                {debts.length === 0 ? (
                    <p>You have no debts.</p>  // If no debts, show a message
                ) : (
                    <ul>
                        {debts.map((debt) => (
                            
                            <li key={debt.id} className='paddings'>
                                <div style={{display:'flex'}}>
                                    <p style={{width: '90%'}}><strong>"{debt.title}"</strong> requested by: 
                                    <b style={{color: '#ff9500'}}>{debt.receiver}</b> — <u>{debt.amount}</u> zł</p>
                                    <button style={{width: '10%'}} onClick={() => deleteDebt(debt.id)}>Paid</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            <form onSubmit={createDebt}>
                <h4>Add new receipt here</h4>
                    <div className='grid'>
                    <label htmlFor="title">Title:
                        <input type="text" name="title" placeholder="Debt description" 
                            onChange={(e) => setTitle(e.target.value)}></input>
                    </label>
                    <label htmlFor="value">Value:
                        <input type="number" placeholder="Value" name="value" min="0" step="0.01"
                            onChange={(e) => setDebtValue(e.target.value)}></input>
                    </label>
                    <label htmlFor="receiver">Borrower:
                        <select name="receiver" onChange={handleSelect} value={userId}>
                            <option value="">Choose debtor</option>
                            {allUsers.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="center-button">
                    <button type="submit" style={{width: '30%'}}>Add debt</button>
                </div>
            </form>
            <div className="center-button">
                <button onClick={handleLogout} className='outline'>Logout</button>
            </div>
            {showAlert && <CustomAlert message={alertMessage} onClose={() => setShowAlert(false)} onCloseReload={true}/>}
        </main>
    )
}

export default Dashboard;