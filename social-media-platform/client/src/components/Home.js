// client/src/components/Home.js

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!token) {
      alert('Please log in first.');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/signup');
  };

  const handleProfileClick = () => {
    navigate(`/profile/${username}`);
  };

  return (
    <div>
      {token ? (
        <>
          <h2 onClick={handleProfileClick} style={{ cursor: 'pointer' }}>Welcome, {username}</h2>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>Redirecting to login...</p>
      )}
    </div>
  );
};

export default Home;
