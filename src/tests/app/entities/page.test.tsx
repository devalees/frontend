import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import EntitiesPage from '@/app/(dashboard)/entities/page';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('EntitiesPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders the entities page with title and breadcrumbs', () => {
    render(<EntitiesPage />);
    
    expect(screen.getByRole('heading', { name: 'Entity Management' })).toBeInTheDocument();
    expect(screen.getByText('Manage organizations, departments, teams, and members')).toBeInTheDocument();
  });

  it('renders all entity sections', () => {
    render(<EntitiesPage />);
    
    expect(screen.getByText('Organizations')).toBeInTheDocument();
    expect(screen.getByText('Departments')).toBeInTheDocument();
    expect(screen.getByText('Teams')).toBeInTheDocument();
    expect(screen.getByText('Team Members')).toBeInTheDocument();
    expect(screen.getByText('Organization Settings')).toBeInTheDocument();
  });

  it('navigates to organizations page when organizations button is clicked', () => {
    render(<EntitiesPage />);
    
    fireEvent.click(screen.getByTestId('navigate-to-organizations'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/organizations');
  });

  it('navigates to departments page when departments button is clicked', () => {
    render(<EntitiesPage />);
    
    fireEvent.click(screen.getByTestId('navigate-to-departments'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/departments');
  });

  it('navigates to teams page when teams button is clicked', () => {
    render(<EntitiesPage />);
    
    fireEvent.click(screen.getByTestId('navigate-to-teams'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/teams');
  });

  it('navigates to team members page when team members button is clicked', () => {
    render(<EntitiesPage />);
    
    fireEvent.click(screen.getByTestId('navigate-to-team-members'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/team-members');
  });

  it('navigates to organization settings page when organization settings button is clicked', () => {
    render(<EntitiesPage />);
    
    fireEvent.click(screen.getByTestId('navigate-to-organization-settings'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/organization-settings');
  });
}); 