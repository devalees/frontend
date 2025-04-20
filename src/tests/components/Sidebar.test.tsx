/**
 * Sidebar Component Tests
 * 
 * This file contains failing tests for the Sidebar component following the test-driven development approach.
 * These tests will fail until the Sidebar component is implemented to match the expected behavior.
 */

import React from 'react';
import { render, screen, fireEvent, describe, it, expect, vi } from '../../tests/utils';

// Import the Sidebar component
import { Sidebar } from '../../components/layout/Sidebar';

describe('Sidebar Component', () => {
  // Test layout
  describe('Layout', () => {
    it('should render with correct base structure', () => {
      render(<Sidebar />);
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass('h-full');
    });

    it('should render with correct width when expanded', () => {
      render(<Sidebar expanded={true} />);
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('w-64');
    });

    it('should render with correct width when collapsed', () => {
      render(<Sidebar expanded={false} />);
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('w-16');
    });

    it('should render navigation items correctly', () => {
      const navItems = [
        { id: 'home', label: 'Home', icon: 'home' },
        { id: 'projects', label: 'Projects', icon: 'folder' },
        { id: 'tasks', label: 'Tasks', icon: 'checklist' }
      ];
      render(<Sidebar navItems={navItems} />);
      
      navItems.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });
  });

  // Test interactions
  describe('Interactions', () => {
    it('should handle toggle button click correctly', () => {
      const handleToggle = jest.fn();
      const { rerender } = render(<Sidebar expanded={false} onToggle={handleToggle} />);
      const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
      
      // Click should trigger onToggle
      fireEvent.click(toggleButton);
      expect(handleToggle).toHaveBeenCalledTimes(1);
      
      // Sidebar width should reflect the expanded prop
      rerender(<Sidebar expanded={true} onToggle={handleToggle} />);
      expect(screen.getByRole('complementary')).toHaveClass('w-64');
      
      rerender(<Sidebar expanded={false} onToggle={handleToggle} />);
      expect(screen.getByRole('complementary')).toHaveClass('w-16');
    });

    it('should call onToggle callback when toggle button is clicked', () => {
      const handleToggle = jest.fn();
      render(<Sidebar expanded={false} onToggle={handleToggle} />);
      const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
      
      fireEvent.click(toggleButton);
      expect(handleToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onNavItemClick when a navigation item is clicked', () => {
      const handleNavItemClick = jest.fn();
      const navItems = [
        { id: 'home', label: 'Home', icon: 'home' },
        { id: 'projects', label: 'Projects', icon: 'folder' }
      ];
      
      render(<Sidebar navItems={navItems} onNavItemClick={handleNavItemClick} />);
      const homeItem = screen.getByRole('button', { name: /home/i });
      
      fireEvent.click(homeItem);
      expect(handleNavItemClick).toHaveBeenCalledWith('home');
    });
  });

  // Test responsiveness
  describe('Responsiveness', () => {
    it('should be hidden on mobile by default', () => {
      render(<Sidebar />);
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('hidden md:block');
    });

    it('should be visible on mobile when mobileMenuOpen is true', () => {
      render(<Sidebar mobileMenuOpen={true} />);
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('block');
    });

    it('should have correct z-index for mobile overlay', () => {
      render(<Sidebar mobileMenuOpen={true} />);
      const overlay = screen.getByTestId('sidebar-overlay');
      expect(overlay).toHaveClass('z-40');
    });
  });

  // Test accessibility
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Sidebar aria-label="Main navigation" />);
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('should have proper focus management', () => {
      render(<Sidebar />);
      const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
      
      fireEvent.focus(toggleButton);
      expect(toggleButton).toHaveClass('focus:outline-none focus:ring-2 focus:ring-primary-500');
    });

    it('should trap focus within sidebar when open on mobile', () => {
      render(<Sidebar mobileMenuOpen={true} />);
      
      const sidebar = screen.getByRole('complementary');
      const firstFocusableElement = sidebar.querySelector('button');
      
      expect(firstFocusableElement).toHaveFocus();
    });

    it('should have proper keyboard navigation for menu items', () => {
      const navItems = [
        { id: 'home', label: 'Home', icon: 'home' },
        { id: 'projects', label: 'Projects', icon: 'folder' },
        { id: 'tasks', label: 'Tasks', icon: 'checklist' }
      ];
      
      render(<Sidebar navItems={navItems} />);
      
      // Get navigation items by their button role and name
      const homeButton = screen.getByRole('button', { name: /home/i });
      const projectsButton = screen.getByRole('button', { name: /projects/i });
      
      // First item should be focusable
      homeButton.focus();
      expect(homeButton).toHaveFocus();
      
      // Tab should move to next item
      fireEvent.keyDown(homeButton, { key: 'Tab' });
      expect(projectsButton).toHaveFocus();
    });
  });
}); 