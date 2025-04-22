import React, { useEffect, useState } from 'react';
import { Department } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PaginatedList } from '@/components/PaginatedList';

interface DepartmentListProps {
  onEdit?: (department: Department) => void;
  onDelete?: (department: Department) => void;
  onViewDetails?: (department: Department) => void;
}

export const DepartmentList: React.FC<DepartmentListProps> = ({
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const { departments, loading, error, fetchDepartments } = useEntityStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDepartments.length / 10);

  const columns: Column<Department>[] = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (value) => (
        <div className="flex items-center">
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      header: 'Description',
      accessor: 'description',
      cell: (value) => value || 'N/A'
    },
    {
      header: 'Location',
      accessor: 'location',
      cell: (value) => value || 'N/A'
    },
    {
      header: 'Headcount',
      accessor: 'headcount',
      cell: (value) => value || 'N/A'
    },
    {
      header: 'Budget',
      accessor: 'budget',
      cell: (value) => value ? `$${value.toLocaleString()}` : 'N/A'
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
              onClick={() => onViewDetails(row)}
              href="#"
              data-testid="view-details-button"
            >
              View
            </NavButton>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="small"
              onClick={() => onEdit(row)}
              data-testid="edit-button"
            >
              Edit
            </Button>
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
    return <div data-testid="loading">Loading departments...</div>;
  }

  if (error) {
    return <div data-testid="error">{error}</div>;
  }

  const renderItem = (department: Department) => (
    <Table
      data={[department]}
      columns={columns}
      emptyMessage="No departments found"
    />
  );

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    // If we need to fetch data from the server, we can do it here
    // await fetchDepartments({ page });
  };

  return (
    <div data-testid="department-list" className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          type="search"
          placeholder="Filter departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
          data-testid="search-input"
        />
      </div>

      <PaginatedList
        data={filteredDepartments}
        totalPages={totalPages}
        currentPage={currentPage}
        isLoading={loading}
        fetchPage={handlePageChange}
        renderItem={renderItem}
        emptyMessage="No departments found"
      />
    </div>
  );
};

export default DepartmentList; 