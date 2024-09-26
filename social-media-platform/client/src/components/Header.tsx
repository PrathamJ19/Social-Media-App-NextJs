// client/src/components/Header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import '../styles/Header.css'; // Import the CSS file for styling

// Define the types for the props
interface HeaderProps {
  handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ handleLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="logo-container" onClick={() => navigate('/home')}>
        <div className="logo">
          <img 
            className='logog' 
            src='https://faizawsbucket.s3.amazonaws.com/lu-high-resolution-logo-black.png' 
            alt="Logo" 
          />
        </div>
        <div className="app-name">LinkUp</div>
      </div>
      <SearchBar />
      <div>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Header;
