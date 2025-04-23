/**
 * Entity Hierarchy API Tests
 * 
 * This file contains tests for API operations related to Entity Hierarchy.
 * It tests API calls, response handling, and error handling.
 */

import { jest } from '@jest/globals';
import axios from 'axios';
import { 
  mockApiMethod, 
  mockApiError, 
  createMockResponse, 
  createMockError 
} from '@/tests/utils/mockApi';
import { Organization, Department, Team, EntityPaginatedResponse } from '@/types/entity';

// Mock the axios module
jest.mock('axios');

// Import entity API after mocking axios
import {
  organizationApi,
  departmentApi
} from '@/lib/api/entity';

describe('Entity Hierarchy API Tests', () => {
  // Mock data
  const mockOrganization: Organization = {
    id: '1',
    name: 'Test Organization',
    description: 'Test Description',
    industry: 'Technology',
    website: 'https://example.com',
    logo_url: 'https://example.com/logo.png',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    is_active: true
  };

  const mockDepartments: Department[] = [
    {
      id: '1',
      name: 'Engineering',
      description: 'Engineering Department',
      organization_id: '1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      is_active: true
    },
    {
      id: '2',
      name: 'Marketing',
      description: 'Marketing Department',
      organization_id: '1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      is_active: true
    }
  ];

  const mockChildDepartments: Department[] = [
    {
      id: '3',
      name: 'Frontend',
      description: 'Frontend Engineering',
      organization_id: '1',
      parent_department_id: '1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      is_active: true
    }
  ];

  const mockTeams: Team[] = [
    {
      id: '1',
      name: 'Frontend Team',
      description: 'Frontend Development Team',
      department_id: '1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      is_active: true
    },
    {
      id: '2',
      name: 'Backend Team',
      description: 'Backend Development Team',
      department_id: '1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      is_active: true
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Organization API', () => {
    it('fetches organization by ID', async () => {
      // Mock the API response
      mockApiMethod('get', mockOrganization);

      // Call the API
      const result = await organizationApi.getOrganization('1');
      
      // Verify the result
      expect(result).toEqual(mockOrganization);
      
      // Verify the API was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith('/api/v1/entity/organizations/1/');
    });

    it('fetches organization departments', async () => {
      // Create a paginated response
      const paginatedResponse: EntityPaginatedResponse<Department> = {
        count: mockDepartments.length,
        next: null,
        previous: null,
        results: mockDepartments
      };
      
      // Mock the API response
      mockApiMethod('get', paginatedResponse);

      // Call the API
      const result = await organizationApi.getOrganizationDepartments('1');
      
      // Verify the result
      expect(result).toEqual(paginatedResponse);
      expect(result.results).toEqual(mockDepartments);
      
      // Verify the API was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith('/api/v1/entity/organizations/1/department/');
    });

    it('handles error when fetching organization', async () => {
      // Mock the API error
      mockApiError('get', 'Failed to fetch organization', 404, 'NOT_FOUND');

      // Call the API and verify it throws the expected error
      await expect(organizationApi.getOrganization('999')).rejects.toThrow();
      
      // Verify the API was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith('/api/v1/entity/organizations/999/');
    });
  });

  describe('Department API', () => {
    it('fetches department by ID', async () => {
      // Mock the API response
      mockApiMethod('get', mockDepartments[0]);

      // Call the API
      const result = await departmentApi.getDepartment('1');
      
      // Verify the result
      expect(result).toEqual(mockDepartments[0]);
      
      // Verify the API was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith('/api/v1/entity/departments/1/');
    });

    it('fetches department teams', async () => {
      // Create a paginated response
      const paginatedResponse: EntityPaginatedResponse<Team> = {
        count: mockTeams.length,
        next: null,
        previous: null,
        results: mockTeams
      };
      
      // Mock the API response
      mockApiMethod('get', paginatedResponse);

      // Call the API
      const result = await departmentApi.getDepartmentTeams('1');
      
      // Verify the result
      expect(result).toEqual(paginatedResponse);
      expect(result.results).toEqual(mockTeams);
      
      // Verify the API was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith('/api/v1/entity/departments/1/team/');
    });

    it('fetches child departments', async () => {
      // Create a paginated response
      const paginatedResponse: EntityPaginatedResponse<Department> = {
        count: mockChildDepartments.length,
        next: null,
        previous: null,
        results: mockChildDepartments
      };
      
      // Mock the API response
      mockApiMethod('get', paginatedResponse);

      // Call the API
      const result = await departmentApi.getChildDepartments('1');
      
      // Verify the result
      expect(result).toEqual(paginatedResponse);
      expect(result.results).toEqual(mockChildDepartments);
      
      // Verify the API was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith('/api/v1/entity/departments/1/child_department/');
    });

    it('handles error when fetching department', async () => {
      // Mock the API error
      mockApiError('get', 'Failed to fetch department', 404, 'NOT_FOUND');

      // Call the API and verify it throws the expected error
      await expect(departmentApi.getDepartment('999')).rejects.toThrow();
      
      // Verify the API was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith('/api/v1/entity/departments/999/');
    });
  });
}); 