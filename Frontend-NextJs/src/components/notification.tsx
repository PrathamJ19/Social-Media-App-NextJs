// client/src/components/Notification.tsx

import React, { useState, useEffect } from 'react';
import '../styles/notification.module.css'; // Make sure this CSS file is created for styling

interface NotificationProps {
  message: string;
  duration: number;
}

const Notification: React.FC<NotificationProps> = ({ message, duration }) => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!visible) {
    return null; // Explicitly return null when not visible
  }

  return (
    <div className="notification">
      {message}
    </div>
  );
};

export default Notification;
