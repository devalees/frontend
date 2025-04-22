import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Column } from '@/components/ui/Table';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useEntityStore } from '@/store/slices/entitySlice';
import { TeamMember } from '@/types/entity';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export const TeamMemberList: React.FC = () => {
  const router = useRouter();
  const { teamMembers, loading, error, fetchTeamMembers, deleteTeamMember } = useEntityStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const handleView = (id: string) => {
    router.push(`/entities/team-members/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/entities/team-members/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await deleteTeamMember(id);
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
          <Button
            variant="outline"
            size="small"
            onClick={() => handleView(row.id)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleEdit(row.id)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleDelete(row.id)}
            data-testid="delete-team-member"
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

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueRoles = Array.from(new Set(teamMembers.map(member => member.role)));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" data-testid="loading" />
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Team Members</h2>
          <Button
            onClick={() => router.push('/entities/team-members/new')}
          >
            Add Team Member
          </Button>
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
        <Table
          data={paginatedMembers}
          columns={columns}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
          }}
          emptyMessage="No team members found"
        />
      </div>
    </Card>
  );
}; 