import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import CustomAlert from './CustomAlert';

function Dashboard(){
    const navigate = useNavigate();

    //Const for basic operations like add debt, delete debt, etc.
    //----------------------------------------------------------
    const [totalDebt, setTotalDebt] = useState(null);
    const [debts, setDebts] = useState([]);
    const [name, setName] = useState('');   // person who is owed
    const [receiverId, setReceiverId] = useState('');   // person who owes us
    const [allUsers, setUsers] = useState([]);
    const [userId, setUserId] = useState('');   // person who owes us
    const [title, setTitle] = useState('');
    const [debtValue, setDebtValue] = useState('');
    //----------------------------------------------------------

    //Const for alert message
    //----------------------------------------------------------
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    //----------------------------------------------------------

    //Const for calculate debt
    //----------------------------------------------------------
    const [numPeople, setNumPeople] = useState(0);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [amounts, setAmounts] = useState([]);
    //----------------------------------------------------------

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
                setReceiverId(sumData.user_id);

                //--------------------------------------------------------------------------------

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

    // Delete debt
    //--------------------------------------------------------------------------------
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

    //--------------------------------------------------------------------------------

    // Get all users
    //--------------------------------------------------------------------------------
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

    //--------------------------------------------------------------------------------
    
    const handleSelect = (e) => {
        setUserId(e.target.value);
    };

    // Add debt
    //--------------------------------------------------------------------------------

    const createDebt = async (event) => {
        const token = localStorage.getItem('token');
        event.preventDefault();

        const formDetails = {
            title,
            receiver: name,
            receiver_id: parseInt(receiverId),
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

    //--------------------------------------------------------------------------------

    // Calculate debt
    //--------------------------------------------------------------------------------
    const handleNumPeopleChange = (e) => {
        const value = parseInt(e.target.value);
        setNumPeople(value);
        setSelectedUsers(Array(value).fill(''));
    };

    const handleUserSelect = (index, value) => {
        const newSelectedUsers = [...selectedUsers];
        newSelectedUsers[index] = value;
        setSelectedUsers(newSelectedUsers);
    };

    const handleAmountChange = (index, value) => {
        const newAmounts = [...amounts];
        newAmounts[index] = value;
        setAmounts(newAmounts);
    };

    //--------------------------------------------------------------------------------

    // Logout
    //--------------------------------------------------------------------------------
   
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
        window.location.reload();
    };

    //--------------------------------------------------------------------------------

    return (
        <main className="container">
            <h1 className="center-text paddings" >Welcome: 
                <span className='color-change'> {name}</span>
            </h1>
            <h3 className="center-text paddings">Your debt is: <u style={{color: '#ff9500'}}>{totalDebt} zł</u></h3>
            <section>
                <h4>Your debts:</h4>
                {debts.length === 0 ? (
                    <p><ins>You have no debts.</ins></p>  // If no debts, show a message
                ) : (
                    <ul>
                        {debts.map((debt) => (
                            
                            <li key={debt.id} className='paddings'>
                                <div style={{display:'flex'}}>
                                    <p style={{width: '90%'}}><strong>"{debt.title}"</strong> requested by: 
                                    <b style={{color: '#ff9500'}}> {debt.receiver}</b> — <u>{debt.amount}</u> zł</p>
                                    <button style={{width: '10%'}} onClick={() => deleteDebt(debt.id)}>Paid</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            <form onSubmit={createDebt}>
                <h4>Add new receipt here:</h4>
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
            <form>
                <h4>Calculate and add debts:</h4>
                <div className="grid">
                    <label htmlFor="money">Money spent:
                        <input type="number" name="money" placeholder='Money spent' min="0" step="0.01"></input>
                    </label>
                    <label htmlFor="people">How many people:
                        <input type="number" name="people" placeholder='Value' min="0" step="1" 
                        max={allUsers.length} onChange={handleNumPeopleChange}></input>
                    </label>
                </div>
                <hr></hr>
                <div className='grid'>
                {Array.from({ length: numPeople }).map((_, index) => (
                <div key={index}>
                    <label htmlFor={`user-${index}`}>User {index + 1}:
                        <select name={`user-${index}`} onChange={(e) => handleUserSelect(index, e.target.value)} value={selectedUsers[index]}>
                            <option value="">Choose user</option>
                            {allUsers.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label htmlFor={`amount-${index}`}>Amount spent:
                        <input type="number" name={`amount-${index}`} placeholder='Amount' min="0" step="0.01" onChange={(e) => handleAmountChange(index, e.target.value)} />
                    </label>
                </div>
                ))}
                </div>
                
            </form>
            <div className="center-button">
                <button onClick={handleLogout} className='outline' style={{marginBottom:'4em'}}>Logout</button>
            </div>
            {showAlert && <CustomAlert message={alertMessage} onClose={() => setShowAlert(false)} onCloseReload={true}/>}
        </main>
    )
}

export default Dashboard;