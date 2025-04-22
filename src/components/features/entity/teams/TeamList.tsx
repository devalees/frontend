import React, { useEffect } from 'react';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Team, TeamMember } from '@/types/entity';
import { Button, Table, Spinner, Alert } from '@/components/ui';
import { useNavigate } from 'react-router-dom';

export const TeamList: React.FC = () => {
  const navigate = useNavigate();
  const { teams, teamMembers, loading, error, fetchTeams, deleteTeam, getTeamMembers } = useEntityStore();

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleEdit = (teamId: string) => {
    navigate(`/teams/${teamId}/edit`);
  };

  const handleDelete = async (teamId: string) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      await deleteTeam(teamId);
    }
  };

  if (loading) {
    return <Spinner data-testid="loading" />;
  }

  if (error) {
    return <Alert type="error">{error}</Alert>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Teams</h1>
        <Button onClick={() => navigate('/teams/new')}>Create Team</Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Size</th>
            <th>Skills</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team: Team) => (
            <tr key={team.id}>
              <td>{team.name}</td>
              <td>{team.description}</td>
              <td>{team.size}</td>
              <td>{team.skills.join(', ')}</td>
              <td>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleEdit(team.id)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(team.id)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {teams.length === 0 && (
        <div className="text-center py-4">
          <p>No teams found. Create a new team to get started.</p>
        </div>
      )}
    </div>
  );
}; 