import React, {useState} from 'react';
import styles from '../styles/stories.module.css';
import Header from '@/components/header';
import Sidebar from '../components/sidebar';
import { useRouter } from 'next/router';

const Stories: React.FC = () => {
const router = useRouter();
const [isMobile, setIsMobile] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/login'); // Redirect to login page
  };

  return (
    <div className={styles.container}>
      <Header handleLogout={handleLogout} />
      {!isMobile && <Sidebar />}
      <h1 className={styles.heading}>We are working on this feature.</h1>
      <p className={styles.subheading}>Coming Soon</p>
    </div>
  );
};

export default Stories;