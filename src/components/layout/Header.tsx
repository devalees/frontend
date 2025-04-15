import React, { useEffect, useRef, useState } from 'react';

interface HeaderProps {
  onNavClick?: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavClick = () => {} }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLAnchorElement>(null);
  const lastFocusableRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isMobileMenuOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isMobileMenuOpen]);

  const handleClickOutside = (event: MouseEvent) => {
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsMobileMenuOpen(false);
    }

    if (!isMobileMenuOpen) return;

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // If shift + tab on first element, move to last element
        if (document.activeElement === firstFocusableRef.current) {
          event.preventDefault();
          lastFocusableRef.current?.focus();
        }
      } else {
        // If tab on last element, move to first element
        if (document.activeElement === lastFocusableRef.current) {
          event.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    }
  };

  return (
    <header className="flex items-center justify-between w-full px-4 md:px-6 lg:px-8 py-2 text-gray-900 bg-white">
      <img src="/logo.svg" alt="Logo" className="h-8" />

      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-6" aria-label="desktop navigation">
        <a href="/dashboard" onClick={() => onNavClick('dashboard')} aria-label="dashboard - desktop navigation">
          Dashboard
        </a>
        <a href="/projects" onClick={() => onNavClick('projects')} aria-label="projects - desktop navigation">
          Projects
        </a>
        <a href="/settings" onClick={() => onNavClick('settings')} aria-label="settings - desktop navigation">
          Settings
        </a>
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="mobile menu"
        aria-expanded={isMobileMenuOpen}
      >
        Menu
      </button>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`absolute top-16 left-0 w-full bg-white shadow-lg md:hidden ${isMobileMenuOpen ? '' : 'hidden'}`}
        data-testid="mobile-menu"
        aria-hidden={!isMobileMenuOpen}
        onKeyDown={handleKeyDown}
      >
        <nav className="flex flex-col p-4 space-y-4">
          <a
            ref={firstFocusableRef}
            href="/dashboard"
            onClick={() => onNavClick('dashboard')}
            aria-label="dashboard - mobile navigation"
            tabIndex={isMobileMenuOpen ? 0 : -1}
          >
            Dashboard
          </a>
          <a
            href="/projects"
            onClick={() => onNavClick('projects')}
            aria-label="projects - mobile navigation"
            tabIndex={isMobileMenuOpen ? 0 : -1}
          >
            Projects
          </a>
          <a
            ref={lastFocusableRef}
            href="/settings"
            onClick={() => onNavClick('settings')}
            aria-label="settings - mobile navigation"
            tabIndex={isMobileMenuOpen ? 0 : -1}
          >
            Settings
          </a>
        </nav>
      </div>

      {/* User Menu */}
      <button
        className="flex items-center space-x-2"
        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
        aria-label="user menu"
      >
        <span>User</span>
      </button>

      {/* User Dropdown */}
      <div
        className={`absolute top-16 right-4 bg-white shadow-lg ${isUserDropdownOpen ? '' : 'hidden'}`}
        data-testid="user-dropdown"
      >
        <div className="p-4">
          <p>User settings</p>
        </div>
      </div>
    </header>
  );
};
