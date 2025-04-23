'use client';

/**
 * OrganizationHierarchy Component
 * 
 * Displays the hierarchy of an organization, showing departments and teams in a tree structure.
 */

import React, { useEffect, useState } from 'react';
import { Network, Users, Layers, FolderTree, User, RefreshCw } from 'lucide-react';
import { Tree, TreeItem } from '@/components/ui/Tree';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { NavButton } from '@/components/ui/NavButton';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Organization, Department, Team } from '@/types/entity';
import { useEntity } from '@/hooks/useEntity';

interface OrganizationHierarchyProps {
  organizationId: string;
  onClose?: () => void;
}

export const OrganizationHierarchy: React.FC<OrganizationHierarchyProps> = ({
  organizationId,
  onClose,
}) => {
  const { getOrganizationById, getOrganizationDepartments, getChildDepartments, getDepartmentTeams, loading, error } = useEntity();
  
  const [organization, setOrganization] = useState<Organization | undefined>();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentMap, setDepartmentMap] = useState<Map<string, Department[]>>(new Map());
  const [teamMap, setTeamMap] = useState<Map<string, Team[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch organization data
  useEffect(() => {
    const fetchOrganizationData = async () => {
      setIsLoading(true);
      setLocalError(null);

      try {
        // Get organization
        const org = getOrganizationById(organizationId);
        if (!org) {
          setLocalError('Organization not found');
          setIsLoading(false);
          return;
        }
        setOrganization(org);

        // Get departments
        const depts = await getOrganizationDepartments(organizationId);
        setDepartments(depts || []);

        // Create department map for hierarchy
        const deptMap = new Map<string, Department[]>();
        const tempTeamMap = new Map<string, Team[]>();

        // Process top-level departments
        const topLevelDepts = depts.filter(d => !d.parent_department_id);
        const childDeptPromises: Promise<void>[] = [];
        const teamPromises: Promise<void>[] = [];

        // For each top-level department, get child departments and teams
        for (const dept of depts) {
          // Get child departments
          childDeptPromises.push(
            getChildDepartments(dept.id).then(childDepts => {
              if (childDepts && childDepts.length > 0) {
                deptMap.set(dept.id, childDepts);
              }
            }).catch(err => {
              console.error(`Error fetching child departments for ${dept.id}:`, err);
            })
          );

          // Get teams
          teamPromises.push(
            getDepartmentTeams(dept.id).then(teams => {
              if (teams && teams.length > 0) {
                tempTeamMap.set(dept.id, teams);
              }
            }).catch(err => {
              console.error(`Error fetching teams for ${dept.id}:`, err);
            })
          );
        }

        // Wait for all promises to complete
        await Promise.all([...childDeptPromises, ...teamPromises]);

        setDepartmentMap(deptMap);
        setTeamMap(tempTeamMap);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to load organization hierarchy');
        console.error('Error fetching organization hierarchy:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationData();
  }, [organizationId, getOrganizationById, getOrganizationDepartments, getChildDepartments, getDepartmentTeams]);

  // Refresh the hierarchy data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Get departments
      const depts = await getOrganizationDepartments(organizationId);
      setDepartments(depts || []);

      // Create department map for hierarchy
      const deptMap = new Map<string, Department[]>();
      const tempTeamMap = new Map<string, Team[]>();

      // Process all departments
      const childDeptPromises: Promise<void>[] = [];
      const teamPromises: Promise<void>[] = [];

      for (const dept of depts) {
        // Get child departments
        childDeptPromises.push(
          getChildDepartments(dept.id).then(childDepts => {
            if (childDepts && childDepts.length > 0) {
              deptMap.set(dept.id, childDepts);
            }
          }).catch(err => {
            console.error(`Error fetching child departments for ${dept.id}:`, err);
          })
        );

        // Get teams
        teamPromises.push(
          getDepartmentTeams(dept.id).then(teams => {
            if (teams && teams.length > 0) {
              tempTeamMap.set(dept.id, teams);
            }
          }).catch(err => {
            console.error(`Error fetching teams for ${dept.id}:`, err);
          })
        );
      }

      // Wait for all promises to complete
      await Promise.all([...childDeptPromises, ...teamPromises]);

      setDepartmentMap(deptMap);
      setTeamMap(tempTeamMap);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to refresh organization hierarchy');
      console.error('Error refreshing organization hierarchy:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Render department teams
  const renderTeams = (departmentId: string) => {
    const teams = teamMap.get(departmentId);
    if (!teams || teams.length === 0) return null;

    return teams.map(team => (
      <TreeItem
        key={`team-${team.id}`}
        id={`team-${team.id}`}
        label={
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-indigo-500" />
            <span>{team.name}</span>
            <Badge className="ml-2">{team.size || 0} members</Badge>
          </div>
        }
        icon={<Users className="h-4 w-4" />}
      />
    ));
  };

  // Render child departments recursively
  const renderChildDepartments = (departmentId: string) => {
    const childDepts = departmentMap.get(departmentId);
    if (!childDepts || childDepts.length === 0) return null;

    return childDepts.map(dept => (
      <TreeItem
        key={`dept-${dept.id}`}
        id={`dept-${dept.id}`}
        label={
          <div className="flex items-center">
            <Layers className="h-4 w-4 mr-2 text-blue-500" />
            <span>{dept.name}</span>
            {dept.headcount && <Badge className="ml-2">{dept.headcount} employees</Badge>}
          </div>
        }
        icon={<Layers className="h-4 w-4" />}
        expandedByDefault={false}
      >
        {renderChildDepartments(dept.id)}
        {renderTeams(dept.id)}
      </TreeItem>
    ));
  };

  // Render departments
  const renderDepartments = () => {
    // Filter top-level departments
    const topLevelDepartments = departments.filter(dept => !dept.parent_department_id);
    
    if (topLevelDepartments.length === 0) {
      return <div className="text-gray-500 mt-4">No departments found for this organization.</div>;
    }

    return topLevelDepartments.map(dept => (
      <TreeItem
        key={`dept-${dept.id}`}
        id={`dept-${dept.id}`}
        label={
          <div className="flex items-center">
            <Layers className="h-4 w-4 mr-2 text-blue-600" />
            <span className="font-medium">{dept.name}</span>
            {dept.headcount && <Badge className="ml-2">{dept.headcount} employees</Badge>}
          </div>
        }
        icon={<Layers className="h-4 w-4" />}
        expandedByDefault={true}
      >
        {renderChildDepartments(dept.id)}
        {renderTeams(dept.id)}
      </TreeItem>
    ));
  };

  if (loading || isLoading) {
    return (
      <Card className="w-full" data-testid="loading">
        <CardHeader>
          <CardTitle>Loading Organization Hierarchy</CardTitle>
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

  if (!organization) {
    return (
      <Card className="w-full" data-testid="not-found">
        <CardHeader>
          <CardTitle>Organization Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500">The requested organization could not be found.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full" data-testid="organization-hierarchy">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{organization.name} Hierarchy</CardTitle>
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
            <Network className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Organization</h3>
          </div>
          <div className="ml-7 text-sm text-gray-600">
            <p><strong>Industry:</strong> {organization.industry || 'N/A'}</p>
            <p><strong>Size:</strong> {organization.size || 'N/A'}</p>
          </div>
        </div>

        <div data-testid="organization-node">
          <Tree>
            <TreeItem
              id={`org-${organization.id}`}
              label={
                <div className="flex items-center">
                  <Network className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-bold">{organization.name}</span>
                </div>
              }
              icon={<Network className="h-5 w-5" />}
              expandedByDefault={true}
            >
              <div data-testid="departments-container">
                {renderDepartments()}
              </div>
            </TreeItem>
          </Tree>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-gray-400">
          {departments.length} departments, {Array.from(teamMap.values()).flat().length} teams
        </div>
        <div className="flex space-x-2">
          <NavButton 
            href={`/entities/organizations/${organizationId}`}
            variant="outline" 
            size="small"
          >
            Organization Details
          </NavButton>
          <NavButton 
            href={`/entities/organizations/${organizationId}/analytics`}
            variant="outline" 
            size="small"
          >
            Analytics
          </NavButton>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OrganizationHierarchy; 