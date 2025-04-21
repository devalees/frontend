import React, { useState, useMemo } from 'react';
import { useRbac } from '@/hooks/useRbac';
import { Resource } from '@/types/rbac';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';

interface ResourceListProps {
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  onViewAccess?: (resource: Resource) => void;
}

export const ResourceList: React.FC<ResourceListProps> = ({
  onEdit,
  onDelete,
  onViewAccess,
}) => {
  const { resources } = useRbac();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredResources = useMemo(() => {
    if (!resources?.data) return [];
    return resources.data.filter((resource) =>
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [resources, searchQuery]);

  const paginatedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredResources.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredResources, currentPage]);

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);

  if (resources?.loading) {
    return <Spinner data-testid="spinner" />;
  }

  if (resources?.error) {
    return <div className="text-red-500">Error: {resources.error}</div>;
  }

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof Resource,
    },
    {
      header: 'Type',
      accessor: 'type' as keyof Resource,
      cell: (_: any, resource: Resource) => (
        <Badge variant="info">{resource.type}</Badge>
      ),
    },
    {
      header: 'Description',
      accessor: 'description' as keyof Resource,
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Resource,
      cell: (_: any, resource: Resource) => (
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="small"
              onClick={() => onEdit(resource)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="small"
              onClick={() => onDelete(resource)}
            >
              Delete
            </Button>
          )}
          {onViewAccess && (
            <Button
              variant="secondary"
              size="small"
              onClick={() => onViewAccess(resource)}
            >
              View Access
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table
        data={paginatedResources}
        columns={columns}
      />

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {paginatedResources.length} of {filteredResources.length} resources
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="small"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}; 