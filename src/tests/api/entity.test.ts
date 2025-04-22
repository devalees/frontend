/**
 * Entity API Tests
 * 
 * Tests for the Entity API service endpoints:
 * - Organization management
 * - Department management
 * - Team management
 * - Team Member management
 * - Organization Settings management
 */

import { describe, test, expect, beforeEach, afterEach } from '../utils/testUtils';
import axios from 'axios';
import { createMockResponse, mockApiError } from '../utils/mockApi';
import { 
  organizationApi, 
  departmentApi, 
  teamApi, 
  teamMemberApi, 
  organizationSettingsApi 
} from '../../lib/api/entity';
import { 
  Organization, 
  Department, 
  Team, 
  TeamMember, 
  OrganizationSettings 
} from '../../types/entity';

// Mock axios
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

// Mock axios methods with proper Jest mock functions
mockedAxios.get = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));
mockedAxios.post = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));
mockedAxios.put = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));
mockedAxios.patch = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));
mockedAxios.delete = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));

describe('Entity API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Organization API', () => {
    const mockOrganization: Organization = {
      id: '1',
      name: 'Test Organization',
      description: 'Test Description',
      logo_url: 'https://example.com/logo.png',
      website: 'https://example.com',
      industry: 'Technology',
      size: '100',
      founded_date: '2020-01-01',
      headquarters: 'New York, NY',
      contact_email: 'contact@example.com',
      contact_phone: '+1234567890',
      settings_id: '1',
      is_active: true,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-01T00:00:00Z'
    };

    test('getOrganizations returns paginated organizations', async () => {
      const mockResponse = createMockResponse({
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [mockOrganization]
        }
      });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await organizationApi.getOrganizations();
      expect(result).toEqual({
        count: 1,
        next: null,
        previous: null,
        results: [mockOrganization]
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/organizations/',
        { params: undefined }
      );
    });

    test('getOrganization returns a single organization', async () => {
      const mockResponse = createMockResponse({ data: mockOrganization });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await organizationApi.getOrganization('1');
      expect(result).toEqual(mockOrganization);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/organizations/1/'
      );
    });

    test('createOrganization creates a new organization', async () => {
      const mockResponse = createMockResponse({ data: mockOrganization });
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await organizationApi.createOrganization(mockOrganization);
      expect(result).toEqual(mockOrganization);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/entity/organizations/',
        mockOrganization
      );
    });

    test('updateOrganization updates an organization', async () => {
      const mockResponse = createMockResponse({ data: mockOrganization });
      mockedAxios.patch.mockResolvedValueOnce(mockResponse);

      const result = await organizationApi.updateOrganization('1', { name: 'Updated Name' });
      expect(result).toEqual(mockOrganization);
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        '/api/v1/entity/organizations/1/',
        { name: 'Updated Name' }
      );
    });

    test('deleteOrganization deletes an organization', async () => {
      const mockResponse = createMockResponse({ data: null });
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await organizationApi.deleteOrganization('1');
      expect(result).toBe(true);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        '/api/v1/entity/organizations/1/'
      );
    });

    test('hardDeleteOrganization hard deletes an organization', async () => {
      const mockResponse = createMockResponse({ data: null });
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await organizationApi.hardDeleteOrganization('1');
      expect(result).toBe(true);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        '/api/v1/entity/organizations/1/hard_delete/'
      );
    });

    test('getOrganizationDepartments returns paginated departments', async () => {
      const mockDepartment: Department = {
        id: '1',
        name: 'Test Department',
        description: 'Test Description',
        organization_id: '1',
        parent_department_id: undefined,
        manager_id: '1',
        budget: 100000,
        location: 'New York, NY',
        headcount: 10,
        is_active: true,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z'
      };

      const mockResponse = createMockResponse({
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [mockDepartment]
        }
      });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await organizationApi.getOrganizationDepartments('1');
      expect(result).toEqual({
        count: 1,
        next: null,
        previous: null,
        results: [mockDepartment]
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/organizations/1/department/',
        { params: undefined }
      );
    });

    test('getOrganizationTeamMembers returns paginated team members', async () => {
      const mockTeamMember: TeamMember = {
        id: '1',
        user_id: '1',
        team_id: '1',
        role: 'Developer',
        is_leader: false,
        join_date: '2020-01-01',
        skills: ['JavaScript', 'TypeScript'],
        availability: 100,
        performance_rating: 4.5,
        is_active: true,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z'
      };

      const mockResponse = createMockResponse({
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [mockTeamMember]
        }
      });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await organizationApi.getOrganizationTeamMembers('1');
      expect(result).toEqual({
        count: 1,
        next: null,
        previous: null,
        results: [mockTeamMember]
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/organizations/1/team_member/',
        { params: undefined }
      );
    });

    test('getOrganizationAnalytics returns analytics data', async () => {
      const mockAnalytics = {
        total_employees: 100,
        departments_count: 5,
        teams_count: 10,
        growth_rate: 0.15
      };

      const mockResponse = createMockResponse({ data: mockAnalytics });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await organizationApi.getOrganizationAnalytics('1');
      expect(result).toEqual(mockAnalytics);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/organizations/1/analytics/'
      );
    });

    test('getOrganizationActivity returns activity data', async () => {
      const mockActivity = {
        recent_activities: [
          { id: '1', type: 'created', entity: 'department', timestamp: '2020-01-01T00:00:00Z' }
        ]
      };

      const mockResponse = createMockResponse({ data: mockActivity });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await organizationApi.getOrganizationActivity('1');
      expect(result).toEqual(mockActivity);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/organizations/1/activity/'
      );
    });

    test('getOrganizationPerformance returns performance data', async () => {
      const mockPerformance = {
        overall_score: 85,
        metrics: {
          productivity: 90,
          efficiency: 80,
          quality: 85
        }
      };

      const mockResponse = createMockResponse({ data: mockPerformance });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await organizationApi.getOrganizationPerformance('1');
      expect(result).toEqual(mockPerformance);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/organizations/1/performance/'
      );
    });

    test('getOrganizationGrowth returns growth data', async () => {
      const mockGrowth = {
        employee_growth: 0.15,
        revenue_growth: 0.25,
        department_growth: 0.10
      };

      const mockResponse = createMockResponse({ data: mockGrowth });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await organizationApi.getOrganizationGrowth('1');
      expect(result).toEqual(mockGrowth);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/organizations/1/growth/'
      );
    });
  });

  describe('Department API', () => {
    const mockDepartment: Department = {
      id: '1',
      name: 'Test Department',
      description: 'Test Description',
      organization_id: '1',
      parent_department_id: undefined,
      manager_id: '1',
      budget: 100000,
      location: 'New York, NY',
      headcount: 10,
      is_active: true,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-01T00:00:00Z'
    };

    test('getDepartments returns paginated departments', async () => {
      const mockResponse = createMockResponse({
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [mockDepartment]
        }
      });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await departmentApi.getDepartments();
      expect(result).toEqual({
        count: 1,
        next: null,
        previous: null,
        results: [mockDepartment]
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/departments/',
        { params: undefined }
      );
    });

    test('getDepartment returns a single department', async () => {
      const mockResponse = createMockResponse({ data: mockDepartment });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await departmentApi.getDepartment('1');
      expect(result).toEqual(mockDepartment);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/departments/1/'
      );
    });

    test('createDepartment creates a new department', async () => {
      const mockResponse = createMockResponse({ data: mockDepartment });
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await departmentApi.createDepartment(mockDepartment);
      expect(result).toEqual(mockDepartment);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/entity/departments/',
        mockDepartment
      );
    });

    test('updateDepartment updates a department', async () => {
      const mockResponse = createMockResponse({ data: mockDepartment });
      mockedAxios.patch.mockResolvedValueOnce(mockResponse);

      const result = await departmentApi.updateDepartment('1', { name: 'Updated Name' });
      expect(result).toEqual(mockDepartment);
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        '/api/v1/entity/departments/1/',
        { name: 'Updated Name' }
      );
    });

    test('deleteDepartment deletes a department', async () => {
      const mockResponse = createMockResponse({ data: null });
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await departmentApi.deleteDepartment('1');
      expect(result).toBe(true);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        '/api/v1/entity/departments/1/'
      );
    });

    test('hardDeleteDepartment hard deletes a department', async () => {
      const mockResponse = createMockResponse({ data: null });
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await departmentApi.hardDeleteDepartment('1');
      expect(result).toBe(true);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        '/api/v1/entity/departments/1/hard_delete/'
      );
    });

    test('getDepartmentTeams returns paginated teams', async () => {
      const mockTeam: Team = {
        id: '1',
        name: 'Test Team',
        description: 'Test Description',
        department_id: '1',
        leader_id: '1',
        project_id: undefined,
        size: 5,
        skills: ['JavaScript', 'TypeScript'],
        is_active: true,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z'
      };

      const mockResponse = createMockResponse({
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [mockTeam]
        }
      });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await departmentApi.getDepartmentTeams('1');
      expect(result).toEqual({
        count: 1,
        next: null,
        previous: null,
        results: [mockTeam]
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/departments/1/team/',
        { params: undefined }
      );
    });

    test('getDepartmentTeamMembers returns paginated team members', async () => {
      const mockTeamMember: TeamMember = {
        id: '1',
        user_id: '1',
        team_id: '1',
        role: 'Developer',
        is_leader: false,
        join_date: '2020-01-01',
        skills: ['JavaScript', 'TypeScript'],
        availability: 100,
        performance_rating: 4.5,
        is_active: true,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z'
      };

      const mockResponse = createMockResponse({
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [mockTeamMember]
        }
      });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await departmentApi.getDepartmentTeamMembers('1');
      expect(result).toEqual({
        count: 1,
        next: null,
        previous: null,
        results: [mockTeamMember]
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/departments/1/team_member/',
        { params: undefined }
      );
    });

    test('getChildDepartments returns paginated child departments', async () => {
      const mockResponse = createMockResponse({
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [mockDepartment]
        }
      });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await departmentApi.getChildDepartments('1');
      expect(result).toEqual({
        count: 1,
        next: null,
        previous: null,
        results: [mockDepartment]
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/departments/1/child_department/',
        { params: undefined }
      );
    });
  });

  describe('Team API', () => {
    const mockTeam: Team = {
      id: '1',
      name: 'Test Team',
      description: 'Test Description',
      department_id: '1',
      leader_id: '1',
      project_id: undefined,
      size: 5,
      skills: ['JavaScript', 'TypeScript'],
      is_active: true,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-01T00:00:00Z'
    };

    test('getTeams returns paginated teams', async () => {
      const mockResponse = createMockResponse({
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [mockTeam]
        }
      });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await teamApi.getTeams();
      expect(result).toEqual({
        count: 1,
        next: null,
        previous: null,
        results: [mockTeam]
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/teams/',
        { params: undefined }
      );
    });

    test('getTeam returns a single team', async () => {
      const mockResponse = createMockResponse({ data: mockTeam });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await teamApi.getTeam('1');
      expect(result).toEqual(mockTeam);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/teams/1/'
      );
    });

    test('createTeam creates a new team', async () => {
      const mockResponse = createMockResponse({ data: mockTeam });
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await teamApi.createTeam(mockTeam);
      expect(result).toEqual(mockTeam);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/entity/teams/',
        mockTeam
      );
    });

    test('updateTeam updates a team', async () => {
      const mockResponse = createMockResponse({ data: mockTeam });
      mockedAxios.patch.mockResolvedValueOnce(mockResponse);

      const result = await teamApi.updateTeam('1', { name: 'Updated Name' });
      expect(result).toEqual(mockTeam);
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        '/api/v1/entity/teams/1/',
        { name: 'Updated Name' }
      );
    });

    test('deleteTeam deletes a team', async () => {
      const mockResponse = createMockResponse({ data: null });
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await teamApi.deleteTeam('1');
      expect(result).toBe(true);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        '/api/v1/entity/teams/1/'
      );
    });

    test('hardDeleteTeam hard deletes a team', async () => {
      const mockResponse = createMockResponse({ data: null });
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await teamApi.hardDeleteTeam('1');
      expect(result).toBe(true);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        '/api/v1/entity/teams/1/hard_delete/'
      );
    });

    test('getTeamMembers returns paginated team members', async () => {
      const mockTeamMember: TeamMember = {
        id: '1',
        user_id: '1',
        team_id: '1',
        role: 'Developer',
        is_leader: false,
        join_date: '2020-01-01',
        skills: ['JavaScript', 'TypeScript'],
        availability: 100,
        performance_rating: 4.5,
        is_active: true,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z'
      };

      const mockResponse = createMockResponse({
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [mockTeamMember]
        }
      });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await teamApi.getTeamMembers('1');
      expect(result).toEqual({
        count: 1,
        next: null,
        previous: null,
        results: [mockTeamMember]
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/teams/1/team_member/',
        { params: undefined }
      );
    });
  });

  describe('Team Member API', () => {
    const mockTeamMember: TeamMember = {
      id: '1',
      user_id: '1',
      team_id: '1',
      role: 'Developer',
      is_leader: false,
      join_date: '2020-01-01',
      skills: ['JavaScript', 'TypeScript'],
      availability: 100,
      performance_rating: 4.5,
      is_active: true,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-01T00:00:00Z'
    };

    test('getTeamMembers returns paginated team members', async () => {
      const mockResponse = createMockResponse({
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [mockTeamMember]
        }
      });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await teamMemberApi.getTeamMembers();
      expect(result).toEqual({
        count: 1,
        next: null,
        previous: null,
        results: [mockTeamMember]
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/team-members/',
        { params: undefined }
      );
    });

    test('getTeamMember returns a single team member', async () => {
      const mockResponse = createMockResponse({ data: mockTeamMember });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await teamMemberApi.getTeamMember('1');
      expect(result).toEqual(mockTeamMember);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/team-members/1/'
      );
    });

    test('createTeamMember creates a new team member', async () => {
      const mockResponse = createMockResponse({ data: mockTeamMember });
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await teamMemberApi.createTeamMember(mockTeamMember);
      expect(result).toEqual(mockTeamMember);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/entity/team-members/',
        mockTeamMember
      );
    });

    test('updateTeamMember updates a team member', async () => {
      const mockResponse = createMockResponse({ data: mockTeamMember });
      mockedAxios.patch.mockResolvedValueOnce(mockResponse);

      const result = await teamMemberApi.updateTeamMember('1', { role: 'Senior Developer' });
      expect(result).toEqual(mockTeamMember);
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        '/api/v1/entity/team-members/1/',
        { role: 'Senior Developer' }
      );
    });

    test('deleteTeamMember deletes a team member', async () => {
      const mockResponse = createMockResponse({ data: null });
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await teamMemberApi.deleteTeamMember('1');
      expect(result).toBe(true);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        '/api/v1/entity/team-members/1/'
      );
    });

    test('hardDeleteTeamMember hard deletes a team member', async () => {
      const mockResponse = createMockResponse({ data: null });
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await teamMemberApi.hardDeleteTeamMember('1');
      expect(result).toBe(true);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        '/api/v1/entity/team-members/1/hard_delete/'
      );
    });
  });

  describe('Organization Settings API', () => {
    const mockOrganizationSettings: OrganizationSettings = {
      id: '1',
      organization_id: '1',
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      date_format: 'YYYY-MM-DD',
      notification_preferences: {
        email: true,
        push: true,
        sms: false
      },
      security_settings: {
        two_factor_auth: true,
        password_expiry_days: 90
      },
      feature_flags: {
        beta_features: false,
        advanced_analytics: true
      },
      is_active: true,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-01T00:00:00Z'
    };

    test('getOrganizationSettings returns paginated organization settings', async () => {
      const mockResponse = createMockResponse({
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [mockOrganizationSettings]
        }
      });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await organizationSettingsApi.getOrganizationSettings();
      expect(result).toEqual({
        count: 1,
        next: null,
        previous: null,
        results: [mockOrganizationSettings]
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/organization-settings/',
        { params: undefined }
      );
    });

    test('getOrganizationSetting returns a single organization settings', async () => {
      const mockResponse = createMockResponse({ data: mockOrganizationSettings });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await organizationSettingsApi.getOrganizationSetting('1');
      expect(result).toEqual(mockOrganizationSettings);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/organization-settings/1/'
      );
    });

    test('createOrganizationSettings creates new organization settings', async () => {
      const mockResponse = createMockResponse({ data: mockOrganizationSettings });
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await organizationSettingsApi.createOrganizationSettings(mockOrganizationSettings);
      expect(result).toEqual(mockOrganizationSettings);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/entity/organization-settings/',
        mockOrganizationSettings
      );
    });

    test('updateOrganizationSettings updates organization settings', async () => {
      const mockResponse = createMockResponse({ data: mockOrganizationSettings });
      mockedAxios.patch.mockResolvedValueOnce(mockResponse);

      const result = await organizationSettingsApi.updateOrganizationSettings('1', { theme: 'dark' });
      expect(result).toEqual(mockOrganizationSettings);
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        '/api/v1/entity/organization-settings/1/',
        { theme: 'dark' }
      );
    });

    test('deleteOrganizationSettings deletes organization settings', async () => {
      const mockResponse = createMockResponse({ data: null });
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await organizationSettingsApi.deleteOrganizationSettings('1');
      expect(result).toBe(true);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        '/api/v1/entity/organization-settings/1/'
      );
    });

    test('hardDeleteOrganizationSettings hard deletes organization settings', async () => {
      const mockResponse = createMockResponse({ data: null });
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await organizationSettingsApi.hardDeleteOrganizationSettings('1');
      expect(result).toBe(true);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        '/api/v1/entity/organization-settings/1/hard_delete/'
      );
    });

    test('getSettingsByOrganization returns organization settings by organization ID', async () => {
      const mockResponse = createMockResponse({ data: mockOrganizationSettings });
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await organizationSettingsApi.getSettingsByOrganization('1');
      expect(result).toEqual(mockOrganizationSettings);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/entity/organization-settings/get_by_organization/',
        { params: { organization_id: '1' } }
      );
    });
  });
}); 