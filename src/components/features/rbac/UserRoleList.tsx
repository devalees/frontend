/**
 * UserRoleList Component
 * 
 * Displays a list of user roles with filtering, pagination, and actions for activate, deactivate, and delegate.
 */

import React, { useState, useEffect } from 'react';
import { useRbac } from '../../../hooks/useRbac';
import { UserRole } from '../../../types/rbac';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Grid, GridItem } from '../../layout/Grid';

interface UserRoleListProps {
  onActivateUserRole?: (userRole: UserRole) => void;
  onDeactivateUserRole?: (userRole: UserRole) => void;
  onDelegateUserRole?: (userRole: UserRole) => void;
  className?: string;
}

export const UserRoleList: React.FC<UserRoleListProps> = ({
  onActivateUserRole,
  onDeactivateUserRole,
  onDelegateUserRole,
  className = '',
}) => {
  const { userRoles, roles } = useRbac();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user roles on component mount
  useEffect(() => {
    const loadUserRoles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await userRoles.fetch();
      } catch (err) {
        setError('Failed to load user roles. Please try again.');
        console.error('Error loading user roles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRoles();
  }, [userRoles]);

  // Filter user roles based on search term
  const filteredUserRoles = userRoles.data.filter(userRole => 
    userRole.user_id.toString().includes(searchTerm.toLowerCase()) ||
    userRole.role_id.toString().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUserRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUserRoles = filteredUserRoles.slice(startIndex, endIndex);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle user role activation
  const handleActivateUserRole = async (userRole: UserRole) => {
    if (window.confirm(`Are you sure you want to activate this user role?`)) {
      setIsLoading(true);
      setError(null);
      try {
        await roles.update(userRole.role_id, { is_active: true });
        await userRoles.fetch(); // Refresh the list
      } catch (err) {
        setError('Failed to activate user role. Please try again.');
        console.error('Error activating user role:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle user role deactivation
  const handleDeactivateUserRole = async (userRole: UserRole) => {
    if (window.confirm(`Are you sure you want to deactivate this user role?`)) {
      setIsLoading(true);
      setError(null);
      try {
        await roles.update(userRole.role_id, { is_active: false });
        await userRoles.fetch(); // Refresh the list
      } catch (err) {
        setError('Failed to deactivate user role. Please try again.');
        console.error('Error deactivating user role:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle user role delegation
  const handleDelegateUserRole = async (userRole: UserRole) => {
    if (window.confirm(`Are you sure you want to delegate this user role?`)) {
      setIsLoading(true);
      setError(null);
      try {
        // For delegation, we'll update the role's active status
        await roles.update(userRole.role_id, { is_active: true });
        await userRoles.fetch(); // Refresh the list
      } catch (err) {
        setError('Failed to delegate user role. Please try again.');
        console.error('Error delegating user role:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-4 space-x-2">
        <Button 
          variant="tertiary" 
          size="small" 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </Button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Button
            key={page}
            variant={page === currentPage ? 'primary' : 'tertiary'}
            size="small"
            onClick={() => handlePageChange(page)}
            disabled={isLoading}
          >
            {page}
          </Button>
        ))}
        
        <Button 
          variant="tertiary" 
          size="small" 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    );
  };

  // Render loading state
  if (isLoading && userRoles.data.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>Loading user roles...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>{error}</p>
        <Button 
          variant="primary" 
          onClick={() => userRoles.fetch()} 
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Render empty state
  if (userRoles.data.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>No user roles found.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and filter controls */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search user roles..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-md"
          aria-label="Search user roles"
        />
      </div>

      {/* User roles table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUserRoles.map((userRole) => (
              <tr key={userRole.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {userRole.user_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {userRole.role_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    userRole.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {userRole.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {onActivateUserRole && (
                    <Button 
                      variant="tertiary" 
                      size="small" 
                      onClick={() => handleActivateUserRole(userRole)}
                      disabled={isLoading}
                    >
                      Activate
                    </Button>
                  )}
                  {onDeactivateUserRole && (
                    <Button 
                      variant="tertiary" 
                      size="small" 
                      onClick={() => handleDeactivateUserRole(userRole)}
                      disabled={isLoading}
                    >
                      Deactivate
                    </Button>
                  )}
                  {onDelegateUserRole && (
                    <Button 
                      variant="tertiary" 
                      size="small" 
                      onClick={() => handleDelegateUserRole(userRole)}
                      disabled={isLoading}
                    >
                      Delegate
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {renderPagination()}

      {/* Results count */}
      <div className="text-sm text-gray-500 mt-2">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredUserRoles.length)} of {filteredUserRoles.length} user roles
      </div>
    </div>
  );
}; 