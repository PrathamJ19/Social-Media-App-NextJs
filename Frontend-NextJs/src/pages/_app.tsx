// src/pages/_app.tsx
import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css'; // Adjust this path to your styles
import { FollowProvider } from '../context/FollowContext'; // Adjust the path as needed

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <FollowProvider>
      <Component {...pageProps} />
    </FollowProvider>
  );
}

export default MyApp;
