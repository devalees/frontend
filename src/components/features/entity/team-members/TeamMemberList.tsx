import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Column } from '@/components/ui/Table';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useEntityStore } from '@/store/slices/entitySlice';
import { TeamMember } from '@/types/entity';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { PaginatedList } from '@/components/PaginatedList';

interface TeamMemberListProps {
  onViewDetails?: (teamMember: TeamMember) => void;
  onEdit?: (teamMember: TeamMember) => void;
  onDelete?: (teamMember: TeamMember) => void;
}

export const TeamMemberList: React.FC<TeamMemberListProps> = ({
  onViewDetails,
  onEdit,
  onDelete
}) => {
  const router = useRouter();
  const { teamMembers, loading, error, fetchTeamMembers, deleteTeamMember } = useEntityStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const handleView = (teamMember: TeamMember) => {
    if (onViewDetails) {
      onViewDetails(teamMember);
    } else {
      router.push(`/entities/team-members/${teamMember.id}`);
    }
  };

  const handleEdit = (teamMember: TeamMember) => {
    if (onEdit) {
      onEdit(teamMember);
    } else {
      router.push(`/entities/team-members/${teamMember.id}/edit`);
    }
  };

  const handleDelete = async (teamMember: TeamMember) => {
    if (onDelete) {
      onDelete(teamMember);
    } else if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await deleteTeamMember(teamMember.id);
      } catch (error) {
        console.error('Failed to delete team member:', error);
      }
    }
  };

  const columns: Column<TeamMember>[] = [
    {
      header: 'User ID',
      accessor: 'user_id',
      cell: (value) => value
    },
    {
      header: 'Team',
      accessor: 'team_id',
      cell: (value) => value
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (value) => value
    },
    {
      header: 'Leader',
      accessor: 'is_leader',
      cell: (value) => value ? 'Yes' : 'No'
    },
    {
      header: 'Join Date',
      accessor: 'join_date',
      cell: (value) => new Date(value).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (_, row) => (
        <div className="flex space-x-2">
          <NavButton
            variant="outline"
            size="small"
            href={`/entities/team-members/${row.id}`}
            onClick={() => handleView(row)}
            data-testid="view-details-button"
          >
            View
          </NavButton>
          <NavButton
            variant="outline"
            size="small"
            href={`/entities/team-members/${row.id}/edit`}
            onClick={() => handleEdit(row)}
            data-testid="edit-button"
          >
            Edit
          </NavButton>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleDelete(row)}
            data-testid="delete-button"
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredMembers.length / 10);

  const uniqueRoles = Array.from(new Set(teamMembers.map(member => member.role)));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div data-testid="loading">
            <Skeleton className="h-8 w-48" />
          </div>
        </CardHeader>
        <div className="p-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4" data-testid="error">
        Failed to load team members
      </div>
    );
  }

  const renderItem = (teamMember: TeamMember) => (
    <tr key={teamMember.id}>
      <td>{teamMember.user_id}</td>
      <td>{teamMember.team_id}</td>
      <td>{teamMember.role}</td>
      <td>{teamMember.is_leader ? 'Yes' : 'No'}</td>
      <td>{new Date(teamMember.join_date).toLocaleDateString()}</td>
      <td>
        <div className="flex space-x-2">
          <NavButton
            variant="outline"
            size="small"
            href={`/entities/team-members/${teamMember.id}`}
            onClick={() => handleView(teamMember)}
            data-testid="view-details-button"
          >
            View
          </NavButton>
          <NavButton
            variant="outline"
            size="small"
            href={`/entities/team-members/${teamMember.id}/edit`}
            onClick={() => handleEdit(teamMember)}
            data-testid="edit-button"
          >
            Edit
          </NavButton>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleDelete(teamMember)}
            data-testid="delete-button"
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    // If we need to fetch data from the server, we can do it here
    // await fetchTeamMembers({ page });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Team Members</h2>
          {!onViewDetails && (
            <NavButton
              href="/entities/team-members/new"
              onClick={() => router.push('/entities/team-members/new')}
            >
              Add Team Member
            </NavButton>
          )}
        </div>
      </CardHeader>
      <div className="p-4" data-testid="team-member-list">
        <div className="flex space-x-4 mb-4">
          <Input
            type="search"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select
            options={[
              { value: '', label: 'All Roles' },
              ...uniqueRoles.map(role => ({ value: role, label: role }))
            ]}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-48"
          />
        </div>
        <PaginatedList
          data={filteredMembers}
          totalPages={totalPages}
          currentPage={currentPage}
          isLoading={loading}
          fetchPage={handlePageChange}
          renderItem={renderItem}
          emptyMessage="No team members found"
        />
      </div>
    </Card>
  );
}; 