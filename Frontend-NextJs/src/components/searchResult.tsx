import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Import Next.js router
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

import { token, apiBaseUrl } from '../constants';

// Define the structure of a user object
interface User {
  _id: string;
  username: string;
  profilePicture: string;
}

const SearchResults: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const query = router.query.query as string; // Extract the query from the URL

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

  const handleUserClick = (username: string) => {
    router.push(`/profile/${username}`); // Navigate using Next.js router
  };

  return (
    <div className="search-results">
      <h2>Search Results for "{query}"</h2>
      {users.length > 0 ? (
        <ul className="results-list">
          {users.map((user) => (
            <li
              key={user._id}
              onClick={() => handleUserClick(user.username)}
              className="result-item"
            >
              <img
                src={user.profilePicture}
                alt="Profile"
                className="result-profile-picture"
              />
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
