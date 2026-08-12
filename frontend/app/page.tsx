'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    const map: Record<string, string> = {
      EMPLOYEE: '/employee',
      MANAGER: '/manager',
      FINANCE: '/finance',
    };
    router.replace(map[user.role] || '/login');
  }, [user, isLoading, router]);

  return null;
}
