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
import { Table } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { formatDate } from '@/utils/date';

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
            variant={page === currentPage ? 'default' : 'tertiary'}
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
          variant="default" 
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

  const columns = [
    {
      header: 'User ID',
      accessor: 'user_id' as keyof UserRole,
    },
    {
      header: 'Role ID',
      accessor: 'role_id' as keyof UserRole,
    },
    {
      header: 'Status',
      accessor: 'is_active' as keyof UserRole,
      cell: (value: boolean) => (
        <Badge variant={value ? 'success' : 'error'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Delegated By',
      accessor: 'delegated_by' as keyof UserRole,
    },
    {
      header: 'Created At',
      accessor: 'created_at' as keyof UserRole,
      cell: (value: string) => formatDate(value),
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof UserRole,
      cell: (value: string, row: UserRole) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="small"
            onClick={() => onActivateUserRole && onActivateUserRole(row)}
          >
            Edit
          </Button>
          {row.is_active ? (
            <Button
              variant="destructive"
              size="small"
              onClick={() => onDeactivateUserRole && onDeactivateUserRole(row)}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="small"
              onClick={() => onActivateUserRole && onActivateUserRole(row)}
            >
              Activate
            </Button>
          )}
          {onDelegateUserRole && (
            <Button
              variant="default"
              size="small"
              onClick={() => onDelegateUserRole(row)}
            >
              Delegate
            </Button>
          )}
        </div>
      ),
    },
  ];

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
        <Table
          data={currentUserRoles}
          columns={columns}
          emptyMessage="No user roles found"
        />
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