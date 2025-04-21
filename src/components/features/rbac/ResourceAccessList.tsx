import React, { useState, useEffect } from 'react';
import { useRbac } from '@/hooks/useRbac';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { ResourceAccess } from '@/types/rbac';
import { Column } from '@/components/ui/Table';

interface ResourceAccessListProps {
  onEdit?: (access: ResourceAccess) => void;
  onDelete?: (access: ResourceAccess) => void;
  onActivate?: (access: ResourceAccess) => void;
  onDeactivate?: (access: ResourceAccess) => void;
}

export const ResourceAccessList: React.FC<ResourceAccessListProps> = ({
  onEdit,
  onDelete,
  onActivate,
  onDeactivate
}) => {
  const { resourceAccesses, loading, error, fetchResourceAccesses } = useRbac();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchResourceAccesses();
  }, [fetchResourceAccesses]);

  const filteredData = resourceAccesses?.data?.results?.filter((access: ResourceAccess) => 
    access.resource_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    access.role_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<ResourceAccess>[] = [
    {
      header: 'Resource',
      accessor: 'resource_id',
      cell: (value: string) => <span>{value}</span>
    },
    {
      header: 'Role',
      accessor: 'role_id',
      cell: (value: string) => <span>{value}</span>
    },
    {
      header: 'Permission',
      accessor: 'permission_id',
      cell: (value: string) => <span>{value}</span>
    },
    {
      header: 'Status',
      accessor: 'is_active',
      cell: (value: boolean) => (
        <Badge variant={value ? 'success' : 'error'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (_: unknown, row: ResourceAccess) => (
        <div className="flex space-x-2">
          {onEdit && (
            <Button
              variant="outline"
              size="small"
              onClick={() => onEdit(row)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="small"
              onClick={() => onDelete(row)}
            >
              Delete
            </Button>
          )}
          {onActivate && !row.is_active && (
            <Button
              variant="default"
              size="small"
              onClick={() => onActivate(row)}
            >
              Activate
            </Button>
          )}
          {onDeactivate && row.is_active && (
            <Button
              variant="default"
              size="small"
              onClick={() => onDeactivate(row)}
            >
              Deactivate
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Table
        data={paginatedData}
        columns={columns}
        pagination={{
          currentPage,
          totalPages: Math.ceil((filteredData.length || 0) / itemsPerPage),
          onPageChange: setCurrentPage
        }}
      />
    </div>
  );
}; 