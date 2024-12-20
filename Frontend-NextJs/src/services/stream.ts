// services/stream.ts

import axios from 'axios';
import { StreamChat } from 'stream-chat';
import { apiBaseUrl, token, STREAM_API_KEY } from '../constants';

let chatClient: StreamChat | null = null;

export const initializeChat = async (): Promise<StreamChat> => {
  if (chatClient) {
    await chatClient.disconnectUser(); // Disconnect the current user
    chatClient = null; // Clear the client instance
  }

  try {
    const tokenResponse = await axios.post(
      `${apiBaseUrl}/chat/generate-token`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { token: userToken, userId } = tokenResponse.data;

    const userResponse = await axios.get(`${apiBaseUrl}/chat/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { username, profilePicture } = userResponse.data;

    // Create a new instance of StreamChat
    chatClient = new StreamChat(STREAM_API_KEY);

    // Connect the user
    await chatClient.connectUser(
      {
        id: userId,
        name: username,
        image: profilePicture,
      },
      userToken
    );

    return chatClient;
  } catch (error: any) {
    console.error('Error initializing chat:', error);
    throw new Error('Failed to initialize chat');
  }
};


export const createChannel = async (channelName: string, members: string[]) => {
  if (!chatClient) {
    throw new Error('Chat client not initialized');
  }

  try {
    const response = await axios.post(
      `${apiBaseUrl}/chat/create-channel`,
      { channelName, members },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { channelId } = response.data;

    // Fetch the channel from the client
    const channel = chatClient.channel('messaging', channelId);

    await channel.watch();

    console.log('Channel created:', channel);

    return channel;
  } catch (error: any) {
    console.error('Error creating channel:', error.response?.data || error.message);
    throw new Error('Failed to create channel');
  }
};
