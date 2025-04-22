import React, { useEffect, useState } from 'react';
import { Team } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PaginatedList } from '@/components/PaginatedList';

interface TeamListProps {
  onEdit?: (team: Team) => void;
  onDelete?: (team: Team) => void;
  onViewDetails?: (team: Team) => void;
}

export const TeamList: React.FC<TeamListProps> = ({
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const { teams, loading, error, fetchTeams } = useEntityStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredTeams.length / 10);

  const columns: Column<Team>[] = [
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
      header: 'Size',
      accessor: 'size',
      cell: (value) => value || 'N/A'
    },
    {
      header: 'Skills',
      accessor: 'skills',
      cell: (value) => {
        if (!value || value.length === 0) return 'N/A';
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((skill: string, index: number) => (
              <Badge key={index} variant="info">
                {skill}
              </Badge>
            ))}
          </div>
        );
      }
    },
    {
      header: 'Department',
      accessor: 'department_id',
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
              href={`/teams/${row.id}`}
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
              href={`/teams/${row.id}/edit`}
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
    return <div data-testid="loading">Loading teams...</div>;
  }

  if (error) {
    return <div data-testid="error">{error}</div>;
  }

  const renderItem = (team: Team) => (
    <tr key={team.id}>
      <td>
        <div className="flex items-center">
          <span className="font-medium">{team.name}</span>
        </div>
      </td>
      <td>{team.description || 'N/A'}</td>
      <td>{team.size || 'N/A'}</td>
      <td>
        {!team.skills || team.skills.length === 0 ? 'N/A' : (
          <div className="flex flex-wrap gap-1">
            {team.skills.map((skill: string, index: number) => (
              <Badge key={index} variant="info">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </td>
      <td>{team.department_id || 'N/A'}</td>
      <td>
        <Badge variant={team.is_active ? 'success' : 'error'}>
          {team.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td>
        <div className="flex space-x-2">
          {onViewDetails && (
            <NavButton
              variant="outline"
              size="small"
              href={`/teams/${team.id}`}
              onClick={() => onViewDetails(team)}
              data-testid="view-details-button"
            >
              View
            </NavButton>
          )}
          {onEdit && (
            <NavButton
              variant="outline"
              size="small"
              href={`/teams/${team.id}/edit`}
              onClick={() => onEdit(team)}
              data-testid="edit-button"
            >
              Edit
            </NavButton>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="small"
              onClick={() => onDelete(team)}
              data-testid="delete-button"
            >
              Delete
            </Button>
          )}
        </div>
      </td>
    </tr>
  );

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    // If we need to fetch data from the server, we can do it here
    // await fetchTeams({ page });
  };

  return (
    <div data-testid="team-list" className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          type="search"
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
          data-testid="search-input"
        />
      </div>

      <PaginatedList
        data={filteredTeams}
        totalPages={totalPages}
        currentPage={currentPage}
        isLoading={loading}
        fetchPage={handlePageChange}
        renderItem={renderItem}
        emptyMessage="No teams found. Create a new team to get started."
      />
    </div>
  );
};

export default TeamList; 