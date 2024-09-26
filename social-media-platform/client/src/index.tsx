// client/src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated to use 'react-dom/client'
import App from './App';

const rootElement = document.getElementById('root') as HTMLElement; // Type assertion for root element

const root = ReactDOM.createRoot(rootElement); // Create a root for React 18+

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
