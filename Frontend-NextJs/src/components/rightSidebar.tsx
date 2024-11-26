import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // Import Next.js Link
import styles from '../styles/rightSidebar.module.css'; 
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
    <div className={styles['right-sidebar']}>
      {error && <p>{error}</p>}
      <h3>Following</h3>
      <div className={styles['user-list']}>
        {users.map((user) => (
          <div key={user.username} className={styles['user-item']}>
            <Link href={`/profile/${user.username}`} className={styles['user-link']}>
              <img
                src={user.profilePicture || 'https://example.com/default-profile.png'}
                alt="Profile"
                className={styles['user-profile-picture']}
              />
              <span className={styles['user-username']}>{user.username}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>

  );
};

export default RightSidebar;
