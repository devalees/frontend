import React from 'react';

/**
 * Auth Layout
 * 
 * Provides a consistent layout for all authentication pages
 * using Next.js App Router layout pattern
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-primary-600">
            Company Name
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Secure authentication portal
          </p>
        </div>
      </div>

      <div className="mt-8">
        {children}
      </div>

      <footer className="mt-8 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Company Name. All rights reserved.</p>
      </footer>
    </div>
  );
} 