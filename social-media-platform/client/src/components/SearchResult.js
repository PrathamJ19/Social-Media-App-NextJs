import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

import { token, username, apiBaseUrl } from '../constants';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const query = new URLSearchParams(location.search).get('query');

  useEffect(() => {
    if (query) {
      fetchUsers();
    }
  }, [query]);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users for query:', query); // Log the query
      const res = await axios.get(`${apiBaseUrl}/search`, {
        params: { query },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Users response:', res.data); // Log the response
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <div className="search-results">
      <h2>Search Results for "{query}"</h2>
      {users.length > 0 ? (
        <ul className="results-list">
          {users.map((user) => (
            <li key={user._id} onClick={() => handleUserClick(user.username)} className="result-item">
              <img src={user.profilePicture} alt="Profile" className="result-profile-picture" />
              <span>{user.username}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found</p>
      )}
    </div>
  );
};

export default SearchResults;
