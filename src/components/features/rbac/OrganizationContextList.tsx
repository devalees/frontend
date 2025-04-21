/**
 * OrganizationContextList Component
 * 
 * Displays a list of organization contexts with filtering, pagination, and actions for edit, delete, activate, deactivate, and view hierarchy.
 */

import React, { useState, useEffect } from 'react';
import { useRbac } from '../../../hooks/useRbac';
import { OrganizationContext } from '../../../types/rbac';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Table } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { Network, Edit, Trash2, Play, Pause } from 'lucide-react';

interface OrganizationContextListProps {
  onEdit?: (context: OrganizationContext) => void;
  onDelete?: (context: OrganizationContext) => void;
  onActivate?: (context: OrganizationContext) => void;
  onDeactivate?: (context: OrganizationContext) => void;
  onViewHierarchy?: (context: OrganizationContext) => void;
  className?: string;
}

export const OrganizationContextList: React.FC<OrganizationContextListProps> = ({
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onViewHierarchy,
  className = '',
}) => {
  const { organizationContext } = useRbac();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter organization contexts based on search term
  const filteredContexts = organizationContext.data.filter(context => 
    context.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    context.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredContexts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContexts = filteredContexts.slice(startIndex, endIndex);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Define table columns
  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (context: OrganizationContext) => <span className="font-medium">{context.name}</span>,
    },
    {
      header: 'Description',
      accessor: 'description',
      cell: (context: OrganizationContext) => <span>{context.description}</span>,
    },
    {
      header: 'Parent',
      accessor: 'parent_id',
      cell: (context: OrganizationContext) => (
        <span>{context.parent_id ? `ID: ${context.parent_id}` : 'None (Root)'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      cell: (context: OrganizationContext) => (
        <Badge variant={context.is_active ? 'success' : 'destructive'}>
          {context.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (context: OrganizationContext) => (
        <div className="flex space-x-2 justify-end">
          {onViewHierarchy && (
            <Button 
              variant="tertiary" 
              size="small" 
              onClick={() => onViewHierarchy(context)}
              className="flex items-center"
            >
              <Network className="h-4 w-4 mr-1" />
              Hierarchy
            </Button>
          )}
          {!context.is_active && onActivate && (
            <Button 
              variant="tertiary" 
              size="small" 
              onClick={() => onActivate(context)}
              className="flex items-center"
            >
              <Play className="h-4 w-4 mr-1" />
              Activate
            </Button>
          )}
          {context.is_active && onDeactivate && (
            <Button 
              variant="tertiary" 
              size="small" 
              onClick={() => onDeactivate(context)}
              className="flex items-center"
            >
              <Pause className="h-4 w-4 mr-1" />
              Deactivate
            </Button>
          )}
          {onEdit && (
            <Button 
              variant="tertiary" 
              size="small" 
              onClick={() => onEdit(context)}
              className="flex items-center"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="tertiary" 
              size="small" 
              onClick={() => onDelete(context)}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-4 space-x-2">
        <Button 
          variant="tertiary" 
          size="small" 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || organizationContext.loading}
        >
          Previous
        </Button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'tertiary'}
            size="small"
            onClick={() => handlePageChange(page)}
            disabled={organizationContext.loading}
          >
            {page}
          </Button>
        ))}
        
        <Button 
          variant="tertiary" 
          size="small" 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || organizationContext.loading}
        >
          Next
        </Button>
      </div>
    );
  };

  // Render loading state
  if (organizationContext.loading && organizationContext.data.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>Loading organization contexts...</p>
      </div>
    );
  }

  // Render error state
  if (organizationContext.error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>{organizationContext.error}</p>
      </div>
    );
  }

  // Render empty state
  if (organizationContext.data.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>No organization contexts found.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and filter controls */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search organization contexts..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-md"
          aria-label="Search organization contexts"
        />
      </div>

      {/* Organization contexts table */}
      <div className="overflow-x-auto">
        <Table
          data={currentContexts}
          columns={columns}
          emptyMessage="No organization contexts found"
        />
      </div>

      {/* Pagination controls */}
      {renderPagination()}

      {/* Results count */}
      <div className="text-sm text-gray-500 mt-2">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredContexts.length)} of {filteredContexts.length} organization contexts
      </div>
    </div>
  );
}; 