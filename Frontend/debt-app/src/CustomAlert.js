import React from 'react';
import './CustomAlert.css';

const CustomAlert = ({ message, onClose, onCloseReload }) => {
    const handleClose = () => {
        if (onCloseReload) {
            window.location.reload();
        } else {
            onClose();
        }
    };

    return (
        <div className="custom-alert">
            <div className="custom-alert-content">
                <h5>{message}</h5>
                <button onClick={handleClose}>Close</button>
            </div>
        </div>
    );
};

export default CustomAlert;