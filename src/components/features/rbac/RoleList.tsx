/**
 * RoleList Component
 * 
 * Displays a list of roles with filtering, pagination, and actions for edit, delete, and view permissions.
 */

import React, { useState, useEffect } from 'react';
import { useRbac } from '../../../hooks/useRbac';
import { Role } from '../../../types/rbac';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Grid, GridItem } from '../../layout/Grid';

interface RoleListProps {
  onEditRole?: (role: Role) => void;
  onDeleteRole?: (role: Role) => void;
  onViewPermissions?: (role: Role) => void;
  className?: string;
}

export const RoleList: React.FC<RoleListProps> = ({
  onEditRole,
  onDeleteRole,
  onViewPermissions,
  className = '',
}) => {
  const { roles } = useRbac();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch roles on component mount
  useEffect(() => {
    const loadRoles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await roles.fetch();
      } catch (err) {
        setError('Failed to load roles. Please try again.');
        console.error('Error loading roles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoles();
  }, [roles]);

  // Filter roles based on search term
  const filteredRoles = roles.data.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoles = filteredRoles.slice(startIndex, endIndex);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle role deletion
  const handleDeleteRole = async (role: Role) => {
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      setIsLoading(true);
      setError(null);
      try {
        await roles.remove(role.id);
      } catch (err) {
        setError('Failed to delete role. Please try again.');
        console.error('Error deleting role:', err);
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
  if (isLoading && roles.data.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>Loading roles...</p>
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
          onClick={() => roles.fetch()} 
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Render empty state
  if (roles.data.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>No roles found.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and filter controls */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search roles..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-md"
          aria-label="Search roles"
        />
      </div>

      {/* Roles table */}
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
            {currentRoles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {role.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {role.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    role.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {role.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {onViewPermissions && (
                    <Button 
                      variant="tertiary" 
                      size="small" 
                      onClick={() => onViewPermissions(role)}
                      disabled={isLoading}
                    >
                      Permissions
                    </Button>
                  )}
                  {onEditRole && (
                    <Button 
                      variant="tertiary" 
                      size="small" 
                      onClick={() => onEditRole(role)}
                      disabled={isLoading}
                    >
                      Edit
                    </Button>
                  )}
                  {onDeleteRole && (
                    <Button 
                      variant="tertiary" 
                      size="small" 
                      onClick={() => handleDeleteRole(role)}
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
        Showing {startIndex + 1}-{Math.min(endIndex, filteredRoles.length)} of {filteredRoles.length} roles
      </div>
    </div>
  );
}; 