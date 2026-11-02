'use client';

import React, { ReactNode } from 'react';
import { StoreProvider } from '@/lib/store';

export const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <StoreProvider>{children}</StoreProvider>;
};

