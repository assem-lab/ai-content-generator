import React from 'react';
import './Header.css';
import logo from '../assets/icons/logo.png'; // Убедись что файл существует

const Header = () => {
    return (
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    <img src={logo} alt="AI Content Generator" className='logo-icon' />
                    <span className="logo-text">Create content using AI</span>
                </div>
            </div>
        </header>
    );
};

export default Header;