/**
 * PermissionList Component
 * 
 * Displays a list of permissions with filtering, pagination, and actions for edit and delete.
 */

import React, { useState, useEffect } from 'react';
import { useRbac } from '../../../hooks/useRbac';
import { Permission } from '../../../types/rbac';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Grid, GridItem } from '../../layout/Grid';
import { useStore } from '../../../lib/store';

interface PermissionListProps {
  onEditPermission?: (permission: Permission) => void;
  onDeletePermission?: (permission: Permission) => void;
  className?: string;
}

export const PermissionList: React.FC<PermissionListProps> = ({
  onEditPermission,
  onDeletePermission,
  className = '',
}) => {
  const { permissions } = useRbac();
  const store = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch permissions on component mount
  useEffect(() => {
    const loadPermissions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await permissions.fetch();
      } catch (err) {
        setError('Failed to load permissions. Please try again.');
        console.error('Error loading permissions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
    // Only run this effect once on component mount
  }, []);

  // Filter permissions based on search term
  const filteredPermissions = permissions.data.filter(permission => 
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPermissions = filteredPermissions.slice(startIndex, endIndex);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle permission deletion
  const handleDeletePermission = async (permission: Permission) => {
    if (onDeletePermission) {
      onDeletePermission(permission);
    } else if (window.confirm(`Are you sure you want to delete the permission "${permission.name}"?`)) {
      setIsLoading(true);
      setError(null);
      try {
        await permissions.delete(permission.id);
      } catch (err) {
        setError('Failed to delete permission. Please try again.');
        console.error('Error deleting permission:', err);
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
  if (isLoading && permissions.data.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>Loading permissions...</p>
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
          onClick={() => permissions.fetch()} 
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Render empty state
  if (permissions.data.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>No permissions found.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and filter controls */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-md"
          aria-label="Search permissions"
        />
      </div>

      {/* Permissions table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
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
            {currentPermissions.map((permission) => (
              <tr key={permission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {permission.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {permission.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    permission.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {permission.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {onEditPermission && (
                    <Button 
                      variant="tertiary" 
                      size="small" 
                      onClick={() => onEditPermission(permission)}
                      disabled={isLoading}
                    >
                      Edit
                    </Button>
                  )}
                  {onDeletePermission && (
                    <Button 
                      variant="tertiary" 
                      size="small" 
                      onClick={() => handleDeletePermission(permission)}
                      disabled={isLoading}
                    >
                      Delete
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
        Showing {startIndex + 1}-{Math.min(endIndex, filteredPermissions.length)} of {filteredPermissions.length} permissions
      </div>
    </div>
  );
};

export default PermissionList; 