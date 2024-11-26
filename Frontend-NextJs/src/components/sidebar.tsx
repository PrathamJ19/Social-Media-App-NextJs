import React, { useEffect, useState } from 'react';
import Link from 'next/link'; 
import styles from '../styles/sidebar.module.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUserFriends, faCalendar, faVideo, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import useHomeLogic from '../hooks/useHomeLogic';

interface ProfileData {
  profilePicture: string;
}

const Sidebar: React.FC = () => {
  const { fetchUserProfile } = useHomeLogic();
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const fetchProfileData = async () => {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
        try {
          const profileData: ProfileData = await fetchUserProfile(storedUsername);
          setProfilePicture(profileData.profilePicture);
        } catch (error) {
          console.error('Error fetching profile picture:', error);
        }
      }
    };

    fetchProfileData();
  }, [fetchUserProfile]);

  return (
    <div className={styles.sidebar}>
      <div className={styles['user-info']}>
        <Link href={`/profile/${username}`} className={styles['sidebar-username']}>
          <img
            src={profilePicture || 'https://example.com/default-profile.png'}
            alt="Profile"
            className={styles['sidebar-profile-picture']}
          />
        </Link>
        <Link href={`/profile/${username}`} className={styles['sidebar-username']}>
          {username}
        </Link>
      </div>
      <nav className={styles['sidebar-nav']}>
        <ul>
          <li>
            <Link href="/home" className={`${styles['sidebar-link']} ${styles.active}`}>
              <FontAwesomeIcon icon={faHome} className={styles.icon} />
              Feed
            </Link>
          </li>
          <li>
            <Link href="/videos" className={styles['sidebar-link']}>
              <FontAwesomeIcon icon={faVideo} className={styles.icon} />
              Stories
            </Link>
          </li>
          <li>
            <Link href="/messages" className={styles['sidebar-link']}>
              <FontAwesomeIcon icon={faEnvelope} className={styles.icon} />
              Messages
            </Link>
          </li>
          <li>
            <Link href="/events" className={styles['sidebar-link']}>
              <FontAwesomeIcon icon={faCalendar} className={styles.icon} />
              Events
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
