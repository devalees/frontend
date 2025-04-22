import React, { useEffect, useState } from 'react';
import { Team, TeamMember } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';

interface TeamDetailProps {
  id: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TeamDetail: React.FC<TeamDetailProps> = ({
  id,
  onEdit,
  onDelete
}) => {
  const { 
    loading, 
    error, 
    getTeam,
    getTeamMembers
  } = useEntityStore();

  const [team, setTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get the team
        const teamData = await getTeam(id);
        setTeam(teamData);
        
        // Then get related team members
        try {
          const members = await getTeamMembers(id);
          setTeamMembers(members || []);
        } catch (e) {
          console.error('Failed to fetch team members:', e);
        }
      } catch (error) {
        console.error('Failed to fetch team data:', error);
      }
    };
    fetchData();
  }, [id, getTeam, getTeamMembers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md" data-testid="error">
        {error}
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-4 text-gray-600 bg-gray-50 rounded-md" data-testid="not-found">
        Team not found
      </div>
    );
  }

  const memberColumns: Column<TeamMember>[] = [
    {
      header: 'User ID',
      accessor: 'user_id',
      cell: (value) => <span className="font-medium">{value}</span>
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (value) => value || 'Developer'
    },
    {
      header: 'Join Date',
      accessor: 'join_date',
      cell: (value) => new Date(value).toLocaleDateString()
    },
    {
      header: 'Status',
      accessor: 'is_leader',
      cell: (value) => (
        <Badge variant={value ? 'success' : 'info'}>
          {value ? 'Leader' : 'Member'}
        </Badge>
      )
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
    }
  ];

  return (
    <div className="space-y-6" data-testid="team-detail">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="text-gray-600 mt-1">{team.description || 'No description provided'}</p>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <NavButton
              variant="outline"
              href={`/teams/${id}/edit`}
              onClick={onEdit}
              data-testid="edit-button"
            >
              Edit Team
            </NavButton>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              onClick={onDelete}
              data-testid="delete-button"
            >
              Delete Team
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Department ID</dt>
              <dd className="mt-1">{team.department_id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Leader ID</dt>
              <dd className="mt-1">{team.leader_id || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Project ID</dt>
              <dd className="mt-1">{team.project_id || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Size</dt>
              <dd className="mt-1">{team.size || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Skills</dt>
              <dd className="mt-1">
                {team.skills && team.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {team.skills.map((skill, index) => (
                      <Badge key={index} variant="info">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  'N/A'
                )}
              </dd>
            </div>
          </dl>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">Timeline</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1">
                {new Date(team.created_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Updated At</dt>
              <dd className="mt-1">
                {new Date(team.updated_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Team Members ({teamMembers.length})</h3>
        <Table
          data={teamMembers}
          columns={memberColumns}
          emptyMessage="No team members found"
        />
      </div>
    </div>
  );
};

export default TeamDetail; 