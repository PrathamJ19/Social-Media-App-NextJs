// src/types.ts

export interface Post {
    _id: string;
    author: {
      username: string;
      profilePicture: string;
    };
    content: string;
    images: string[];
    likes: string[];
    isLikedByCurrentUser: boolean;
  }
  