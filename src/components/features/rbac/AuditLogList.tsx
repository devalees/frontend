/**
 * AuditLogList Component
 * 
 * Displays a list of audit logs with filtering, pagination, and actions for viewing details.
 */

import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { NavButton } from '../../ui/NavButton';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Badge } from '../../ui/Badge';
import { Eye, Filter } from 'lucide-react';

// Mock audit log data interface
interface AuditLogItem {
  id: string;
  timestamp: string;
  user_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  resource_type: string;
  resource_id: string;
  details: string;
  ip_address: string;
  user_agent: string;
}

// Mock data
const mockAuditLogs: AuditLogItem[] = [
  {
    id: '1',
    timestamp: '2024-04-21T14:32:21Z',
    user_id: 'admin',
    action: 'CREATE',
    resource_type: 'ROLE',
    resource_id: 'role-123',
    details: 'Created new admin role',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0'
  },
  {
    id: '2',
    timestamp: '2024-04-21T15:15:45Z',
    user_id: 'admin',
    action: 'UPDATE',
    resource_type: 'PERMISSION',
    resource_id: 'perm-456',
    details: 'Updated view permission for documents',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0'
  },
  {
    id: '3',
    timestamp: '2024-04-22T09:05:12Z',
    user_id: 'john.doe',
    action: 'DELETE',
    resource_type: 'USER_ROLE',
    resource_id: 'user-role-789',
    details: 'Removed editor role from user',
    ip_address: '192.168.1.2',
    user_agent: 'Mozilla/5.0'
  },
  {
    id: '4',
    timestamp: '2024-04-22T10:30:00Z',
    user_id: 'jane.smith',
    action: 'VIEW',
    resource_type: 'RESOURCE',
    resource_id: 'resource-101',
    details: 'Viewed sensitive customer data',
    ip_address: '192.168.1.3',
    user_agent: 'Mozilla/5.0'
  },
  {
    id: '5',
    timestamp: '2024-04-22T11:45:33Z',
    user_id: 'admin',
    action: 'CREATE',
    resource_type: 'RESOURCE_ACCESS',
    resource_id: 'access-202',
    details: 'Created new access permission for marketing team',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0'
  }
];

interface AuditLogListProps {
  onViewDetails?: (log: AuditLogItem) => void;
  onFilterChange?: (filters: Record<string, string>) => void;
  className?: string;
}

export const AuditLogList: React.FC<AuditLogListProps> = ({
  onViewDetails,
  onFilterChange,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    action: '',
    resourceType: '',
    userId: ''
  });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Filter audit logs based on search term
  const filteredLogs = mockAuditLogs.filter(log => 
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_id.toLowerCase().includes(searchTerm.toLowerCase())
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
      cell: (log: AuditLogItem) => (
        <span className="whitespace-nowrap">
          {new Date(log.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'User',
      accessor: 'user_id',
      cell: (log: AuditLogItem) => <span>{log.user_id}</span>,
    },
    {
      header: 'Action',
      accessor: 'action',
      cell: (log: AuditLogItem) => (
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
      cell: (log: AuditLogItem) => <span>{log.resource_type}</span>,
    },
    {
      header: 'Details',
      accessor: 'details',
      cell: (log: AuditLogItem) => (
        <span className="truncate max-w-xs inline-block">{log.details}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (log: AuditLogItem) => (
        <div className="flex justify-end">
          {onViewDetails && (
            <NavButton 
              variant="tertiary" 
              size="small" 
              href={`/audit-logs/${log.id}`}
              onClick={() => onViewDetails(log)}
              className="flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </NavButton>
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
        <NavButton 
          variant="tertiary" 
          size="small" 
          href="#"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </NavButton>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <NavButton
            key={page}
            variant={page === currentPage ? 'default' : 'tertiary'}
            size="small"
            href="#"
            onClick={() => handlePageChange(page)}
            disabled={isLoading}
          >
            {page}
          </NavButton>
        ))}
        
        <NavButton 
          variant="tertiary" 
          size="small" 
          href="#"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          Next
        </NavButton>
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
              options={[
                { value: 'CREATE', label: 'Create' },
                { value: 'UPDATE', label: 'Update' },
                { value: 'DELETE', label: 'Delete' },
                { value: 'VIEW', label: 'View' },
                { value: '', label: 'All Actions' }
              ]}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              placeholder="Select action"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Resource Type</label>
            <Select 
              value={filters.resourceType}
              options={[
                { value: 'ROLE', label: 'Role' },
                { value: 'PERMISSION', label: 'Permission' },
                { value: 'RESOURCE', label: 'Resource' },
                { value: 'USER_ROLE', label: 'User Role' },
                { value: 'RESOURCE_ACCESS', label: 'Resource Access' },
                { value: '', label: 'All Resources' }
              ]}
              onChange={(e) => handleFilterChange('resourceType', e.target.value)}
              placeholder="Select resource type"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <Input 
              type="text" 
              placeholder="Enter user ID" 
              value={filters.userId} 
              onChange={(e) => handleFilterChange('userId', e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end space-x-2">
          <Button 
            variant="tertiary" 
            onClick={() => setFilters({
              startDate: '2024-01-01',
              endDate: '2024-12-31',
              action: '',
              resourceType: '',
              userId: ''
            })}
          >
            Reset
          </Button>
          <Button onClick={applyFilters}>Apply Filters</Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <Input
          type="search"
          placeholder="Search audit logs..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-md"
        />
        <Button 
          variant="tertiary" 
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                {columns.map((column, index) => (
                  <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {column.cell(log)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {filteredLogs.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No audit logs found.</p>
        </div>
      )}

      {/* Pagination controls */}
      {renderPagination()}
    </div>
  );
}; 