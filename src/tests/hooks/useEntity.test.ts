import { renderHook, act } from '@testing-library/react'
import { 
  useOrganization,
  useDepartment,
  useTeam,
  useTeamMember,
  useOrganizationSettings,
} from '@/hooks/useEntity'
import { useEntityStore } from '@/store/slices/entitySlice'
import { 
  mockOrganization,
  mockDepartment,
  mockTeam,
  mockTeamMember,
  mockOrganizationSettings,
} from '@/tests/utils/mockData'

// Mock the store
jest.mock('@/store/slices/entitySlice')
const mockedUseEntityStore = useEntityStore as jest.MockedFunction<typeof useEntityStore>

describe('useOrganization', () => {
  beforeEach(() => {
    // Reset store state
    const mockStore = {
      organizations: [],
      departments: [],
      teams: [],
      teamMembers: [],
      organizationSettings: [],
      loading: false,
      error: null,
      fetchOrganizations: jest.fn().mockImplementation(async () => {}),
      createOrganization: jest.fn().mockImplementation(async () => mockOrganization),
      updateOrganization: jest.fn().mockImplementation(async () => mockOrganization),
      deleteOrganization: jest.fn().mockImplementation(async () => {}),
      getOrganizationById: jest.fn(),
      getOrganizationDepartments: jest.fn(),
      getOrganizationTeamMembers: jest.fn(),
      getOrganizationAnalytics: jest.fn(),
      getOrganizationActivity: jest.fn(),
      getOrganizationPerformance: jest.fn(),
      getOrganizationGrowth: jest.fn(),
    }
    mockedUseEntityStore.mockReturnValue(mockStore)
  })

  it('should fetch organizations', async () => {
    const mockStore = mockedUseEntityStore()
    mockStore.organizations = [mockOrganization]
    
    const { result } = renderHook(() => useOrganization())
    const response = await act(() => result.current.fetchOrganizations())
    
    expect(response.data).toEqual([mockOrganization])
    expect(response.error).toBeNull()
    expect(result.current.organizations).toEqual([mockOrganization])
    expect(result.current.loading).toBe(false)
  })

  it('should create organization', async () => {
    const mockStore = mockedUseEntityStore()
    mockStore.organizations = [mockOrganization]
    
    const { result } = renderHook(() => useOrganization())
    const response = await act(() => result.current.createOrganization(mockOrganization))
    
    expect(response.data).toEqual(mockOrganization)
    expect(response.error).toBeNull()
    expect(result.current.organizations).toContainEqual(mockOrganization)
  })

  it('should update organization', async () => {
    const updatedOrg = { ...mockOrganization, name: 'Updated Org' }
    const mockStore = mockedUseEntityStore()
    mockStore.updateOrganization = jest.fn().mockImplementation(async () => updatedOrg)
    
    const { result } = renderHook(() => useOrganization())
    const response = await act(() => 
      result.current.updateOrganization(mockOrganization.id, { name: 'Updated Org' })
    )
    
    expect(response.data).toEqual(updatedOrg)
    expect(response.error).toBeNull()
  })

  it('should delete organization', async () => {
    const mockStore = mockedUseEntityStore()
    mockStore.organizations = []
    
    const { result } = renderHook(() => useOrganization())
    const response = await act(() => result.current.deleteOrganization(mockOrganization.id))
    
    expect(response.error).toBeNull()
    expect(result.current.organizations).not.toContainEqual(mockOrganization)
  })
})

describe('useDepartment', () => {
  beforeEach(() => {
    const mockStore = {
      organizations: [],
      departments: [],
      teams: [],
      teamMembers: [],
      organizationSettings: [],
      loading: false,
      error: null,
      fetchDepartments: jest.fn().mockImplementation(async () => {}),
      createDepartment: jest.fn().mockImplementation(async () => mockDepartment),
      updateDepartment: jest.fn().mockImplementation(async () => mockDepartment),
      deleteDepartment: jest.fn().mockImplementation(async () => {}),
      getDepartmentById: jest.fn(),
      getDepartmentTeams: jest.fn(),
      getDepartmentTeamMembers: jest.fn(),
      getChildDepartments: jest.fn(),
    }
    mockedUseEntityStore.mockReturnValue(mockStore)
  })

  it('should fetch departments', async () => {
    const mockStore = mockedUseEntityStore()
    mockStore.departments = [mockDepartment]
    
    const { result } = renderHook(() => useDepartment())
    const response = await act(() => result.current.fetchDepartments())
    
    expect(response.data).toEqual([mockDepartment])
    expect(response.error).toBeNull()
    expect(result.current.departments).toEqual([mockDepartment])
    expect(result.current.loading).toBe(false)
  })

  it('should create department', async () => {
    const mockStore = mockedUseEntityStore()
    mockStore.departments = [mockDepartment]
    
    const { result } = renderHook(() => useDepartment())
    const response = await act(() => result.current.createDepartment(mockDepartment))
    
    expect(response.data).toEqual(mockDepartment)
    expect(response.error).toBeNull()
    expect(result.current.departments).toContainEqual(mockDepartment)
  })

  it('should update department', async () => {
    const updatedDept = { ...mockDepartment, name: 'Updated Dept' }
    const mockStore = mockedUseEntityStore()
    mockStore.updateDepartment = jest.fn().mockImplementation(async () => updatedDept)
    
    const { result } = renderHook(() => useDepartment())
    const response = await act(() => 
      result.current.updateDepartment(mockDepartment.id, { name: 'Updated Dept' })
    )
    
    expect(response.data).toEqual(updatedDept)
    expect(response.error).toBeNull()
  })

  it('should delete department', async () => {
    const mockStore = mockedUseEntityStore()
    mockStore.departments = []
    
    const { result } = renderHook(() => useDepartment())
    const response = await act(() => result.current.deleteDepartment(mockDepartment.id))
    
    expect(response.error).toBeNull()
    expect(result.current.departments).not.toContainEqual(mockDepartment)
  })
})

describe('useTeam', () => {
  beforeEach(() => {
    const mockStore = {
      organizations: [],
      departments: [],
      teams: [],
      teamMembers: [],
      organizationSettings: [],
      loading: false,
      error: null,
      fetchTeams: jest.fn().mockImplementation(async () => {}),
      createTeam: jest.fn().mockImplementation(async () => mockTeam),
      updateTeam: jest.fn().mockImplementation(async () => mockTeam),
      deleteTeam: jest.fn().mockImplementation(async () => {}),
      getTeamById: jest.fn(),
      getTeamMembers: jest.fn(),
    }
    mockedUseEntityStore.mockReturnValue(mockStore)
  })

  it('should fetch teams', async () => {
    const mockStore = mockedUseEntityStore()
    mockStore.teams = [mockTeam]
    
    const { result } = renderHook(() => useTeam())
    const response = await act(() => result.current.fetchTeams())
    
    expect(response.data).toEqual([mockTeam])
    expect(response.error).toBeNull()
    expect(result.current.teams).toEqual([mockTeam])
    expect(result.current.loading).toBe(false)
  })

  it('should create team', async () => {
    const mockStore = mockedUseEntityStore()
    mockStore.teams = [mockTeam]
    
    const { result } = renderHook(() => useTeam())
    const response = await act(() => result.current.createTeam(mockTeam))
    
    expect(response.data).toEqual(mockTeam)
    expect(response.error).toBeNull()
    expect(result.current.teams).toContainEqual(mockTeam)
  })

  it('should update team', async () => {
    const updatedTeam = { ...mockTeam, name: 'Updated Team' }
    const mockStore = mockedUseEntityStore()
    mockStore.updateTeam = jest.fn().mockImplementation(async () => updatedTeam)
    
    const { result } = renderHook(() => useTeam())
    const response = await act(() => 
      result.current.updateTeam(mockTeam.id, { name: 'Updated Team' })
    )
    
    expect(response.data).toEqual(updatedTeam)
    expect(response.error).toBeNull()
  })

  it('should delete team', async () => {
    const mockStore = mockedUseEntityStore()
    mockStore.teams = []
    
    const { result } = renderHook(() => useTeam())
    const response = await act(() => result.current.deleteTeam(mockTeam.id))
    
    expect(response.error).toBeNull()
    expect(result.current.teams).not.toContainEqual(mockTeam)
  })
})

describe('useTeamMember', () => {
  beforeEach(() => {
    const mockStore = {
      organizations: [],
      departments: [],
      teams: [],
      teamMembers: [],
      organizationSettings: [],
      loading: false,
      error: null,
      fetchTeamMembers: jest.fn().mockImplementation(async () => {}),
      createTeamMember: jest.fn().mockImplementation(async () => mockTeamMember),
      updateTeamMember: jest.fn().mockImplementation(async () => mockTeamMember),
      deleteTeamMember: jest.fn().mockImplementation(async () => {}),
      getTeamMemberById: jest.fn(),
    }
    mockedUseEntityStore.mockReturnValue(mockStore)
  })

  it('should fetch team members', async () => {
    const mockStore = mockedUseEntityStore()
    mockStore.teamMembers = [mockTeamMember]
    
    const { result } = renderHook(() => useTeamMember())
    const response = await act(() => result.current.fetchTeamMembers())
    
    expect(response.data).toEqual([mockTeamMember])
    expect(response.error).toBeNull()
    expect(result.current.teamMembers).toEqual([mockTeamMember])
    expect(result.current.loading).toBe(false)
  })

  it('should create team member', async () => {
    const mockStore = mockedUseEntityStore()
    mockStore.teamMembers = [mockTeamMember]
    
    const { result } = renderHook(() => useTeamMember())
    const response = await act(() => result.current.createTeamMember(mockTeamMember))
    
    expect(response.data).toEqual(mockTeamMember)
    expect(response.error).toBeNull()
    expect(result.current.teamMembers).toContainEqual(mockTeamMember)
  })

  it('should update team member', async () => {
    const updatedMember = { ...mockTeamMember, role: 'Senior Developer' }
    const mockStore = mockedUseEntityStore()
    mockStore.updateTeamMember = jest.fn().mockImplementation(async () => updatedMember)
    
    const { result } = renderHook(() => useTeamMember())
    const response = await act(() => 
      result.current.updateTeamMember(mockTeamMember.id, { role: 'Senior Developer' })
    )
    
    expect(response.data).toEqual(updatedMember)
    expect(response.error).toBeNull()
  })

  it('should delete team member', async () => {
    const mockStore = mockedUseEntityStore()
    mockStore.teamMembers = []
    
    const { result } = renderHook(() => useTeamMember())
    const response = await act(() => result.current.deleteTeamMember(mockTeamMember.id))
    
    expect(response.error).toBeNull()
    expect(result.current.teamMembers).not.toContainEqual(mockTeamMember)
  })
})

describe('useOrganizationSettings', () => {
  beforeEach(() => {
    const mockStore = {
      organizations: [],
      departments: [],
      teams: [],
      teamMembers: [],
      organizationSettings: [],
      loading: false,
      error: null,
      fetchOrganizationSettings: jest.fn().mockImplementation(async () => {}),
      createOrganizationSettings: jest.fn().mockImplementation(async () => mockOrganizationSettings),
      updateOrganizationSettings: jest.fn().mockImplementation(async () => mockOrganizationSettings),
      deleteOrganizationSettings: jest.fn().mockImplementation(async () => {}),
      getOrganizationSettingsById: jest.fn(),
      getSettingsByOrganization: jest.fn(),
    }
    mockedUseEntityStore.mockReturnValue(mockStore)
  })

  it('should fetch organization settings', async () => {
    const mockStore = mockedUseEntityStore()
    mockStore.organizationSettings = [mockOrganizationSettings]
    
    const { result } = renderHook(() => useOrganizationSettings())
    const response = await act(() => result.current.fetchOrganizationSettings())
    
    expect(response.data).toEqual([mockOrganizationSettings])
    expect(response.error).toBeNull()
    expect(result.current.organizationSettings).toEqual([mockOrganizationSettings])
    expect(result.current.loading).toBe(false)
  })

  it('should create organization settings', async () => {
    const mockStore = mockedUseEntityStore()
    mockStore.organizationSettings = [mockOrganizationSettings]
    
    const { result } = renderHook(() => useOrganizationSettings())
    const response = await act(() => result.current.createOrganizationSettings(mockOrganizationSettings))
    
    expect(response.data).toEqual(mockOrganizationSettings)
    expect(response.error).toBeNull()
    expect(result.current.organizationSettings).toContainEqual(mockOrganizationSettings)
  })

  it('should update organization settings', async () => {
    const updatedSettings = { ...mockOrganizationSettings, theme: 'dark' }
    const mockStore = mockedUseEntityStore()
    mockStore.updateOrganizationSettings = jest.fn().mockImplementation(async () => updatedSettings)
    
    const { result } = renderHook(() => useOrganizationSettings())
    const response = await act(() => 
      result.current.updateOrganizationSettings(mockOrganizationSettings.id, { theme: 'dark' })
    )
    
    expect(response.data).toEqual(updatedSettings)
    expect(response.error).toBeNull()
  })

  it('should delete organization settings', async () => {
    const mockStore = mockedUseEntityStore()
    mockStore.organizationSettings = []
    
    const { result } = renderHook(() => useOrganizationSettings())
    const response = await act(() => result.current.deleteOrganizationSettings(mockOrganizationSettings.id))
    
    expect(response.error).toBeNull()
    expect(result.current.organizationSettings).not.toContainEqual(mockOrganizationSettings)
  })
}) 