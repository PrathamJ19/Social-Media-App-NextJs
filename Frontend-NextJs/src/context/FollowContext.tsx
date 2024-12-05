'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { apiBaseUrl, token } from '../constants';

interface User {
  username: string;
  profilePicture: string;
}

interface FollowContextType {
  followedUsers: User[];
  setFollowedUsers: React.Dispatch<React.SetStateAction<User[]>>;
  refreshFollowedUsers: () => Promise<void>;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export const FollowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);

  const refreshFollowedUsers = async () => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem("username");
      console.log("Stored username:", storedUsername);
      if (storedUsername) {
        try {
          console.log("Fetching followed users...");
          const response = await axios.get(`${apiBaseUrl}/auth/following/${storedUsername}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Fetched users:", response.data);
          setFollowedUsers(response.data);
        } catch (error) {
          console.error("Error fetching followed users:", error);
        }
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      refreshFollowedUsers();
    }
  }, []);

  return (
    <FollowContext.Provider value={{ followedUsers, setFollowedUsers, refreshFollowedUsers }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollowContext = (): FollowContextType => {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error('useFollowContext must be used within a FollowProvider');
  }
  return context;
};
