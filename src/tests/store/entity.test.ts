import { renderHook, act } from '@testing-library/react'
import { useEntityStore } from '@/store/slices/entitySlice'
import { 
  organizationApi,
  departmentApi,
  teamApi,
  teamMemberApi,
  organizationSettingsApi
} from '@/lib/api/entity'
import { Organization, Department, Team, TeamMember, OrganizationSettings, EntityPaginatedResponse } from '@/types/entity'

// Mock the API modules
jest.mock('@/lib/api/entity', () => ({
  organizationApi: {
    getOrganizations: jest.fn(),
    getOrganization: jest.fn(),
    createOrganization: jest.fn(),
    updateOrganization: jest.fn(),
    deleteOrganization: jest.fn(),
    hardDeleteOrganization: jest.fn(),
    getOrganizationDepartments: jest.fn(),
    getOrganizationTeamMembers: jest.fn(),
    getOrganizationAnalytics: jest.fn(),
    getOrganizationActivity: jest.fn(),
    getOrganizationPerformance: jest.fn(),
    getOrganizationGrowth: jest.fn()
  },
  departmentApi: {
    getDepartments: jest.fn(),
    getDepartment: jest.fn(),
    createDepartment: jest.fn(),
    updateDepartment: jest.fn(),
    deleteDepartment: jest.fn(),
    hardDeleteDepartment: jest.fn(),
    getDepartmentTeams: jest.fn(),
    getDepartmentTeamMembers: jest.fn(),
    getChildDepartments: jest.fn()
  },
  teamApi: {
    getTeams: jest.fn(),
    getTeam: jest.fn(),
    createTeam: jest.fn(),
    updateTeam: jest.fn(),
    deleteTeam: jest.fn(),
    hardDeleteTeam: jest.fn(),
    getTeamMembers: jest.fn()
  },
  teamMemberApi: {
    getTeamMembers: jest.fn(),
    getTeamMember: jest.fn(),
    createTeamMember: jest.fn(),
    updateTeamMember: jest.fn(),
    deleteTeamMember: jest.fn(),
    hardDeleteTeamMember: jest.fn()
  },
  organizationSettingsApi: {
    getOrganizationSettings: jest.fn(),
    getOrganizationSetting: jest.fn(),
    createOrganizationSettings: jest.fn(),
    updateOrganizationSettings: jest.fn(),
    deleteOrganizationSettings: jest.fn(),
    hardDeleteOrganizationSettings: jest.fn(),
    getSettingsByOrganization: jest.fn()
  }
}))

const mockOrganization: Organization = {
  id: '1',
  name: 'Test Org',
  description: 'Test Description',
  size: '10-50',
  industry: 'Technology',
  website: 'https://test.com',
  logo_url: 'https://test.com/logo.png',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  is_active: true
}

const mockDepartment: Department = {
  id: '1',
  name: 'Test Dept',
  description: 'Test Description',
  organization_id: '1',
  parent_department_id: undefined,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  is_active: true
}

const mockTeam: Team = {
  id: '1',
  name: 'Test Team',
  description: 'Test Description',
  department_id: '1',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  is_active: true
}

const mockTeamMember: TeamMember = {
  id: '1',
  user_id: 'user1',
  team_id: '1',
  role: 'member',
  is_leader: false,
  join_date: '2024-01-01',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
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
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  is_active: true
}

describe('Entity Store', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { result } = renderHook(() => useEntityStore())
    act(() => {
      result.current.organizations = []
      result.current.departments = []
      result.current.teams = []
      result.current.teamMembers = []
      result.current.organizationSettings = []
      result.current.loading = false
      result.current.error = null
    })
  })

  describe('Organization', () => {
    it('should fetch organizations', async () => {
      const mockResponse: EntityPaginatedResponse<Organization> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockOrganization]
      }
      ;(organizationApi.getOrganizations as jest.Mock).mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.fetchOrganizations()
      })

      expect(result.current.organizations).toEqual([mockOrganization])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('should create organization', async () => {
      const newOrg: Partial<Organization> = {
        name: 'New Org',
        description: 'New Description',
        size: '10-50',
        industry: 'Technology'
      }
      ;(organizationApi.createOrganization as jest.Mock).mockResolvedValueOnce(mockOrganization)

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.createOrganization(newOrg)
      })

      expect(organizationApi.createOrganization).toHaveBeenCalledWith(newOrg)
    })

    it('should update organization', async () => {
      const updateData: Partial<Organization> = {
        name: 'Updated Org'
      }
      ;(organizationApi.updateOrganization as jest.Mock).mockResolvedValueOnce({
        ...mockOrganization,
        ...updateData
      })

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.updateOrganization('1', updateData)
      })

      expect(organizationApi.updateOrganization).toHaveBeenCalledWith('1', updateData)
    })

    it('should delete organization', async () => {
      ;(organizationApi.deleteOrganization as jest.Mock).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.deleteOrganization('1')
      })

      expect(organizationApi.deleteOrganization).toHaveBeenCalledWith('1')
    })
  })

  describe('Department', () => {
    it('should fetch departments', async () => {
      const mockResponse: EntityPaginatedResponse<Department> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockDepartment]
      }
      ;(departmentApi.getDepartments as jest.Mock).mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.fetchDepartments()
      })

      expect(result.current.departments).toEqual([mockDepartment])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('should create department', async () => {
      const newDept: Partial<Department> = {
        name: 'New Dept',
        description: 'New Description',
        organization_id: '1'
      }
      ;(departmentApi.createDepartment as jest.Mock).mockResolvedValueOnce(mockDepartment)

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.createDepartment(newDept)
      })

      expect(departmentApi.createDepartment).toHaveBeenCalledWith(newDept)
    })

    it('should update department', async () => {
      const updateData: Partial<Department> = {
        name: 'Updated Dept'
      }
      ;(departmentApi.updateDepartment as jest.Mock).mockResolvedValueOnce({
        ...mockDepartment,
        ...updateData
      })

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.updateDepartment('1', updateData)
      })

      expect(departmentApi.updateDepartment).toHaveBeenCalledWith('1', updateData)
    })

    it('should delete department', async () => {
      ;(departmentApi.deleteDepartment as jest.Mock).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.deleteDepartment('1')
      })

      expect(departmentApi.deleteDepartment).toHaveBeenCalledWith('1')
    })
  })

  describe('Team', () => {
    it('should fetch teams', async () => {
      const mockResponse: EntityPaginatedResponse<Team> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockTeam]
      }
      ;(teamApi.getTeams as jest.Mock).mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.fetchTeams()
      })

      expect(result.current.teams).toEqual([mockTeam])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('should create team', async () => {
      const newTeam: Partial<Team> = {
        name: 'New Team',
        description: 'New Description',
        department_id: '1'
      }
      ;(teamApi.createTeam as jest.Mock).mockResolvedValueOnce(mockTeam)

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.createTeam(newTeam)
      })

      expect(teamApi.createTeam).toHaveBeenCalledWith(newTeam)
    })

    it('should update team', async () => {
      const updateData: Partial<Team> = {
        name: 'Updated Team'
      }
      ;(teamApi.updateTeam as jest.Mock).mockResolvedValueOnce({
        ...mockTeam,
        ...updateData
      })

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.updateTeam('1', updateData)
      })

      expect(teamApi.updateTeam).toHaveBeenCalledWith('1', updateData)
    })

    it('should delete team', async () => {
      ;(teamApi.deleteTeam as jest.Mock).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.deleteTeam('1')
      })

      expect(teamApi.deleteTeam).toHaveBeenCalledWith('1')
    })
  })

  describe('Team Member', () => {
    it('should fetch team members', async () => {
      const mockResponse: EntityPaginatedResponse<TeamMember> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockTeamMember]
      }
      ;(teamMemberApi.getTeamMembers as jest.Mock).mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.fetchTeamMembers()
      })

      expect(result.current.teamMembers).toEqual([mockTeamMember])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('should create team member', async () => {
      const newMember: Partial<TeamMember> = {
        user_id: 'user2',
        team_id: '1',
        role: 'member',
        is_leader: false,
        join_date: '2024-01-01'
      }
      ;(teamMemberApi.createTeamMember as jest.Mock).mockResolvedValueOnce(mockTeamMember)

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.createTeamMember(newMember)
      })

      expect(teamMemberApi.createTeamMember).toHaveBeenCalledWith(newMember)
    })

    it('should update team member', async () => {
      const updateData: Partial<TeamMember> = {
        role: 'senior',
        is_leader: true
      }
      ;(teamMemberApi.updateTeamMember as jest.Mock).mockResolvedValueOnce({
        ...mockTeamMember,
        ...updateData
      })

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.updateTeamMember('1', updateData)
      })

      expect(teamMemberApi.updateTeamMember).toHaveBeenCalledWith('1', updateData)
    })

    it('should delete team member', async () => {
      ;(teamMemberApi.deleteTeamMember as jest.Mock).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.deleteTeamMember('1')
      })

      expect(teamMemberApi.deleteTeamMember).toHaveBeenCalledWith('1')
    })
  })

  describe('Organization Settings', () => {
    it('should fetch organization settings', async () => {
      const mockResponse: EntityPaginatedResponse<OrganizationSettings> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockOrganizationSettings]
      }
      ;(organizationSettingsApi.getOrganizationSettings as jest.Mock).mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.fetchOrganizationSettings()
      })

      expect(result.current.organizationSettings).toEqual([mockOrganizationSettings])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('should create organization settings', async () => {
      const newSettings: Partial<OrganizationSettings> = {
        organization_id: '1',
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        date_format: 'YYYY-MM-DD',
        notification_preferences: {},
        security_settings: {},
        feature_flags: {}
      }
      ;(organizationSettingsApi.createOrganizationSettings as jest.Mock).mockResolvedValueOnce(mockOrganizationSettings)

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.createOrganizationSettings(newSettings)
      })

      expect(organizationSettingsApi.createOrganizationSettings).toHaveBeenCalledWith(newSettings)
    })

    it('should update organization settings', async () => {
      const updateData: Partial<OrganizationSettings> = {
        theme: 'dark',
        language: 'fr'
      }
      ;(organizationSettingsApi.updateOrganizationSettings as jest.Mock).mockResolvedValueOnce({
        ...mockOrganizationSettings,
        ...updateData
      })

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.updateOrganizationSettings('1', updateData)
      })

      expect(organizationSettingsApi.updateOrganizationSettings).toHaveBeenCalledWith('1', updateData)
    })

    it('should delete organization settings', async () => {
      ;(organizationSettingsApi.deleteOrganizationSettings as jest.Mock).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useEntityStore())
      await act(async () => {
        await result.current.deleteOrganizationSettings('1')
      })

      expect(organizationSettingsApi.deleteOrganizationSettings).toHaveBeenCalledWith('1')
    })
  })
}) 