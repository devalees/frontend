import React, { useEffect, useState } from 'react';
import { Department, Team, TeamMember } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';

interface DepartmentDetailProps {
  id: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const DepartmentDetail: React.FC<DepartmentDetailProps> = ({
  id,
  onEdit,
  onDelete
}) => {
  const { 
    loading, 
    error, 
    getDepartment,
    getDepartmentTeams,
    getDepartmentTeamMembers,
    getChildDepartments
  } = useEntityStore();

  const [department, setDepartment] = useState<Department | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [childDepartments, setChildDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get the department
        const dept = await getDepartment(id);
        setDepartment(dept);
        
        // Then get related data
        try {
          const deptTeams = await getDepartmentTeams(id);
          setTeams(deptTeams || []);
        } catch (e) {
          console.error('Failed to fetch teams:', e);
        }
        
        try {
          const members = await getDepartmentTeamMembers(id);
          setTeamMembers(members || []);
        } catch (e) {
          console.error('Failed to fetch team members:', e);
        }
        
        try {
          const children = await getChildDepartments(id);
          setChildDepartments(children || []);
        } catch (e) {
          console.error('Failed to fetch child departments:', e);
        }
      } catch (error) {
        console.error('Failed to fetch department data:', error);
      }
    };
    fetchData();
  }, [id, getDepartment, getDepartmentTeams, getDepartmentTeamMembers, getChildDepartments]);

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

  if (!department) {
    return (
      <div className="p-4 text-gray-600 bg-gray-50 rounded-md" data-testid="not-found">
        Department not found
      </div>
    );
  }

  const teamColumns: Column<Team>[] = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (value) => <span className="font-medium">{value}</span>
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
      cell: (value) => value ? value.join(', ') : 'N/A'
    }
  ];

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
    }
  ];

  const childDepartmentColumns: Column<Department>[] = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (value) => <span className="font-medium">{value}</span>
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
    }
  ];

  return (
    <div className="space-y-6" data-testid="department-detail">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{department.name}</h1>
          <p className="text-gray-600 mt-1">{department.description}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={onEdit}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            aria-label="Edit"
          >
            Edit
          </Button>
          <Button
            onClick={onDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            aria-label="Delete"
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Organization ID</dt>
              <dd className="mt-1">{department.organization_id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Parent Department</dt>
              <dd className="mt-1">{department.parent_department_id || 'None'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Manager ID</dt>
              <dd className="mt-1">{department.manager_id || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1">{department.location || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Headcount</dt>
              <dd className="mt-1">{department.headcount || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Budget</dt>
              <dd className="mt-1">
                {department.budget ? `$${department.budget.toLocaleString()}` : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <Badge variant={department.is_active ? 'success' : 'error'}>
                  {department.is_active ? 'Active' : 'Inactive'}
                </Badge>
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
                {new Date(department.created_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Updated At</dt>
              <dd className="mt-1">
                {new Date(department.updated_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Teams</h3>
        <Table
          data={teams}
          columns={teamColumns}
          emptyMessage="No teams found"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Team Members</h3>
        <Table
          data={teamMembers}
          columns={memberColumns}
          emptyMessage="No team members found"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Child Departments</h3>
        <Table
          data={childDepartments}
          columns={childDepartmentColumns}
          emptyMessage="No child departments found"
        />
      </div>
    </div>
  );
};

export default DepartmentDetail; 