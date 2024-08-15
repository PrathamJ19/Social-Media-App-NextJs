// client/src/components/Notification.js

import React, { useState, useEffect } from 'react';
import '../styles/Notification.css'; // Create this CSS file for styling

const Notification = ({ message, duration }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  return (
    visible && (
      <div className="notification">
        {message}
      </div>
    )
  );
};

export default Notification;
