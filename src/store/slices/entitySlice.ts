import { create } from 'zustand'
import { Organization, Department, Team, TeamMember, OrganizationSettings } from '@/types/entity'
import { 
  organizationApi,
  departmentApi,
  teamApi,
  teamMemberApi,
  organizationSettingsApi
} from '@/lib/api/entity'

export interface EntityState {
  // State
  organizations: Organization[]
  departments: Department[]
  teams: Team[]
  teamMembers: TeamMember[]
  organizationSettings: OrganizationSettings[]
  loading: boolean
  error: string | null

  // Organization Actions
  fetchOrganizations: () => Promise<void>
  getOrganization: (id: string) => Promise<Organization>
  createOrganization: (organization: Partial<Organization>) => Promise<Organization>
  updateOrganization: (id: string, organization: Partial<Organization>) => Promise<Organization>
  deleteOrganization: (id: string) => Promise<void>
  hardDeleteOrganization: (id: string) => Promise<void>
  getOrganizationDepartments: (id: string) => Promise<Department[]>
  getOrganizationTeamMembers: (id: string) => Promise<TeamMember[]>
  getOrganizationAnalytics: (id: string) => Promise<any>
  getOrganizationActivity: (id: string) => Promise<any>
  getOrganizationPerformance: (id: string) => Promise<any>
  getOrganizationGrowth: (id: string) => Promise<any>

  // Department Actions
  fetchDepartments: () => Promise<void>
  getDepartment: (id: string) => Promise<Department>
  createDepartment: (department: Partial<Department>) => Promise<Department>
  updateDepartment: (id: string, department: Partial<Department>) => Promise<Department>
  deleteDepartment: (id: string) => Promise<void>
  hardDeleteDepartment: (id: string) => Promise<void>
  getDepartmentTeams: (id: string) => Promise<Team[]>
  getDepartmentTeamMembers: (id: string) => Promise<TeamMember[]>
  getChildDepartments: (id: string) => Promise<Department[]>

  // Team Actions
  fetchTeams: () => Promise<void>
  getTeam: (id: string) => Promise<Team>
  createTeam: (team: Partial<Team>) => Promise<Team>
  updateTeam: (id: string, team: Partial<Team>) => Promise<Team>
  deleteTeam: (id: string) => Promise<void>
  hardDeleteTeam: (id: string) => Promise<void>
  getTeamMembers: (id: string) => Promise<TeamMember[]>

  // Team Member Actions
  fetchTeamMembers: () => Promise<void>
  getTeamMember: (id: string) => Promise<TeamMember>
  createTeamMember: (teamMember: Partial<TeamMember>) => Promise<TeamMember>
  updateTeamMember: (id: string, teamMember: Partial<TeamMember>) => Promise<TeamMember>
  deleteTeamMember: (id: string) => Promise<void>
  hardDeleteTeamMember: (id: string) => Promise<void>

  // Organization Settings Actions
  fetchOrganizationSettings: () => Promise<void>
  getOrganizationSetting: (id: string) => Promise<OrganizationSettings>
  createOrganizationSettings: (settings: Partial<OrganizationSettings>) => Promise<OrganizationSettings>
  updateOrganizationSettings: (id: string, settings: Partial<OrganizationSettings>) => Promise<OrganizationSettings>
  deleteOrganizationSettings: (id: string) => Promise<void>
  hardDeleteOrganizationSettings: (id: string) => Promise<void>
  getSettingsByOrganization: (organizationId: string) => Promise<OrganizationSettings>

  // Selectors
  getOrganizationById: (id: string) => Organization | undefined
  getDepartmentById: (id: string) => Department | undefined
  getTeamById: (id: string) => Team | undefined
  getTeamMemberById: (id: string) => TeamMember | undefined
  getOrganizationSettingsById: (id: string) => OrganizationSettings | undefined
}

export const useEntityStore = create<EntityState>((set, get) => ({
  // Initial State
  organizations: [],
  departments: [],
  teams: [],
  teamMembers: [],
  organizationSettings: [],
  loading: false,
  error: null,

  // Organization Actions
  fetchOrganizations: async () => {
    try {
      set({ loading: true, error: null })
      const response = await organizationApi.getOrganizations()
      set({ organizations: response.results || [], loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch organizations', loading: false })
    }
  },

  getOrganization: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await organizationApi.getOrganization(id)
      set({ loading: false })
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch organization', loading: false })
      throw error
    }
  },

  createOrganization: async (organization: Partial<Organization>) => {
    try {
      set({ loading: true, error: null })
      const response = await organizationApi.createOrganization(organization)
      set(state => ({
        organizations: state.organizations ? [...state.organizations, response] : [response],
        loading: false
      }))
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create organization', loading: false })
      throw error
    }
  },

  updateOrganization: async (id: string, organization: Partial<Organization>) => {
    try {
      set({ loading: true, error: null })
      const response = await organizationApi.updateOrganization(id, organization)
      set(state => ({
        organizations: state.organizations ? state.organizations.map(org => 
          org.id === id ? response : org
        ) : [],
        loading: false
      }))
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update organization', loading: false })
      throw error
    }
  },

  deleteOrganization: async (id: string) => {
    try {
      set({ loading: true, error: null })
      await organizationApi.deleteOrganization(id)
      set(state => ({
        organizations: state.organizations ? state.organizations.filter(org => org.id !== id) : [],
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete organization', loading: false })
      throw error
    }
  },

  hardDeleteOrganization: async (id: string) => {
    try {
      set({ loading: true, error: null })
      await organizationApi.hardDeleteOrganization(id)
      set(state => ({
        organizations: state.organizations.filter(org => org.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to hard delete organization', loading: false })
      throw error
    }
  },

  getOrganizationDepartments: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await organizationApi.getOrganizationDepartments(id)
      set({ loading: false })
      return response.results
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch organization departments', loading: false })
      throw error
    }
  },

  getOrganizationTeamMembers: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await organizationApi.getOrganizationTeamMembers(id)
      set({ loading: false })
      return response.results
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch organization team members', loading: false })
      throw error
    }
  },

  getOrganizationAnalytics: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await organizationApi.getOrganizationAnalytics(id)
      set({ loading: false })
      return response.results
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch organization analytics', loading: false })
      throw error
    }
  },

  getOrganizationActivity: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await organizationApi.getOrganizationActivity(id)
      set({ loading: false })
      return response.results
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch organization activity', loading: false })
      throw error
    }
  },

  getOrganizationPerformance: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await organizationApi.getOrganizationPerformance(id)
      set({ loading: false })
      return response.results
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch organization performance', loading: false })
      throw error
    }
  },

  getOrganizationGrowth: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await organizationApi.getOrganizationGrowth(id)
      set({ loading: false })
      return response.results
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch organization growth', loading: false })
      throw error
    }
  },

  // Department Actions
  fetchDepartments: async () => {
    try {
      set({ loading: true, error: null })
      const response = await departmentApi.getDepartments()
      set({ departments: response.results, loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch departments', loading: false })
    }
  },

  getDepartment: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await departmentApi.getDepartment(id)
      set({ loading: false })
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch department', loading: false })
      throw error
    }
  },

  createDepartment: async (department: Partial<Department>) => {
    try {
      set({ loading: true, error: null })
      const response = await departmentApi.createDepartment(department)
      set(state => ({
        departments: [...state.departments, response],
        loading: false
      }))
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create department', loading: false })
      throw error
    }
  },

  updateDepartment: async (id: string, department: Partial<Department>) => {
    try {
      set({ loading: true, error: null })
      const response = await departmentApi.updateDepartment(id, department)
      set(state => ({
        departments: state.departments.map(dept => 
          dept.id === id ? response : dept
        ),
        loading: false
      }))
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update department', loading: false })
      throw error
    }
  },

  deleteDepartment: async (id: string) => {
    try {
      set({ loading: true, error: null })
      await departmentApi.deleteDepartment(id)
      set(state => ({
        departments: state.departments.filter(dept => dept.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete department', loading: false })
      throw error
    }
  },

  hardDeleteDepartment: async (id: string) => {
    try {
      set({ loading: true, error: null })
      await departmentApi.hardDeleteDepartment(id)
      set(state => ({
        departments: state.departments.filter(dept => dept.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to hard delete department', loading: false })
      throw error
    }
  },

  getDepartmentTeams: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await departmentApi.getDepartmentTeams(id)
      set({ loading: false })
      return response.results
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch department teams', loading: false })
      throw error
    }
  },

  getDepartmentTeamMembers: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await departmentApi.getDepartmentTeamMembers(id)
      set({ loading: false })
      return response.results
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch department team members', loading: false })
      throw error
    }
  },

  getChildDepartments: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await departmentApi.getChildDepartments(id)
      set({ loading: false })
      return response.results
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch child departments', loading: false })
      throw error
    }
  },

  // Team Actions
  fetchTeams: async () => {
    try {
      set({ loading: true, error: null })
      const response = await teamApi.getTeams()
      set({ teams: response.results, loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch teams', loading: false })
    }
  },

  getTeam: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await teamApi.getTeam(id)
      set({ loading: false })
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch team', loading: false })
      throw error
    }
  },

  createTeam: async (team: Partial<Team>) => {
    try {
      set({ loading: true, error: null })
      const response = await teamApi.createTeam(team)
      set(state => ({
        teams: [...state.teams, response],
        loading: false
      }))
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create team', loading: false })
      throw error
    }
  },

  updateTeam: async (id: string, team: Partial<Team>) => {
    try {
      set({ loading: true, error: null })
      const response = await teamApi.updateTeam(id, team)
      set(state => ({
        teams: state.teams.map(t => 
          t.id === id ? response : t
        ),
        loading: false
      }))
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update team', loading: false })
      throw error
    }
  },

  deleteTeam: async (id: string) => {
    try {
      set({ loading: true, error: null })
      await teamApi.deleteTeam(id)
      set(state => ({
        teams: state.teams.filter(t => t.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete team', loading: false })
      throw error
    }
  },

  hardDeleteTeam: async (id: string) => {
    try {
      set({ loading: true, error: null })
      await teamApi.hardDeleteTeam(id)
      set(state => ({
        teams: state.teams.filter(t => t.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to hard delete team', loading: false })
      throw error
    }
  },

  getTeamMembers: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await teamApi.getTeamMembers(id)
      set({ loading: false })
      return response.results
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch team members', loading: false })
      throw error
    }
  },

  // Team Member Actions
  fetchTeamMembers: async () => {
    try {
      set({ loading: true, error: null })
      const response = await teamMemberApi.getTeamMembers()
      set({ teamMembers: response.results, loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch team members', loading: false })
    }
  },

  getTeamMember: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await teamMemberApi.getTeamMember(id)
      set({ loading: false })
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch team member', loading: false })
      throw error
    }
  },

  createTeamMember: async (teamMember: Partial<TeamMember>) => {
    try {
      set({ loading: true, error: null })
      const response = await teamMemberApi.createTeamMember(teamMember)
      set(state => ({
        teamMembers: [...state.teamMembers, response],
        loading: false
      }))
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create team member', loading: false })
      throw error
    }
  },

  updateTeamMember: async (id: string, teamMember: Partial<TeamMember>) => {
    try {
      set({ loading: true, error: null })
      const response = await teamMemberApi.updateTeamMember(id, teamMember)
      set(state => ({
        teamMembers: state.teamMembers.map(tm => 
          tm.id === id ? response : tm
        ),
        loading: false
      }))
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update team member', loading: false })
      throw error
    }
  },

  deleteTeamMember: async (id: string) => {
    try {
      set({ loading: true, error: null })
      await teamMemberApi.deleteTeamMember(id)
      set(state => ({
        teamMembers: state.teamMembers.filter(tm => tm.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete team member', loading: false })
      throw error
    }
  },

  hardDeleteTeamMember: async (id: string) => {
    try {
      set({ loading: true, error: null })
      await teamMemberApi.hardDeleteTeamMember(id)
      set(state => ({
        teamMembers: state.teamMembers.filter(tm => tm.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to hard delete team member', loading: false })
      throw error
    }
  },

  // Organization Settings Actions
  fetchOrganizationSettings: async () => {
    try {
      set({ loading: true, error: null })
      const response = await organizationSettingsApi.getOrganizationSettings()
      set({ organizationSettings: response.results, loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch organization settings', loading: false })
    }
  },

  getOrganizationSetting: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await organizationSettingsApi.getOrganizationSetting(id)
      set({ loading: false })
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch organization setting', loading: false })
      throw error
    }
  },

  createOrganizationSettings: async (settings: Partial<OrganizationSettings>) => {
    try {
      set({ loading: true, error: null })
      const response = await organizationSettingsApi.createOrganizationSettings(settings)
      set(state => ({
        organizationSettings: [...state.organizationSettings, response],
        loading: false
      }))
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create organization settings', loading: false })
      throw error
    }
  },

  updateOrganizationSettings: async (id: string, settings: Partial<OrganizationSettings>) => {
    try {
      set({ loading: true, error: null })
      const response = await organizationSettingsApi.updateOrganizationSettings(id, settings)
      set(state => ({
        organizationSettings: state.organizationSettings.map(s => 
          s.id === id ? response : s
        ),
        loading: false
      }))
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update organization settings', loading: false })
      throw error
    }
  },

  deleteOrganizationSettings: async (id: string) => {
    try {
      set({ loading: true, error: null })
      await organizationSettingsApi.deleteOrganizationSettings(id)
      set(state => ({
        organizationSettings: state.organizationSettings.filter(s => s.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete organization settings', loading: false })
      throw error
    }
  },

  hardDeleteOrganizationSettings: async (id: string) => {
    try {
      set({ loading: true, error: null })
      await organizationSettingsApi.hardDeleteOrganizationSettings(id)
      set(state => ({
        organizationSettings: state.organizationSettings.filter(s => s.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to hard delete organization settings', loading: false })
      throw error
    }
  },

  getSettingsByOrganization: async (organizationId: string) => {
    try {
      set({ loading: true, error: null })
      const response = await organizationSettingsApi.getSettingsByOrganization(organizationId)
      set({ loading: false })
      return response
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch organization settings', loading: false })
      throw error
    }
  },

  // Selectors
  getOrganizationById: (id: string) => {
    return get().organizations.find(org => org.id === id)
  },

  getDepartmentById: (id: string) => {
    return get().departments.find(dept => dept.id === id)
  },

  getTeamById: (id: string) => {
    return get().teams.find(team => team.id === id)
  },

  getTeamMemberById: (id: string) => {
    return get().teamMembers.find(member => member.id === id)
  },

  getOrganizationSettingsById: (id: string) => {
    return get().organizationSettings.find(settings => settings.id === id)
  }
})) 