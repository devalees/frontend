import { useCallback } from 'react'
import { useEntityStore } from '@/store/slices/entitySlice'
import { 
  Organization,
  Department,
  Team,
  TeamMember,
  OrganizationSettings,
} from '@/types/entity'

// Organization Hook
export const useOrganization = () => {
  const store = useEntityStore()

  const fetchOrganizations = useCallback(async () => {
    try {
      await store.fetchOrganizations()
      return { data: store.organizations, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch organizations' }
    }
  }, [store])

  const createOrganization = useCallback(async (organization: Partial<Organization>) => {
    try {
      const data = await store.createOrganization(organization)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create organization' }
    }
  }, [store])

  const updateOrganization = useCallback(async (id: string, organization: Partial<Organization>) => {
    try {
      const data = await store.updateOrganization(id, organization)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update organization' }
    }
  }, [store])

  const deleteOrganization = useCallback(async (id: string) => {
    try {
      await store.deleteOrganization(id)
      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete organization' }
    }
  }, [store])

  return {
    organizations: store.organizations,
    loading: store.loading,
    error: store.error,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationById: store.getOrganizationById,
    getOrganizationDepartments: store.getOrganizationDepartments,
    getOrganizationTeamMembers: store.getOrganizationTeamMembers,
    getOrganizationAnalytics: store.getOrganizationAnalytics,
    getOrganizationActivity: store.getOrganizationActivity,
    getOrganizationPerformance: store.getOrganizationPerformance,
    getOrganizationGrowth: store.getOrganizationGrowth,
  }
}

// Department Hook
export const useDepartment = () => {
  const store = useEntityStore()

  const fetchDepartments = useCallback(async () => {
    try {
      await store.fetchDepartments()
      return { data: store.departments, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch departments' }
    }
  }, [store])

  const createDepartment = useCallback(async (department: Partial<Department>) => {
    try {
      const data = await store.createDepartment(department)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create department' }
    }
  }, [store])

  const updateDepartment = useCallback(async (id: string, department: Partial<Department>) => {
    try {
      const data = await store.updateDepartment(id, department)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update department' }
    }
  }, [store])

  const deleteDepartment = useCallback(async (id: string) => {
    try {
      await store.deleteDepartment(id)
      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete department' }
    }
  }, [store])

  return {
    departments: store.departments,
    loading: store.loading,
    error: store.error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById: store.getDepartmentById,
    getDepartmentTeams: store.getDepartmentTeams,
    getDepartmentTeamMembers: store.getDepartmentTeamMembers,
    getChildDepartments: store.getChildDepartments,
  }
}

// Team Hook
export const useTeam = () => {
  const store = useEntityStore()

  const fetchTeams = useCallback(async () => {
    try {
      await store.fetchTeams()
      return { data: store.teams, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch teams' }
    }
  }, [store])

  const createTeam = useCallback(async (team: Partial<Team>) => {
    try {
      const data = await store.createTeam(team)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create team' }
    }
  }, [store])

  const updateTeam = useCallback(async (id: string, team: Partial<Team>) => {
    try {
      const data = await store.updateTeam(id, team)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update team' }
    }
  }, [store])

  const deleteTeam = useCallback(async (id: string) => {
    try {
      await store.deleteTeam(id)
      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete team' }
    }
  }, [store])

  return {
    teams: store.teams,
    loading: store.loading,
    error: store.error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    getTeamById: store.getTeamById,
    getTeamMembers: store.getTeamMembers,
  }
}

// Team Member Hook
export const useTeamMember = () => {
  const store = useEntityStore()

  const fetchTeamMembers = useCallback(async () => {
    try {
      await store.fetchTeamMembers()
      return { data: store.teamMembers, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch team members' }
    }
  }, [store])

  const createTeamMember = useCallback(async (teamMember: Partial<TeamMember>) => {
    try {
      const data = await store.createTeamMember(teamMember)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create team member' }
    }
  }, [store])

  const updateTeamMember = useCallback(async (id: string, teamMember: Partial<TeamMember>) => {
    try {
      const data = await store.updateTeamMember(id, teamMember)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update team member' }
    }
  }, [store])

  const deleteTeamMember = useCallback(async (id: string) => {
    try {
      await store.deleteTeamMember(id)
      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete team member' }
    }
  }, [store])

  return {
    teamMembers: store.teamMembers,
    loading: store.loading,
    error: store.error,
    fetchTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    getTeamMemberById: store.getTeamMemberById,
  }
}

// Organization Settings Hook
export const useOrganizationSettings = () => {
  const store = useEntityStore()

  const fetchOrganizationSettings = useCallback(async () => {
    try {
      await store.fetchOrganizationSettings()
      return { data: store.organizationSettings, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch organization settings' }
    }
  }, [store])

  const createOrganizationSettings = useCallback(async (settings: Partial<OrganizationSettings>) => {
    try {
      const data = await store.createOrganizationSettings(settings)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create organization settings' }
    }
  }, [store])

  const updateOrganizationSettings = useCallback(async (id: string, settings: Partial<OrganizationSettings>) => {
    try {
      const data = await store.updateOrganizationSettings(id, settings)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update organization settings' }
    }
  }, [store])

  const deleteOrganizationSettings = useCallback(async (id: string) => {
    try {
      await store.deleteOrganizationSettings(id)
      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete organization settings' }
    }
  }, [store])

  return {
    organizationSettings: store.organizationSettings,
    loading: store.loading,
    error: store.error,
    fetchOrganizationSettings,
    createOrganizationSettings,
    updateOrganizationSettings,
    deleteOrganizationSettings,
    getOrganizationSettingsById: store.getOrganizationSettingsById,
    getSettingsByOrganization: store.getSettingsByOrganization,
  }
} 