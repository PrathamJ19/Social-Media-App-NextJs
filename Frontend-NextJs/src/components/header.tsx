import React from 'react';
import { useRouter } from 'next/router';
import SearchBar from '../components/searchBar';
import Hamburger from '../components/hamburger';
import styles from '../styles/header.module.css'; // Import CSS module

interface HeaderProps {
  handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ handleLogout }) => {
  const router = useRouter();

  const navigateToHome = () => {
    router.push('/home'); // Navigate to the home page
  };

  return (
    <header className={styles.header}>
      <div className={styles['logo-container']} onClick={navigateToHome}>
        <div className={styles.logo}>
          <img
            className={styles.logog}
            src='https://faizawsbucket.s3.amazonaws.com/lu-high-resolution-logo-black.png'
            alt="Logo"
          />
        </div>
        <div className={styles['app-name']}>LinkUp</div>
      </div>
      <div className={styles['search-bar']}>
        <SearchBar />
      </div>
      <div className={styles['hamburger-container']}>
        <Hamburger handleLogout={handleLogout} />
      </div>
    </header>
  );
};

export default Header;
