import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css'; // Import the CSS file for styling
import { token, apiBaseUrl } from '../constants';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length >= 3) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async () => {
    try { 
      const res = await axios.get(`${apiBaseUrl}/search`, {
        params: { query },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuggestions(res.data);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  const handleSearch = () => {
    navigate(`/search?query=${query}`);
  };

  const handleSuggestionClick = (username) => {
    navigate(`/profile/${username}`);
    setShowSuggestions(false);
  };

  return (
    <div className="search-bar" ref={searchBarRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className="search-input"
      />
      <button onClick={handleSearch} className="search-button">Search</button>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((user) => (
            <li key={user._id} onClick={() => handleSuggestionClick(user.username)} className="suggestion-item">
              <img src={user.profilePicture} alt="Profile" className="suggestion-profile-picture" />
              <span>{user.username}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
