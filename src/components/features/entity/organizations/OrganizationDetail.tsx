import React, { useEffect, useState } from 'react';
import { Organization, Department, Team, TeamMember } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';

interface OrganizationDetailProps {
  organizationId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const OrganizationDetail: React.FC<OrganizationDetailProps> = ({
  organizationId,
  onEdit,
  onDelete
}) => {
  const { 
    loading, 
    error, 
    getOrganization
  } = useEntityStore();

  // Get these separately with fallback functions to prevent errors
  const { getOrganizationDepartments } = useEntityStore() || { 
    getOrganizationDepartments: async () => [] 
  };
  
  const { getOrganizationTeamMembers } = useEntityStore() || { 
    getOrganizationTeamMembers: async () => [] 
  };

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'departments' | 'members'>('details');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get the organization
        const org = await getOrganization(organizationId);
        setOrganization(org);
        
        // Then try to get departments and team members if available
        try {
          if (typeof getOrganizationDepartments === 'function') {
            const deps = await getOrganizationDepartments(organizationId);
            setDepartments(deps || []);
          }
        } catch (e) {
          console.error('Failed to fetch departments:', e);
        }
        
        try {
          if (typeof getOrganizationTeamMembers === 'function') {
            const members = await getOrganizationTeamMembers(organizationId);
            setTeamMembers(members || []);
          }
        } catch (e) {
          console.error('Failed to fetch team members:', e);
        }
      } catch (error) {
        console.error('Failed to fetch organization data:', error);
      }
    };
    fetchData();
  }, [organizationId, getOrganization, getOrganizationDepartments, getOrganizationTeamMembers]);

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

  if (!organization) {
    return (
      <div className="p-4 text-gray-600 bg-gray-50 rounded-md" data-testid="not-found">
        Organization not found
      </div>
    );
  }

  const departmentColumns: Column<Department>[] = [
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

  const memberColumns: Column<TeamMember>[] = [
    {
      header: 'Name',
      accessor: 'user_id',
      cell: (value) => <span className="font-medium">{value}</span>
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (value) => value || 'N/A'
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

  return (
    <div className="space-y-6" data-testid="organization-detail">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{organization.name}</h1>
          <p className="text-gray-600 mt-1">{organization.description}</p>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <Button
              variant="outline"
              onClick={onEdit}
              data-testid="edit-button"
            >
              Edit Organization
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              onClick={onDelete}
              data-testid="delete-button"
            >
              Delete Organization
            </Button>
          )}
        </div>
      </div>

      <div className="flex space-x-4 border-b">
        <NavButton
          className={`px-4 py-2 ${
            activeTab === 'details'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('details')}
          href="#"
        >
          Details
        </NavButton>
        <NavButton
          className={`px-4 py-2 ${
            activeTab === 'departments'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('departments')}
          href="#"
        >
          Departments ({departments.length})
        </NavButton>
        <NavButton
          className={`px-4 py-2 ${
            activeTab === 'members'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('members')}
          href="#"
        >
          Team Members ({teamMembers.length})
        </NavButton>
      </div>

      {activeTab === 'details' && (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Industry</dt>
                <dd className="mt-1">{organization.industry || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Size</dt>
                <dd className="mt-1">{organization.size || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Founded Date</dt>
                <dd className="mt-1">
                  {organization.founded_date
                    ? new Date(organization.founded_date).toLocaleDateString()
                    : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Headquarters</dt>
                <dd className="mt-1">{organization.headquarters || 'N/A'}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Website</dt>
                <dd className="mt-1">
                  {organization.website ? (
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {organization.website}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1">
                  {organization.contact_email ? (
                    <a
                      href={`mailto:${organization.contact_email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {organization.contact_email}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1">{organization.contact_phone || 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'departments' && (
        <div>
          <Table
            data={departments}
            columns={departmentColumns}
            emptyMessage="No departments found"
          />
        </div>
      )}

      {activeTab === 'members' && (
        <div>
          <Table
            data={teamMembers}
            columns={memberColumns}
            emptyMessage="No team members found"
          />
        </div>
      )}
    </div>
  );
};

export default OrganizationDetail; 