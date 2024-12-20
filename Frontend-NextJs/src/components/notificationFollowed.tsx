// client/src/components/NotificationFollowed.tsx

import React, { useEffect } from 'react';
import '../styles/notification.module.css'; // Ensure this CSS file exists

interface NotificationFollowedProps {
  message: string;
  onClose: () => void;
}

const NotificationFollowed: React.FC<NotificationFollowedProps> = ({ message, onClose }) => {
  useEffect(() => {
    // Automatically close the notification after 3 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // 3000 milliseconds = 3 seconds

    // Cleanup the timeout if the component unmounts
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="notification-followed">
      <span>{message}</span>
      <button onClick={onClose} className="notification-close-button">X</button>
    </div>
  );
};

export default NotificationFollowed;
