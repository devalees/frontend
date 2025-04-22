import { renderHook, act } from '@testing-library/react'
import { useEntityStore } from '@/store/slices/entitySlice'
import { 
  organizationApi,
  departmentApi,
  teamApi,
  teamMemberApi,
  organizationSettingsApi
} from '@/lib/api/entity'
import { Organization, Department, Team, TeamMember, OrganizationSettings } from '@/types/entity'
import { EntityPaginatedResponse } from '@/types/entity'

// Mock API modules
jest.mock('@/lib/api/entity', () => ({
  organizationApi: {
    getOrganizations: jest.fn(),
    getOrganization: jest.fn(),
    createOrganization: jest.fn(),
    updateOrganization: jest.fn(),
    deleteOrganization: jest.fn(),
    getOrganizationDepartments: jest.fn(),
    getOrganizationTeamMembers: jest.fn()
  },
  departmentApi: {
    getDepartments: jest.fn(),
    getDepartment: jest.fn(),
    createDepartment: jest.fn(),
    updateDepartment: jest.fn(),
    deleteDepartment: jest.fn()
  },
  teamApi: {
    getTeams: jest.fn(),
    getTeam: jest.fn(),
    createTeam: jest.fn(),
    updateTeam: jest.fn(),
    deleteTeam: jest.fn()
  },
  teamMemberApi: {
    getTeamMembers: jest.fn(),
    getTeamMember: jest.fn(),
    createTeamMember: jest.fn(),
    updateTeamMember: jest.fn(),
    deleteTeamMember: jest.fn()
  },
  organizationSettingsApi: {
    getOrganizationSettings: jest.fn(),
    updateOrganizationSettings: jest.fn()
  }
}))

// Mock data
const mockOrganization: Organization = {
  id: '1',
  name: 'Test Organization',
  description: 'Test Description',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_active: true
}

const mockDepartment: Department = {
  id: '1',
  name: 'Test Department',
  description: 'Test Description',
  organization_id: '1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_active: true
}

const mockTeam: Team = {
  id: '1',
  name: 'Test Team',
  description: 'Test Description',
  department_id: '1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_active: true
}

const mockTeamMember: TeamMember = {
  id: '1',
  user_id: '1',
  team_id: '1',
  role: 'member',
  is_leader: false,
  join_date: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_active: true
}

const mockOrganizationSettings: OrganizationSettings = {
  id: '1',
  organization_id: '1',
  theme: 'light',
  language: 'en',
  timezone: 'UTC',
  date_format: 'YYYY-MM-DD',
  notification_preferences: {},
  security_settings: {},
  feature_flags: {},
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_active: true
}

describe('Entity Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Reset mocks
    (organizationApi.getOrganizations as jest.Mock).mockReset();
    (organizationApi.getOrganization as jest.Mock).mockReset();
    (organizationApi.createOrganization as jest.Mock).mockReset();
    (organizationApi.updateOrganization as jest.Mock).mockReset();
    (organizationApi.deleteOrganization as jest.Mock).mockReset();
    (organizationApi.getOrganizationDepartments as jest.Mock).mockReset();
    (organizationApi.getOrganizationTeamMembers as jest.Mock).mockReset();
    
    // Reset the store state
    const store = useEntityStore.getState();
    useEntityStore.setState({
      ...store,
      organizations: [],
      departments: [],
      teams: [],
      teamMembers: [],
      organizationSettings: [],
      loading: false,
      error: null
    });
  })

  describe('Organization', () => {
    it('should fetch organizations', async () => {
      // Define mock response
      const mockPaginatedResponse = {
        count: 1,
        next: null,
        previous: null,
        results: [mockOrganization]
      };
      
      // Setup mock
      (organizationApi.getOrganizations as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      // Render hook
      const { result } = renderHook(() => useEntityStore());

      // Act
      await act(async () => {
        await result.current.fetchOrganizations();
      });

      // Assert
      expect(organizationApi.getOrganizations).toHaveBeenCalled();
      expect(result.current.organizations).toEqual([mockOrganization]);
    });

    it('should handle organization fetch error', async () => {
      // Define mock error
      const errorMessage = 'Failed to fetch organizations';
      const mockError = new Error(errorMessage);
      
      // Setup mock
      (organizationApi.getOrganizations as jest.Mock).mockRejectedValue(mockError);

      // Render hook
      const { result } = renderHook(() => useEntityStore());

      // Act
      await act(async () => {
        await result.current.fetchOrganizations();
      });

      // Assert
      expect(organizationApi.getOrganizations).toHaveBeenCalled();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should get organization by id', async () => {
      // Setup mock
      (organizationApi.getOrganization as jest.Mock).mockResolvedValue(mockOrganization);

      // Render hook
      const { result } = renderHook(() => useEntityStore());
      
      // Act & Assert
      await act(async () => {
        const organization = await result.current.getOrganization('1');
        expect(organization).toEqual(mockOrganization);
      });
    });

    it('should create an organization', async () => {
      // Define new organization data
      const newOrganization = {
        name: 'New Organization',
        description: 'New Description'
      };
      
      // Setup mock
      (organizationApi.createOrganization as jest.Mock).mockResolvedValue(mockOrganization);

      // Render hook
      const { result } = renderHook(() => useEntityStore());
      
      // Verify initial state
      expect(result.current.organizations).toEqual([]);
      
      // Act
      let organization;
      await act(async () => {
        organization = await result.current.createOrganization(newOrganization);
      });
      
      // Assert
      expect(organization).toEqual(mockOrganization);
      expect(result.current.organizations).toEqual([mockOrganization]);
    });

    it('should update an organization', async () => {
      // Define update data
      const updatedOrganizationData = {
        name: 'Updated Organization',
        description: 'Updated Description'
      };
      
      // Create updated mock organization
      const updatedMockOrganization = {
        ...mockOrganization,
        name: 'Updated Organization',
        description: 'Updated Description'
      };
      
      // Setup mocks
      (organizationApi.updateOrganization as jest.Mock).mockResolvedValue(updatedMockOrganization);
      
      // Render hook and manually set the initial state
      const { result } = renderHook(() => useEntityStore());
      act(() => {
        useEntityStore.setState({
          ...useEntityStore.getState(),
          organizations: [mockOrganization]
        });
      });
      
      // Verify the state before update
      expect(result.current.organizations).toEqual([mockOrganization]);
      
      // Act - update the organization
      let updatedOrg;
      await act(async () => {
        updatedOrg = await result.current.updateOrganization('1', updatedOrganizationData);
      });
      
      // Assert
      expect(updatedOrg).toEqual(updatedMockOrganization);
      expect(result.current.organizations).toEqual([updatedMockOrganization]);
    });

    it('should delete an organization', async () => {
      // Setup mock
      (organizationApi.deleteOrganization as jest.Mock).mockResolvedValue(true);
      
      // Render hook and manually set the initial state
      const { result } = renderHook(() => useEntityStore());
      act(() => {
        useEntityStore.setState({
          ...useEntityStore.getState(),
          organizations: [mockOrganization]
        });
      });
      
      // Verify the state before deletion
      expect(result.current.organizations).toEqual([mockOrganization]);
      
      // Act & Assert
      await act(async () => {
        await result.current.deleteOrganization('1');
      });
      
      // Check that organization was removed
      expect(result.current.organizations).toEqual([]);
    });
    
    it('should get organization departments', async () => {
      // Define mock response
      const mockDepartmentsResponse = {
        count: 1,
        next: null,
        previous: null,
        results: [mockDepartment]
      };
      
      // Setup mock
      (organizationApi.getOrganizationDepartments as jest.Mock).mockResolvedValue(mockDepartmentsResponse);
      
      // Render hook
      const { result } = renderHook(() => useEntityStore());
      
      // Act & Assert
      await act(async () => {
        const departments = await result.current.getOrganizationDepartments('1');
        expect(departments).toEqual([mockDepartment]);
      });
    });
    
    it('should get organization team members', async () => {
      // Define mock response
      const mockTeamMembersResponse = {
        count: 1,
        next: null,
        previous: null,
        results: [mockTeamMember]
      };
      
      // Setup mock
      (organizationApi.getOrganizationTeamMembers as jest.Mock).mockResolvedValue(mockTeamMembersResponse);
      
      // Render hook
      const { result } = renderHook(() => useEntityStore());
      
      // Act & Assert
      await act(async () => {
        const members = await result.current.getOrganizationTeamMembers('1');
        expect(members).toEqual([mockTeamMember]);
      });
    });
  });

  // Add more tests for other entity types as needed
}) 