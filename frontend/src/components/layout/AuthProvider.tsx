'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Restore auth state from localStorage on every page load/refresh
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
