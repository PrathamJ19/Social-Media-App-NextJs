import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/hamburger.module.css';

interface HamburgerProps {
  handleLogout: () => void;
}

const Hamburger: React.FC<HamburgerProps> = ({ handleLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleNavigation = (path: string) => {
    setMenuOpen(false); // Close menu on navigation
    router.push(path);
  };

  return (
    <div className={styles.hamburger}>
      <div
        className={`${styles.icon} ${menuOpen ? styles.open : ''}`}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
      {menuOpen && (
        <div className={styles.menu}>
          <ul className={styles.menuList}>
            <li className={styles.menuItem} onClick={() => handleNavigation('/home')}>
              Feed
            </li>
            <li className={styles.menuItem} onClick={() => handleNavigation('/stories')}>
              Stories
            </li>
            <li className={styles.menuItem} onClick={() => handleNavigation('/messages')}>
              Messages
            </li>
            <li className={styles.menuItem} onClick={() => handleNavigation('/events')}>
              Events
            </li>
            <li className={styles.menuItem} onClick={handleLogout}>
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Hamburger;
