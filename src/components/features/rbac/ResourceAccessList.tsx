import React, { useState, ChangeEvent, useEffect } from 'react';
import { useRbac } from '@/hooks/useRbac';
import { Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { ResourceAccess } from '@/types/rbac';

interface ResourceAccessListProps {
  onEdit?: (resourceAccess: ResourceAccess) => void;
  onDelete?: (resourceAccess: ResourceAccess) => void;
  onActivate?: (resourceAccess: ResourceAccess) => void;
  onDeactivate?: (resourceAccess: ResourceAccess) => void;
}

export const ResourceAccessList: React.FC<ResourceAccessListProps> = ({
  onEdit,
  onDelete,
  onActivate,
  onDeactivate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { resourceAccess, fetchResourceAccesses } = useRbac();

  useEffect(() => {
    fetchResourceAccesses();
  }, []);

  const filteredData = React.useMemo(() => {
    if (!resourceAccess?.data) return [];
    return resourceAccess.data.filter((access: ResourceAccess) => 
      access.resource_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      access.role_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [resourceAccess?.data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / 10);

  const columns: Column<ResourceAccess>[] = [
    {
      header: 'Resource',
      accessor: 'resource_id' as keyof ResourceAccess,
      cell: (value: string) => <span>{value}</span>
    },
    {
      header: 'Role',
      accessor: 'role_id' as keyof ResourceAccess,
      cell: (value: string) => <span>{value}</span>
    },
    {
      header: 'Permission',
      accessor: 'permission_id' as keyof ResourceAccess,
      cell: (value: string) => <Badge variant="info">{value}</Badge>
    },
    {
      header: 'Status',
      accessor: 'is_active' as keyof ResourceAccess,
      cell: (value: boolean) => (
        <Badge variant={value ? 'success' : 'error'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (_value: string, item: ResourceAccess) => (
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(item)}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          )}
          {item.is_active ? (
            onDeactivate && (
              <button
                onClick={() => onDeactivate(item)}
                className="text-yellow-600 hover:text-yellow-800"
              >
                Deactivate
              </button>
            )
          ) : (
            onActivate && (
              <button
                onClick={() => onActivate(item)}
                className="text-green-600 hover:text-green-800"
              >
                Activate
              </button>
            )
          )}
        </div>
      )
    }
  ];

  if (resourceAccess?.loading) {
    return <div role="status"><Spinner data-testid="spinner" /></div>;
  }

  if (resourceAccess?.error) {
    return <div className="text-red-500">Error: {resourceAccess.error}</div>;
  }

  return (
    <div className="space-y-4">
      <Input
        type="search"
        value={searchTerm}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setSearchTerm(e.target.value);
        }}
        placeholder="Search resources..."
        className="max-w-md"
      />
      <Table
        data={filteredData}
        columns={columns}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage
        }}
      />
    </div>
  );
}; 