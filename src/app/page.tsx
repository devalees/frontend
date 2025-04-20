'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTokens } from '@/lib/features/auth/token';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is logged in
    const tokens = getTokens();
    if (tokens) {
      // If authenticated, redirect to dashboard
      router.replace('/dashboard');
    } else {
      // If not authenticated, redirect to login
      router.replace('/login');
    }
  }, [router]);
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Project Management System
        </h1>
        <p className="text-center text-lg">
          Redirecting to appropriate page...
        </p>
      </div>
    </main>
  )
} 