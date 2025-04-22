/**
 * Entity API Service
 * 
 * Provides methods for interacting with the Entity API endpoints:
 * - Organization management
 * - Department management
 * - Team management
 * - Team Member management
 * - Organization Settings management
 */

import axios from 'axios';
import { 
  Organization, 
  Department, 
  Team, 
  TeamMember, 
  OrganizationSettings,
  EntityPaginatedResponse 
} from '../../types/entity';
import { ApiResponse } from '../../types/common';
import { 
  ApiError, 
  NetworkError, 
  ValidationError, 
  NotFoundError, 
  ServerError,
  formatError,
  logError
} from './errorHandling';

// Base URL for entity endpoints
const BASE_URL = '/api/v1/entity';

/**
 * Handle API errors and return appropriate error objects
 */
const handleApiError = (error: any): never => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 0;
    const message = error.response?.data?.message || error.message || 'An unknown error occurred';
    
    if (status === 0) {
      const networkError = new NetworkError(message);
      logError(networkError);
      throw networkError;
    } else if (status === 400) {
      const validationError = new ValidationError(message, error.response?.data?.errors || {});
      logError(validationError);
      throw validationError;
    } else if (status === 401) {
      const authError = new ApiError(message, 401);
      logError(authError);
      throw authError;
    } else if (status === 403) {
      const authError = new ApiError(message, 403);
      logError(authError);
      throw authError;
    } else if (status === 404) {
      const notFoundError = new NotFoundError(message);
      logError(notFoundError);
      throw notFoundError;
    } else {
      const serverError = new ServerError(message);
      logError(serverError);
      throw serverError;
    }
  } else {
    const unknownError = new ApiError('An unknown error occurred');
    logError(unknownError);
    throw unknownError;
  }
};

/**
 * Organization API methods
 */
export const organizationApi = {
  /**
   * Get a list of organizations
   * @param params Query parameters for filtering and pagination
   * @returns Paginated response with organizations
   */
  getOrganizations: async (params?: Record<string, any>): Promise<EntityPaginatedResponse<Organization>> => {
    try {
      const response = await axios.get<ApiResponse<EntityPaginatedResponse<Organization>>>(
        `${BASE_URL}/organizations/`,
        { params }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get a single organization by ID
   * @param id Organization ID
   * @returns Organization data
   */
  getOrganization: async (id: string): Promise<Organization> => {
    try {
      const response = await axios.get<ApiResponse<Organization>>(
        `${BASE_URL}/organizations/${id}/`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a new organization
   * @param data Organization data
   * @returns Created organization
   */
  createOrganization: async (data: Partial<Organization>): Promise<Organization> => {
    try {
      const response = await axios.post<ApiResponse<Organization>>(
        `${BASE_URL}/organizations/`,
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update an organization
   * @param id Organization ID
   * @param data Updated organization data
   * @returns Updated organization
   */
  updateOrganization: async (id: string, data: Partial<Organization>): Promise<Organization> => {
    try {
      const response = await axios.patch<ApiResponse<Organization>>(
        `${BASE_URL}/organizations/${id}/`,
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete an organization (soft delete)
   * @param id Organization ID
   * @returns Success status
   */
  deleteOrganization: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${BASE_URL}/organizations/${id}/`);
      return true;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Hard delete an organization
   * @param id Organization ID
   * @returns Success status
   */
  hardDeleteOrganization: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${BASE_URL}/organizations/${id}/hard_delete/`);
      return true;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get departments for an organization
   * @param id Organization ID
   * @param params Query parameters for filtering and pagination
   * @returns Paginated response with departments
   */
  getOrganizationDepartments: async (id: string, params?: Record<string, any>): Promise<EntityPaginatedResponse<Department>> => {
    try {
      const response = await axios.get<ApiResponse<EntityPaginatedResponse<Department>>>(
        `${BASE_URL}/organizations/${id}/department/`,
        { params }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get team members for an organization
   * @param id Organization ID
   * @param params Query parameters for filtering and pagination
   * @returns Paginated response with team members
   */
  getOrganizationTeamMembers: async (id: string, params?: Record<string, any>): Promise<EntityPaginatedResponse<TeamMember>> => {
    try {
      const response = await axios.get<ApiResponse<EntityPaginatedResponse<TeamMember>>>(
        `${BASE_URL}/organizations/${id}/team_member/`,
        { params }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get analytics for an organization
   * @param id Organization ID
   * @returns Organization analytics data
   */
  getOrganizationAnalytics: async (id: string): Promise<any> => {
    try {
      const response = await axios.get<ApiResponse<any>>(
        `${BASE_URL}/organizations/${id}/analytics/`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get activity for an organization
   * @param id Organization ID
   * @returns Organization activity data
   */
  getOrganizationActivity: async (id: string): Promise<any> => {
    try {
      const response = await axios.get<ApiResponse<any>>(
        `${BASE_URL}/organizations/${id}/activity/`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get performance metrics for an organization
   * @param id Organization ID
   * @returns Organization performance data
   */
  getOrganizationPerformance: async (id: string): Promise<any> => {
    try {
      const response = await axios.get<ApiResponse<any>>(
        `${BASE_URL}/organizations/${id}/performance/`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get growth metrics for an organization
   * @param id Organization ID
   * @returns Organization growth data
   */
  getOrganizationGrowth: async (id: string): Promise<any> => {
    try {
      const response = await axios.get<ApiResponse<any>>(
        `${BASE_URL}/organizations/${id}/growth/`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

/**
 * Department API methods
 */
export const departmentApi = {
  /**
   * Get a list of departments
   * @param params Query parameters for filtering and pagination
   * @returns Paginated response with departments
   */
  getDepartments: async (params?: Record<string, any>): Promise<EntityPaginatedResponse<Department>> => {
    try {
      const response = await axios.get<ApiResponse<EntityPaginatedResponse<Department>>>(
        `${BASE_URL}/departments/`,
        { params }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get a single department by ID
   * @param id Department ID
   * @returns Department data
   */
  getDepartment: async (id: string): Promise<Department> => {
    try {
      const response = await axios.get<ApiResponse<Department>>(
        `${BASE_URL}/departments/${id}/`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a new department
   * @param data Department data
   * @returns Created department
   */
  createDepartment: async (data: Partial<Department>): Promise<Department> => {
    try {
      const response = await axios.post<ApiResponse<Department>>(
        `${BASE_URL}/departments/`,
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update a department
   * @param id Department ID
   * @param data Updated department data
   * @returns Updated department
   */
  updateDepartment: async (id: string, data: Partial<Department>): Promise<Department> => {
    try {
      const response = await axios.patch<ApiResponse<Department>>(
        `${BASE_URL}/departments/${id}/`,
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete a department (soft delete)
   * @param id Department ID
   * @returns Success status
   */
  deleteDepartment: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${BASE_URL}/departments/${id}/`);
      return true;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Hard delete a department
   * @param id Department ID
   * @returns Success status
   */
  hardDeleteDepartment: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${BASE_URL}/departments/${id}/hard_delete/`);
      return true;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get teams for a department
   * @param id Department ID
   * @param params Query parameters for filtering and pagination
   * @returns Paginated response with teams
   */
  getDepartmentTeams: async (id: string, params?: Record<string, any>): Promise<EntityPaginatedResponse<Team>> => {
    try {
      const response = await axios.get<ApiResponse<EntityPaginatedResponse<Team>>>(
        `${BASE_URL}/departments/${id}/team/`,
        { params }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get team members for a department
   * @param id Department ID
   * @param params Query parameters for filtering and pagination
   * @returns Paginated response with team members
   */
  getDepartmentTeamMembers: async (id: string, params?: Record<string, any>): Promise<EntityPaginatedResponse<TeamMember>> => {
    try {
      const response = await axios.get<ApiResponse<EntityPaginatedResponse<TeamMember>>>(
        `${BASE_URL}/departments/${id}/team_member/`,
        { params }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get child departments for a department
   * @param id Department ID
   * @param params Query parameters for filtering and pagination
   * @returns Paginated response with child departments
   */
  getChildDepartments: async (id: string, params?: Record<string, any>): Promise<EntityPaginatedResponse<Department>> => {
    try {
      const response = await axios.get<ApiResponse<EntityPaginatedResponse<Department>>>(
        `${BASE_URL}/departments/${id}/child_department/`,
        { params }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

/**
 * Team API methods
 */
export const teamApi = {
  /**
   * Get a list of teams
   * @param params Query parameters for filtering and pagination
   * @returns Paginated response with teams
   */
  getTeams: async (params?: Record<string, any>): Promise<EntityPaginatedResponse<Team>> => {
    try {
      const response = await axios.get<ApiResponse<EntityPaginatedResponse<Team>>>(
        `${BASE_URL}/teams/`,
        { params }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get a single team by ID
   * @param id Team ID
   * @returns Team data
   */
  getTeam: async (id: string): Promise<Team> => {
    try {
      const response = await axios.get<ApiResponse<Team>>(
        `${BASE_URL}/teams/${id}/`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a new team
   * @param data Team data
   * @returns Created team
   */
  createTeam: async (data: Partial<Team>): Promise<Team> => {
    try {
      const response = await axios.post<ApiResponse<Team>>(
        `${BASE_URL}/teams/`,
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update a team
   * @param id Team ID
   * @param data Updated team data
   * @returns Updated team
   */
  updateTeam: async (id: string, data: Partial<Team>): Promise<Team> => {
    try {
      const response = await axios.patch<ApiResponse<Team>>(
        `${BASE_URL}/teams/${id}/`,
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete a team (soft delete)
   * @param id Team ID
   * @returns Success status
   */
  deleteTeam: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${BASE_URL}/teams/${id}/`);
      return true;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Hard delete a team
   * @param id Team ID
   * @returns Success status
   */
  hardDeleteTeam: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${BASE_URL}/teams/${id}/hard_delete/`);
      return true;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get team members for a team
   * @param id Team ID
   * @param params Query parameters for filtering and pagination
   * @returns Paginated response with team members
   */
  getTeamMembers: async (id: string, params?: Record<string, any>): Promise<EntityPaginatedResponse<TeamMember>> => {
    try {
      const response = await axios.get<ApiResponse<EntityPaginatedResponse<TeamMember>>>(
        `${BASE_URL}/teams/${id}/team_member/`,
        { params }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

/**
 * Team Member API methods
 */
export const teamMemberApi = {
  /**
   * Get a list of team members
   * @param params Query parameters for filtering and pagination
   * @returns Paginated response with team members
   */
  getTeamMembers: async (params?: Record<string, any>): Promise<EntityPaginatedResponse<TeamMember>> => {
    try {
      const response = await axios.get<ApiResponse<EntityPaginatedResponse<TeamMember>>>(
        `${BASE_URL}/team-members/`,
        { params }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get a single team member by ID
   * @param id Team Member ID
   * @returns Team Member data
   */
  getTeamMember: async (id: string): Promise<TeamMember> => {
    try {
      const response = await axios.get<ApiResponse<TeamMember>>(
        `${BASE_URL}/team-members/${id}/`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a new team member
   * @param data Team Member data
   * @returns Created team member
   */
  createTeamMember: async (data: Partial<TeamMember>): Promise<TeamMember> => {
    try {
      const response = await axios.post<ApiResponse<TeamMember>>(
        `${BASE_URL}/team-members/`,
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update a team member
   * @param id Team Member ID
   * @param data Updated team member data
   * @returns Updated team member
   */
  updateTeamMember: async (id: string, data: Partial<TeamMember>): Promise<TeamMember> => {
    try {
      const response = await axios.patch<ApiResponse<TeamMember>>(
        `${BASE_URL}/team-members/${id}/`,
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete a team member (soft delete)
   * @param id Team Member ID
   * @returns Success status
   */
  deleteTeamMember: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${BASE_URL}/team-members/${id}/`);
      return true;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Hard delete a team member
   * @param id Team Member ID
   * @returns Success status
   */
  hardDeleteTeamMember: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${BASE_URL}/team-members/${id}/hard_delete/`);
      return true;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

/**
 * Organization Settings API methods
 */
export const organizationSettingsApi = {
  /**
   * Get a list of organization settings
   * @param params Query parameters for filtering and pagination
   * @returns Paginated response with organization settings
   */
  getOrganizationSettings: async (params?: Record<string, any>): Promise<EntityPaginatedResponse<OrganizationSettings>> => {
    try {
      const response = await axios.get<ApiResponse<EntityPaginatedResponse<OrganizationSettings>>>(
        `${BASE_URL}/organization-settings/`,
        { params }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get a single organization settings by ID
   * @param id Organization Settings ID
   * @returns Organization Settings data
   */
  getOrganizationSetting: async (id: string): Promise<OrganizationSettings> => {
    try {
      const response = await axios.get<ApiResponse<OrganizationSettings>>(
        `${BASE_URL}/organization-settings/${id}/`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create new organization settings
   * @param data Organization Settings data
   * @returns Created organization settings
   */
  createOrganizationSettings: async (data: Partial<OrganizationSettings>): Promise<OrganizationSettings> => {
    try {
      const response = await axios.post<ApiResponse<OrganizationSettings>>(
        `${BASE_URL}/organization-settings/`,
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update organization settings
   * @param id Organization Settings ID
   * @param data Updated organization settings data
   * @returns Updated organization settings
   */
  updateOrganizationSettings: async (id: string, data: Partial<OrganizationSettings>): Promise<OrganizationSettings> => {
    try {
      const response = await axios.patch<ApiResponse<OrganizationSettings>>(
        `${BASE_URL}/organization-settings/${id}/`,
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete organization settings (soft delete)
   * @param id Organization Settings ID
   * @returns Success status
   */
  deleteOrganizationSettings: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${BASE_URL}/organization-settings/${id}/`);
      return true;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Hard delete organization settings
   * @param id Organization Settings ID
   * @returns Success status
   */
  hardDeleteOrganizationSettings: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${BASE_URL}/organization-settings/${id}/hard_delete/`);
      return true;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get organization settings by organization ID
   * @param organizationId Organization ID
   * @returns Organization Settings data
   */
  getSettingsByOrganization: async (organizationId: string): Promise<OrganizationSettings> => {
    try {
      const response = await axios.get<ApiResponse<OrganizationSettings>>(
        `${BASE_URL}/organization-settings/get_by_organization/`,
        { params: { organization_id: organizationId } }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
}; 