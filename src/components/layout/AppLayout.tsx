import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { Grid, GridItem } from './Grid';
import { DebugPanel } from '../debug/DebugPanel';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Main application layout component 
 * 
 * Provides a consistent layout structure for the application
 * and includes the debug panel for development
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
      
      <Footer />
      
      {/* Debug Panel */}
      <DebugPanel position="bottom-right" />
    </div>
  );
}; 