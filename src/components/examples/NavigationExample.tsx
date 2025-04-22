'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Link } from '@/components/ui/Link';
import { 
  PrefetchProvider, 
  usePrefetchSettings 
} from '@/lib/prefetching';

/**
 * Example component demonstrating the use of NavButton for navigation
 */
export const NavigationExample: React.FC = () => {
  return (
    <PrefetchProvider
      initialSettings={{
        enabled: true,
        linkHoverDelay: 100,
      }}
    >
      <NavigationContent />
    </PrefetchProvider>
  );
};

/**
 * Inner content with access to prefetch settings
 */
const NavigationContent: React.FC = () => {
  const { settings, setEnabled, setLinkHoverDelay } = usePrefetchSettings();
  const [hoverDelay, setHoverDelay] = useState(settings.linkHoverDelay);
  
  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setHoverDelay(value);
    setLinkHoverDelay(value);
  };
  
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Navigation Components Example</h1>
      
      {/* Prefetch settings control */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-xl font-semibold">Prefetch Settings</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="prefetch-enabled"
                checked={settings.enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="prefetch-enabled">Enable prefetching globally</label>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="hover-delay" className="block">
                Hover delay: {hoverDelay}ms
              </label>
              <input
                type="range"
                id="hover-delay"
                min="0"
                max="500"
                step="50"
                value={hoverDelay}
                onChange={handleDelayChange}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Example: Card with navigation buttons and links */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-xl font-semibold">User Profile Settings</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Manage your account settings and preferences.
            Hover over the buttons to see prefetching in action.
            {!settings.enabled && (
              <span className="text-red-500 block mt-1">
                Note: Prefetching is currently disabled globally.
              </span>
            )}
          </p>
          
          <div className="mb-4">
            <div className="font-medium mb-2">Link Examples:</div>
            <div className="flex gap-4">
              <Link href="/dashboard" className="text-blue-500 hover:underline">Dashboard</Link>
              <Link href="/profile" className="text-blue-500 hover:underline" prefetch={false}>Profile (No Prefetch)</Link>
              <Link href="/settings" className="text-blue-500 hover:underline" prefetchTimeout={300}>Settings (300ms)</Link>
            </div>
          </div>
          
          <div className="font-medium mb-2">Button Examples:</div>
          <div className="grid grid-cols-2 gap-4">
            {/* Navigation buttons using NavButton */}
            <NavButton 
              href="/settings/profile" 
              variant="outline"
              className="w-full justify-start"
            >
              <span className="mr-2">👤</span> Profile
            </NavButton>
            
            <NavButton 
              href="/settings/security" 
              variant="outline"
              className="w-full justify-start"
            >
              <span className="mr-2">🔒</span> Security
            </NavButton>
            
            <NavButton 
              href="/settings/notifications" 
              variant="outline"
              className="w-full justify-start"
              prefetch={false} // Override global setting
            >
              <span className="mr-2">🔔</span> Notifications (No Prefetch)
            </NavButton>
            
            <NavButton 
              href="/settings/billing" 
              variant="outline"
              className="w-full justify-start"
              prefetchTimeout={300} // Custom timeout
            >
              <span className="mr-2">💳</span> Billing (300ms delay)
            </NavButton>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* Regular button (doesn't navigate) */}
          <Button variant="ghost">Cancel</Button>
          
          {/* Navigation button */}
          <NavButton 
            href="/dashboard" 
            variant="default"
          >
            Back to Dashboard
          </NavButton>
        </CardFooter>
      </Card>
      
      {/* Example: Navigation toolbar */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Navigation Toolbar Example</h2>
        <div className="flex space-x-2 flex-wrap gap-2">
          <NavButton href="/home" variant="secondary" size="small">Home</NavButton>
          <NavButton href="/projects" variant="secondary" size="small">Projects</NavButton>
          <NavButton href="/tasks" variant="secondary" size="small">Tasks</NavButton>
          <NavButton href="/reports" variant="secondary" size="small">Reports</NavButton>
          <NavButton href="/team" variant="secondary" size="small">Team</NavButton>
          
          {/* Disabled button example */}
          <NavButton 
            href="/admin" 
            variant="secondary" 
            size="small"
            disabled={true}
          >
            Admin (Disabled)
          </NavButton>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Implementation Notes</h3>
        <p className="text-sm">
          Both the Link and NavButton components provide a seamless way to add navigation with
          prefetching capabilities. When hovered, they will prefetch the destination, making navigation
          feel instantaneous. These components integrate with global prefetch settings,
          allowing you to control prefetching behavior app-wide.
        </p>
        <ul className="text-sm mt-2 list-disc pl-5">
          <li>All navigation components respect global prefetch settings</li>
          <li>Individual components can override settings (see "No Prefetch" examples)</li> 
          <li>Custom hover delay can be set per component (see examples with "300ms")</li>
          <li>The 'is-prefetching' class is added during prefetching for styling</li>
        </ul>
      </div>
    </div>
  );
};

export default NavigationExample; 