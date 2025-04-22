import React, { useEffect, useState } from 'react';
import { Organization } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PaginatedList } from '@/components/PaginatedList';

interface OrganizationListProps {
  onEdit?: (organization: Organization) => void;
  onDelete?: (organization: Organization) => void;
  onViewDetails?: (organization: Organization) => void;
}

export const OrganizationList: React.FC<OrganizationListProps> = ({
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const { organizations, loading, error, fetchOrganizations } = useEntityStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrganizations.length / 10);

  const columns: Column<Organization>[] = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (value, row) => (
        <div className="flex items-center">
          {row.logo_url && (
            <img
              src={row.logo_url}
              alt={`${row.name} logo`}
              className="w-8 h-8 mr-2 rounded-full"
            />
          )}
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      header: 'Industry',
      accessor: 'industry',
      cell: (value) => value || 'N/A'
    },
    {
      header: 'Size',
      accessor: 'size',
      cell: (value) => value || 'N/A'
    },
    {
      header: 'Status',
      accessor: 'is_active',
      cell: (value) => (
        <Badge variant={value ? 'success' : 'error'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (_, row) => (
        <div className="flex space-x-2">
          {onViewDetails && (
            <NavButton
              variant="outline"
              size="small"
              href={`/organizations/${row.id}`}
              onClick={() => onViewDetails(row)}
              data-testid="view-details-button"
            >
              View
            </NavButton>
          )}
          {onEdit && (
            <NavButton
              variant="outline"
              size="small"
              href={`/organizations/${row.id}/edit`}
              onClick={() => onEdit(row)}
              data-testid="edit-button"
            >
              Edit
            </NavButton>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="small"
              onClick={() => onDelete(row)}
              data-testid="delete-button"
            >
              Delete
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return <div data-testid="loading">Loading organizations...</div>;
  }

  if (error) {
    return <div data-testid="error">{error}</div>;
  }

  const renderItem = (organization: Organization) => (
    <Table
      data={[organization]}
      columns={columns}
      emptyMessage="No organizations found"
    />
  );

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    // If we need to fetch data from the server, we can do it here
    // await fetchOrganizations({ page });
  };

  return (
    <div data-testid="organization-list" className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          type="search"
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
          data-testid="search-input"
        />
      </div>

      <PaginatedList
        data={filteredOrganizations}
        totalPages={totalPages}
        currentPage={currentPage}
        isLoading={loading}
        fetchPage={handlePageChange}
        renderItem={renderItem}
        emptyMessage="No organizations found"
      />
    </div>
  );
};

export default OrganizationList; 