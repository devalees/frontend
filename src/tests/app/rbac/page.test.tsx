import React from 'react';
import { render, screen } from '@testing-library/react';
import RBACDashboardPage from '@/app/(dashboard)/rbac/page';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('RBAC Dashboard Page', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it('renders the RBAC dashboard page with all section cards', () => {
    render(<RBACDashboardPage />);
    
    // Check for page title
    expect(screen.getByText('RBAC Management Dashboard')).toBeInTheDocument();
    
    // Check for all section cards
    expect(screen.getByText('Roles')).toBeInTheDocument();
    expect(screen.getByText('Permissions')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('User Roles')).toBeInTheDocument();
    expect(screen.getByText('Resource Accesses')).toBeInTheDocument();
    expect(screen.getByText('Organization Contexts')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    
    // Check for all "Manage" buttons
    expect(screen.getByText('Manage Roles')).toBeInTheDocument();
    expect(screen.getByText('Manage Permissions')).toBeInTheDocument();
    expect(screen.getByText('Manage Resources')).toBeInTheDocument();
    expect(screen.getByText('Manage User Roles')).toBeInTheDocument();
    expect(screen.getByText('Manage Resource Accesses')).toBeInTheDocument();
    expect(screen.getByText('Manage Organization Contexts')).toBeInTheDocument();
    expect(screen.getByText('Manage Audit Logs')).toBeInTheDocument();
  });
}); 