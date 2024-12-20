import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { initializeChat, createChannel } from '@/services/stream';
import { Chat, Channel, ChannelHeader, MessageInput, MessageList, Window } from 'stream-chat-react';
import axios from 'axios';
import Header from '../../components/header';
import "stream-chat-react/dist/css/v2/index.css";
import { apiBaseUrl, token } from '../../constants';
import styles from '../../styles/messages.module.css'; // Use the CSS file for styling

interface User {
  username: string;
  profilePicture: string;
}

const ChatPage: React.FC = () => {
  const router = useRouter();
  const { username } = router.query;

  const [channel, setChannel] = useState<any>(null);
  const [chatClient, setChatClient] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');

  // Automatically refresh the page to ensure updated chat state
  useEffect(() => {
    const currentUsername = localStorage.getItem('username');
    if (!currentUsername || !username) {
      return;
    }

    // Force a reload if the username changes
    if (router.asPath.includes(`/chat/${username}`)) {
      const previousUsername = sessionStorage.getItem('previousChatUsername');
      if (previousUsername !== username) {
        sessionStorage.setItem('previousChatUsername', username as string);
        window.location.reload(); // Refresh the page
      }
    }
  }, [username, router]);

  // Fetch the list of following users
  useEffect(() => {
    const fetchFollowingUsers = async () => {
      const storedUsername = localStorage.getItem('username');
      if (!storedUsername) {
        setError('Please log in to see your messages.');
        return;
      }
      try {
        const response = await axios.get(`${apiBaseUrl}/auth/following/${storedUsername}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching following users:', err);
        setError('Failed to fetch following users.');
      }
    };

    fetchFollowingUsers();
  }, []);

  // Set up the chat client and channel
  useEffect(() => {
    const setupChat = async () => {
      if (chatClient) {
        await chatClient.disconnectUser();
        setChatClient(null);
        setChannel(null);
      }

      try {
        const client = await initializeChat();
        setChatClient(client);

        if (username) {
          const currentUser = localStorage.getItem('username')!;
          const members = [currentUser, username as string];
          members.sort();
          const channelName = `chat-${members.join('-')}`;

          const createdChannel = await createChannel(channelName, members);

          setChannel(createdChannel);
        }
      } catch (error) {
        console.error('Error setting up chat:', error);
      }
    };

    setupChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser().catch((err: Error) =>
          console.error('Error disconnecting chat client:', err)
        );
      }
      setChatClient(null);
      setChannel(null);
    };
  }, [username]);

  // Handle user selection from the sidebar
  const handleUserClick = (username: string) => {
    router.push(`/chat/${username}`);
  };

  if (!chatClient) {
    return <div>Loading chat...</div>;
  }

  return (
    <div className={styles.container}>
      <Header
        handleLogout={async () => {
          if (chatClient) {
            await chatClient.disconnectUser();
            setChatClient(null); // Clear the client instance
          }
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          router.push('/login');
        }}
      />
      <div className={styles.sidebar}>
        <h3>Following</h3>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.userList}>
          {users.map((user) => (
            <div
              key={user.username}
              className={styles.userItem}
              onClick={() => handleUserClick(user.username)}
            >
              <img
                src={user.profilePicture || 'https://example.com/default-profile.png'}
                alt={`${user.username}'s profile`}
                className={styles.userProfilePicture}
              />
              <span className={styles.userUsername}>{user.username}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.chatContainer}>
        {channel ? (
          <Chat client={chatClient} theme="messaging light">
            <Channel channel={channel}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
            </Channel>
          </Chat>
        ) : (
          <div className={styles.noChatSelected}>
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
