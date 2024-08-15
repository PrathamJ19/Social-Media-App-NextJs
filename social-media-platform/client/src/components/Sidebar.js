// client/src/components/Sidebar.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css'; // Import the Sidebar CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUserFriends, faCalendar, faVideo, faEnvelope, faFile, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import useHomeLogic from '../hooks/useHomeLogic';

const Sidebar = () => {
  const { fetchUserProfile } = useHomeLogic();
  const [profilePicture, setProfilePicture] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
        try {
          const profileData = await fetchUserProfile(storedUsername);
          setProfilePicture(profileData.profilePicture);
        } catch (error) {
          console.error('Error fetching profile picture:', error);
        }
      }
    };

    fetchProfileData();
  }, []);

  return (
    <div className="sidebar">
      <div className="user-info">
        <Link to={`/profile/${username}`}>
          <img
            src={profilePicture || 'https://example.com/default-profile.png'}
            alt="Profile"
            className="sidebar-profile-picture"
          />
        </Link>
        <Link to={`/profile/${username}`} className="sidebar-username">
          {username}
        </Link>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/home" className="sidebar-link active">
              <FontAwesomeIcon icon={faHome} className="icon" />
              Feed
            </Link>
          </li>
          <li>
            <Link to="/videos" className="sidebar-link">
              <FontAwesomeIcon icon={faVideo} className="icon" />
              Stories
            </Link>
          </li>
          <li>
            <Link to="/messages" className="sidebar-link">
              <FontAwesomeIcon icon={faEnvelope} className="icon" />
              Messages
            </Link>
          </li>
          <li>
            <Link to="/events" className="sidebar-link">
              <FontAwesomeIcon icon={faCalendar} className="icon" />
              Events
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
