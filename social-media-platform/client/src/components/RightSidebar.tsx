// client/src/components/RightSidebar.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/RightSidebar.css'; // Import the Sidebar CSS file
import axios from 'axios';
import { apiBaseUrl, token } from '../constants';

interface User {
  username: string;
  profilePicture: string;
}

const RightSidebar: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        try {
          const response = await axios.get(`${apiBaseUrl}/auth/following/${storedUsername}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUsers(response.data);
        } catch (error) {
          console.error('Error fetching following users:', error);
          setError('Error fetching following users');
        }
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="right-sidebar">
      {error && <p>{error}</p>}
      <h3>Following</h3>
      <div className="user-list">
        {users.map((user) => (
          <div key={user.username} className="user-item">
            <Link to={`/profile/${user.username}`} className="user-link">
              <img
                src={user.profilePicture || 'https://example.com/default-profile.png'}
                alt="Profile"
                className="user-profile-picture"
              />
              <span className="user-username">{user.username}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightSidebar;
