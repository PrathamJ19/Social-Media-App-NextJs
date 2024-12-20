// components/Providers.tsx
'use client';

import React from 'react';
import { FollowProvider } from '../context/FollowContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FollowProvider>
      {children}
    </FollowProvider>
  );
}
