import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { apiBaseUrl, token } from '../constants';
import Header from '../components/header';
import styles from '../styles/messages.module.css'; // Create this CSS file for styling

interface User {
  username: string;
  profilePicture: string;
}

const Messages: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  // Fetch the list of following users
  useEffect(() => {
    const fetchFollowingUsers = async () => {
      const storedUsername = localStorage.getItem('username');
      if (!storedUsername) {
        setError('Please log in to see your messages.');
        return;
      }
      try {
        const response = await axios.get(`${apiBaseUrl}/auth/following/${storedUsername}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching following users:', err);
        setError('Failed to fetch following users.');
      }
    };

    fetchFollowingUsers();
  }, []);

  // Navigate to the chat interface
  const handleUserClick = (username: string) => {
    router.push(`/chat/${username}`);
  };

  return (
    <div className={styles.container}>
      <Header
        handleLogout={async () => {
          
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          router.push('/login');
        }}
      />
      <div className={styles.sidebar}>
        <h3>Following</h3>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.userList}>
          {users.map((user) => (
            <div
              key={user.username}
              className={styles.userItem}
              onClick={() => handleUserClick(user.username)}
            >
              <img
                src={user.profilePicture || 'https://example.com/default-profile.png'}
                alt={`${user.username}'s profile`}
                className={styles.userProfilePicture}
              />
              <span className={styles.userUsername}>{user.username}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.chatContainer}>
        <p>Select a user to start chatting</p>
      </div>
    </div>
  );
};

export default Messages;
