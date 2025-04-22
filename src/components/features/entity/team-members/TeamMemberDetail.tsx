import React, { useEffect, useState } from 'react';
import { TeamMember, Team } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

interface TeamMemberDetailProps {
  id: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TeamMemberDetail: React.FC<TeamMemberDetailProps> = ({
  id,
  onEdit,
  onDelete
}) => {
  const { 
    loading, 
    error, 
    getTeamMember,
    getTeam
  } = useEntityStore();

  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get the team member
        const memberData = await getTeamMember(id);
        setTeamMember(memberData);
        
        // Then get related team
        try {
          if (memberData.team_id) {
            const teamData = await getTeam(memberData.team_id);
            setTeam(teamData);
          }
        } catch (e) {
          console.error('Failed to fetch team:', e);
        }
      } catch (error) {
        console.error('Failed to fetch team member data:', error);
      }
    };
    fetchData();
  }, [id, getTeamMember, getTeam]);

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

  if (!teamMember) {
    return (
      <div className="p-4 text-gray-600 bg-gray-50 rounded-md" data-testid="not-found">
        Team Member not found
      </div>
    );
  }

  return (
    <Card data-testid="team-member-detail">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Team Member Details</h1>
            <p className="text-gray-600 mt-1">User ID: {teamMember.user_id}</p>
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <Button
                variant="outline"
                onClick={onEdit}
                data-testid="edit-button"
              >
                Edit Team Member
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                onClick={onDelete}
                data-testid="delete-button"
              >
                Delete Team Member
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1">{teamMember.user_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Team ID</dt>
                <dd className="mt-1">{teamMember.team_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1">
                  <Badge variant="info">{teamMember.role}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <Badge variant={teamMember.is_leader ? 'success' : 'info'}>
                    {teamMember.is_leader ? 'Leader' : 'Member'}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Join Date</dt>
                <dd className="mt-1">
                  {new Date(teamMember.join_date).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Skills</dt>
                <dd className="mt-1">
                  {teamMember.skills && teamMember.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {teamMember.skills.map((skill, index) => (
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
            <h3 className="text-lg font-medium mb-4">Team Information</h3>
            {team ? (
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Team Name</dt>
                  <dd className="mt-1">{team.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Team Description</dt>
                  <dd className="mt-1">{team.description || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Department ID</dt>
                  <dd className="mt-1">{team.department_id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Team Size</dt>
                  <dd className="mt-1">{team.size || 'N/A'}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-gray-500">Team information not available</p>
            )}
            
            <h3 className="text-lg font-medium mb-4 mt-6">Performance</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Availability</dt>
                <dd className="mt-1">
                  {teamMember.availability !== undefined ? (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${teamMember.availability}%` }}
                      ></div>
                    </div>
                  ) : (
                    'N/A'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Performance Rating</dt>
                <dd className="mt-1">
                  {teamMember.performance_rating !== undefined ? (
                    <div className="flex items-center">
                      <span className="mr-2">{teamMember.performance_rating}/5</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < teamMember.performance_rating! ? 'text-yellow-400' : 'text-gray-300'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  ) : (
                    'N/A'
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="w-full flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Created: {new Date(teamMember.created_at).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">
            Last Updated: {new Date(teamMember.updated_at).toLocaleString()}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TeamMemberDetail; 