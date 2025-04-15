import React, { useEffect, useRef } from 'react';

// Define the navigation item type
export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

// Define the Sidebar props
export interface SidebarProps {
  expanded?: boolean;
  mobileMenuOpen?: boolean;
  navItems?: NavItem[];
  onToggle?: () => void;
  onNavItemClick?: (id: string) => void;
  'aria-label'?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  expanded = true,
  mobileMenuOpen = false,
  navItems = [],
  onToggle,
  onNavItemClick,
  'aria-label': ariaLabel = 'Main navigation'
}) => {
  // Ref for the first focusable element in the sidebar
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const navItemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (mobileMenuOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [mobileMenuOpen]);

  // Handle navigation item click
  const handleNavItemClick = (id: string) => {
    if (onNavItemClick) {
      onNavItemClick(id);
    }
  };

  // Handle toggle click
  const handleToggleClick = () => {
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          data-testid="sidebar-overlay"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside
        role="complementary"
        aria-label={ariaLabel}
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ease-in-out
          ${expanded ? 'w-64' : 'w-16'}
          ${mobileMenuOpen ? 'block z-50' : 'hidden md:block'}
        `}
      >
        {/* Toggle button */}
        <button
          ref={firstFocusableRef}
          onClick={handleToggleClick}
          className="p-2 m-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Toggle sidebar"
          aria-expanded={expanded}
        >
          {expanded ? '←' : '→'}
        </button>

        {/* Navigation items */}
        <nav className="mt-4" role="navigation">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              ref={el => navItemsRef.current[index] = el}
              onClick={() => handleNavItemClick(item.id)}
              className={`
                flex items-center w-full p-2 m-2 rounded-md cursor-pointer text-left
                hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500
                ${expanded ? 'justify-start' : 'justify-center'}
              `}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  const nextIndex = index + (e.shiftKey ? -1 : 1);
                  const nextElement = navItemsRef.current[nextIndex];
                  if (nextElement) {
                    e.preventDefault();
                    nextElement.focus();
                  }
                }
              }}
            >
              <span className="text-xl" aria-hidden="true">{item.icon}</span>
              {expanded && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};
