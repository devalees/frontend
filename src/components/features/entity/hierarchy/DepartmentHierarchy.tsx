'use client';

/**
 * DepartmentHierarchy Component
 * 
 * Displays the hierarchy of a department, showing teams and child departments in a tree structure.
 */

import React, { useEffect, useState } from 'react';
import { Layers, Users, Network, User, RefreshCw } from 'lucide-react';
import { Tree, TreeItem } from '@/components/ui/Tree';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { NavButton } from '@/components/ui/NavButton';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Department, Team, TeamMember } from '@/types/entity';
import { useEntity } from '@/hooks/useEntity';

interface DepartmentHierarchyProps {
  departmentId: string;
  onClose?: () => void;
}

export const DepartmentHierarchy: React.FC<DepartmentHierarchyProps> = ({
  departmentId,
  onClose,
}) => {
  const { getDepartmentById, getDepartmentTeams, getChildDepartments, getDepartmentTeamMembers, loading, error } = useEntity();
  
  const [department, setDepartment] = useState<Department | undefined>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [childDepartments, setChildDepartments] = useState<Department[]>([]);
  const [teamMembers, setTeamMembers] = useState<Map<string, TeamMember[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch department data
  useEffect(() => {
    const fetchDepartmentData = async () => {
      setIsLoading(true);
      setLocalError(null);

      try {
        // Get department
        const dept = getDepartmentById(departmentId);
        if (!dept) {
          setLocalError('Department not found');
          setIsLoading(false);
          return;
        }
        setDepartment(dept);

        // Get teams
        const teamList = await getDepartmentTeams(departmentId);
        setTeams(teamList || []);

        // Get child departments
        const childDepts = await getChildDepartments(departmentId);
        setChildDepartments(childDepts || []);

        // Get team members for each team
        const tempTeamMembers = new Map<string, TeamMember[]>();
        const teamMemberPromises: Promise<void>[] = [];

        if (teamList && teamList.length > 0) {
          for (const team of teamList) {
            teamMemberPromises.push(
              getTeamMembers(team.id).then(members => {
                if (members && members.length > 0) {
                  tempTeamMembers.set(team.id, members);
                }
              }).catch(err => {
                console.error(`Error fetching team members for ${team.id}:`, err);
              })
            );
          }
        }

        // Wait for team member promises to complete
        if (teamMemberPromises.length > 0) {
          await Promise.all(teamMemberPromises);
        }

        setTeamMembers(tempTeamMembers);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to load department hierarchy');
        console.error('Error fetching department hierarchy:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentData();
  }, [departmentId, getDepartmentById, getDepartmentTeams, getChildDepartments, getDepartmentTeamMembers]);

  // For team member fetching
  const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
    try {
      const members = await getDepartmentTeamMembers(departmentId);
      return members.filter(member => member.team_id === teamId) || [];
    } catch (err) {
      console.error(`Error fetching team members for ${teamId}:`, err);
      return [];
    }
  };

  // Refresh the hierarchy data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Get teams
      const teamList = await getDepartmentTeams(departmentId);
      setTeams(teamList || []);

      // Get child departments
      const childDepts = await getChildDepartments(departmentId);
      setChildDepartments(childDepts || []);

      // Get team members for each team
      const tempTeamMembers = new Map<string, TeamMember[]>();
      const teamMemberPromises: Promise<void>[] = [];

      if (teamList && teamList.length > 0) {
        for (const team of teamList) {
          teamMemberPromises.push(
            getTeamMembers(team.id).then(members => {
              if (members && members.length > 0) {
                tempTeamMembers.set(team.id, members);
              }
            }).catch(err => {
              console.error(`Error fetching team members for ${team.id}:`, err);
            })
          );
        }
      }

      // Wait for team member promises to complete
      if (teamMemberPromises.length > 0) {
        await Promise.all(teamMemberPromises);
      }

      setTeamMembers(tempTeamMembers);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to refresh department hierarchy');
      console.error('Error refreshing department hierarchy:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Render team members
  const renderTeamMembers = (teamId: string) => {
    const members = teamMembers.get(teamId);
    if (!members || members.length === 0) return null;

    return members.map(member => (
      <TreeItem
        key={`member-${member.id}`}
        id={`member-${member.id}`}
        label={
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <span>{member.user_id}</span>
            <Badge className="ml-2">{member.role}</Badge>
            {member.is_leader && <Badge className="ml-2">Leader</Badge>}
          </div>
        }
        icon={<User className="h-4 w-4" />}
      />
    ));
  };

  // Render teams
  const renderTeams = () => {
    if (teams.length === 0) {
      return <div className="text-gray-500 mt-4">No teams found for this department.</div>;
    }

    return teams.map(team => (
      <TreeItem
        key={`team-${team.id}`}
        id={`team-${team.id}`}
        label={
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-indigo-600" />
            <span className="font-medium">{team.name}</span>
            <Badge className="ml-2">{team.size || 0} members</Badge>
          </div>
        }
        icon={<Users className="h-4 w-4" />}
        expandedByDefault={false}
      >
        {renderTeamMembers(team.id)}
      </TreeItem>
    ));
  };

  // Render child departments recursively
  const renderChildDepartments = () => {
    if (childDepartments.length === 0) {
      return null;
    }

    return childDepartments.map(dept => (
      <TreeItem
        key={`dept-${dept.id}`}
        id={`dept-${dept.id}`}
        label={
          <div className="flex items-center">
            <Layers className="h-4 w-4 mr-2 text-blue-500" />
            <span className="font-medium">{dept.name}</span>
            {dept.headcount && <Badge className="ml-2">{dept.headcount} employees</Badge>}
          </div>
        }
        icon={<Layers className="h-4 w-4" />}
        expandedByDefault={false}
      >
        <NavButton
          href={`/entities/departments/${dept.id}/hierarchy`}
          className="text-xs mt-1 pl-2"
          variant="ghost"
          size="small"
        >
          View Department Hierarchy
        </NavButton>
      </TreeItem>
    ));
  };

  if (loading || isLoading) {
    return (
      <Card className="w-full" data-testid="loading">
        <CardHeader>
          <CardTitle>Loading Department Hierarchy</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <Spinner className="w-8 h-8" />
        </CardContent>
      </Card>
    );
  }

  if (error || localError) {
    return (
      <Card className="w-full" data-testid="error">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error || localError}</div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? <Spinner className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!department) {
    return (
      <Card className="w-full" data-testid="not-found">
        <CardHeader>
          <CardTitle>Department Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500">The requested department could not be found.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full" data-testid="department-hierarchy">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{department.name} Hierarchy</CardTitle>
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="small" 
            className="mr-2" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? <Spinner className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
          {onClose && (
            <Button variant="outline" size="small" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Layers className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Department Information</h3>
          </div>
          <div className="ml-7 text-sm text-gray-600">
            <p><strong>Organization ID:</strong> {department.organization_id}</p>
            {department.parent_department_id && (
              <p><strong>Parent Department:</strong> {department.parent_department_id}</p>
            )}
            {department.headcount && (
              <p><strong>Headcount:</strong> {department.headcount} employees</p>
            )}
          </div>
        </div>

        <div data-testid="department-node">
          <Tree>
            <TreeItem
              id={`dept-${department.id}`}
              label={
                <div className="flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-bold">{department.name}</span>
                </div>
              }
              icon={<Layers className="h-5 w-5" />}
              expandedByDefault={true}
            >
              {childDepartments.length > 0 && (
                <div className="mb-4" data-testid="child-departments-container">
                  <h4 className="text-sm font-semibold mb-2 ml-2">Child Departments</h4>
                  {renderChildDepartments()}
                </div>
              )}
              
              <div data-testid="teams-container">
                <h4 className="text-sm font-semibold mb-2 ml-2">Teams</h4>
                {renderTeams()}
              </div>
            </TreeItem>
          </Tree>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-gray-400">
          {childDepartments.length} child departments, {teams.length} teams
        </div>
        <div className="flex space-x-2">
          <NavButton 
            href={`/entities/departments/${departmentId}`}
            variant="outline" 
            size="small"
          >
            Department Details
          </NavButton>
          <NavButton 
            href={`/entities/organizations/${department.organization_id}/hierarchy`}
            variant="outline" 
            size="small"
          >
            Organization Hierarchy
          </NavButton>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DepartmentHierarchy; 