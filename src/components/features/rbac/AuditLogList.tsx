/**
 * AuditLogList Component
 * 
 * Displays a list of audit logs with filtering, pagination, and actions for viewing details.
 */

import React, { useState, useEffect } from 'react';
import { useRbac } from '../../../hooks/useRbac';
import { AuditLog } from '../../../types/rbac';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { DatePicker } from '../../ui/DatePicker';
import { Table } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { Eye, Filter } from 'lucide-react';
import { formatDate } from '@/utils/date';

interface AuditLogListProps {
  onViewDetails?: (log: AuditLog) => void;
  onFilterChange?: (filters: any) => void;
  className?: string;
}

export const AuditLogList: React.FC<AuditLogListProps> = ({
  onViewDetails,
  onFilterChange,
  className = '',
}) => {
  const { auditLog } = useRbac();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    action: 'CREATE',
    resourceType: 'ROLE',
    userId: 'user1'
  });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Filter audit logs based on search term
  const filteredLogs = auditLog.data.filter(log => 
    log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle filter change
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  // Define table columns
  const columns = [
    {
      header: 'Time',
      accessor: 'timestamp',
      cell: (log: AuditLog) => (
        <span className="whitespace-nowrap">
          {new Date(log.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'User',
      accessor: 'user_id',
      cell: (log: AuditLog) => <span>{log.user_id}</span>,
    },
    {
      header: 'Action',
      accessor: 'action',
      cell: (log: AuditLog) => (
        <Badge 
          variant={
            log.action === 'CREATE' ? 'success' : 
            log.action === 'UPDATE' ? 'warning' : 
            log.action === 'DELETE' ? 'error' : 'info'
          }
        >
          {log.action}
        </Badge>
      ),
    },
    {
      header: 'Resource Type',
      accessor: 'resource_type',
      cell: (log: AuditLog) => <span>{log.resource_type}</span>,
    },
    {
      header: 'Details',
      accessor: 'details',
      cell: (log: AuditLog) => (
        <span className="truncate max-w-xs inline-block">{log.details}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (log: AuditLog) => (
        <div className="flex justify-end">
          {onViewDetails && (
            <Button 
              variant="tertiary" 
              size="small" 
              onClick={() => onViewDetails(log)}
              className="flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
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
          disabled={currentPage === 1 || auditLog.loading}
        >
          Previous
        </Button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'tertiary'}
            size="small"
            onClick={() => handlePageChange(page)}
            disabled={auditLog.loading}
          >
            {page}
          </Button>
        ))}
        
        <Button 
          variant="tertiary" 
          size="small" 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || auditLog.loading}
        >
          Next
        </Button>
      </div>
    );
  };

  // Render filter panel
  const renderFilterPanel = () => {
    if (!isFilterExpanded) return null;

    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
        <h3 className="text-lg font-medium mb-4">Filter Audit Logs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input 
              type="date" 
              value={filters.startDate} 
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input 
              type="date" 
              value={filters.endDate} 
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Action</label>
            <Select 
              value={filters.action} 
              onValueChange={(value) => handleFilterChange('action', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="">All Actions</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Resource Type</label>
            <Select 
              value={filters.resourceType} 
              onValueChange={(value) => handleFilterChange('resourceType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ROLE">Role</SelectItem>
                <SelectItem value="PERMISSION">Permission</SelectItem>
                <SelectItem value="RESOURCE">Resource</SelectItem>
                <SelectItem value="">All Resources</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <Input 
              type="text" 
              value={filters.userId} 
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="Enter user ID"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={applyFilters}
            className="flex items-center"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    );
  };

  // Render loading state
  if (auditLog.loading && auditLog.data.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>Loading audit logs...</p>
      </div>
    );
  }

  // Render error state
  if (auditLog.error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>{auditLog.error}</p>
      </div>
    );
  }

  // Render empty state
  if (auditLog.data.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>No audit logs found.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and filter controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <Input
          type="search"
          placeholder="Search audit logs..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-md flex-1"
          aria-label="Search audit logs"
        />
        
        <Button 
          variant="secondary" 
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="flex items-center"
        >
          <Filter className="h-4 w-4 mr-1" />
          {isFilterExpanded ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Filter panel */}
      {renderFilterPanel()}

      {/* Audit logs table */}
      <div className="overflow-x-auto">
        <Table
          data={currentLogs}
          columns={columns}
          emptyMessage="No audit logs found"
        />
      </div>

      {/* Pagination controls */}
      {renderPagination()}

      {/* Results count */}
      <div className="text-sm text-gray-500 mt-2">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} audit logs
      </div>
    </div>
  );
}; 