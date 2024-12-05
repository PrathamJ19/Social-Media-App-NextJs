'use client';

import React from 'react';
import Link from 'next/link';
import styles from '../styles/rightSidebar.module.css';
import { useFollowContext } from '../context/FollowContext';

const RightSidebar: React.FC = () => {
  const { followedUsers } = useFollowContext();

  return (
    <div className={styles['right-sidebar']}>
      <h3>Following</h3>
      <div className={styles['user-list']}>
        {followedUsers.map((user) => (
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
