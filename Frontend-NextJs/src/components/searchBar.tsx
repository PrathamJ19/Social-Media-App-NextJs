import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router'; // Import Next.js router
import styles from '../styles/header.module.css'; // Import the CSS module
import { token, apiBaseUrl } from '../constants';

// Define the structure of a user suggestion
interface UserSuggestion {
  _id: string;
  username: string;
  profilePicture: string;
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState<string>(''); // query string for search input
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]); // list of user suggestions
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false); // flag to show/hide suggestions list
  const searchBarRef = useRef<HTMLDivElement | null>(null); // reference to the search bar for click outside detection
  const router = useRouter(); // Next.js router hook

  useEffect(() => {
    // Fetch suggestions if query length is at least 3 characters
    if (query.length >= 3) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query]);

  useEffect(() => {
    // Close suggestions if clicking outside the search bar
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to fetch user suggestions from the API
  const fetchSuggestions = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/search`, {
        params: { query },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuggestions(res.data); // Set the fetched suggestions
      setShowSuggestions(true); // Show the suggestions list
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    router.push(`/search?query=${query}`); // Navigate using Next.js router
  };

  // Handle when a user clicks on a suggestion
  const handleSuggestionClick = (username: string) => {
    router.push(`/profile/${username}`); // Navigate using Next.js router
    setShowSuggestions(false); // Hide the suggestions list
  };

  return (
    <div className={styles['search-bar']} ref={searchBarRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className={styles['search-input']}
      />
      <button onClick={handleSearch} className={styles['search-button']}>
        Search
      </button>
      {showSuggestions && suggestions.length > 0 && (
        <ul className={styles['suggestions-list']}>
          {suggestions.map((user) => (
            <li
              key={user._id}
              onClick={() => handleSuggestionClick(user.username)}
              className={styles['suggestion-item']}
            >
              <img
                src={user.profilePicture}
                alt="Profile"
                className={styles['suggestion-profile-picture']}
              />
              <span>{user.username}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
