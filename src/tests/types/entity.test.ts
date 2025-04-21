/**
 * Entity Type Tests
 * 
 * Tests for the entity type definitions including Organization, Department, 
 * Team, TeamMember, and OrganizationSettings interfaces.
 */
import { describe, it, expect } from '../utils/testUtils';
import { 
  Organization, 
  Department, 
  Team, 
  TeamMember, 
  OrganizationSettings,
  EntityPaginatedResponse
} from '../../types/entity';

describe('Entity Types', () => {
  describe('Organization', () => {
    it('should create a valid Organization object', () => {
      const organization: Organization = {
        id: '1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
        name: 'Test Organization',
        description: 'A test organization',
        logo_url: 'https://example.com/logo.png',
        website: 'https://example.com',
        industry: 'Technology',
        size: 'Medium',
        founded_date: '2020-01-01',
        headquarters: 'New York, NY',
        contact_email: 'contact@example.com',
        contact_phone: '+1-555-123-4567',
        settings_id: '1'
      };
      
      expect(organization.id).toBe('1');
      expect(organization.name).toBe('Test Organization');
      expect(organization.is_active).toBe(true);
      expect(organization.industry).toBe('Technology');
    });
    
    it('should allow partial Organization object with required fields', () => {
      const organization: Organization = {
        id: '1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
        name: 'Minimal Organization'
      };
      
      expect(organization.id).toBe('1');
      expect(organization.name).toBe('Minimal Organization');
      expect(organization.description).toBeUndefined();
    });
  });
  
  describe('Department', () => {
    it('should create a valid Department object', () => {
      const department: Department = {
        id: '1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
        name: 'Engineering',
        description: 'Software Engineering Department',
        organization_id: '1',
        parent_department_id: undefined,
        manager_id: '2',
        budget: 1000000,
        location: 'New York, NY',
        headcount: 50
      };
      
      expect(department.id).toBe('1');
      expect(department.name).toBe('Engineering');
      expect(department.organization_id).toBe('1');
      expect(department.budget).toBe(1000000);
    });
    
    it('should allow partial Department object with required fields', () => {
      const department: Department = {
        id: '1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
        name: 'Minimal Department',
        organization_id: '1'
      };
      
      expect(department.id).toBe('1');
      expect(department.name).toBe('Minimal Department');
      expect(department.organization_id).toBe('1');
      expect(department.description).toBeUndefined();
    });
  });
  
  describe('Team', () => {
    it('should create a valid Team object', () => {
      const team: Team = {
        id: '1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
        name: 'Frontend Team',
        description: 'Frontend Development Team',
        department_id: '1',
        leader_id: '3',
        project_id: '1',
        size: 5,
        skills: ['React', 'TypeScript', 'Next.js']
      };
      
      expect(team.id).toBe('1');
      expect(team.name).toBe('Frontend Team');
      expect(team.department_id).toBe('1');
      expect(team.skills).toEqual(['React', 'TypeScript', 'Next.js']);
    });
    
    it('should allow partial Team object with required fields', () => {
      const team: Team = {
        id: '1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
        name: 'Minimal Team',
        department_id: '1'
      };
      
      expect(team.id).toBe('1');
      expect(team.name).toBe('Minimal Team');
      expect(team.department_id).toBe('1');
      expect(team.skills).toBeUndefined();
    });
  });
  
  describe('TeamMember', () => {
    it('should create a valid TeamMember object', () => {
      const teamMember: TeamMember = {
        id: '1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
        user_id: '4',
        team_id: '1',
        role: 'Developer',
        is_leader: false,
        join_date: '2023-01-01',
        skills: ['JavaScript', 'React', 'CSS'],
        availability: 100,
        performance_rating: 4.5
      };
      
      expect(teamMember.id).toBe('1');
      expect(teamMember.user_id).toBe('4');
      expect(teamMember.team_id).toBe('1');
      expect(teamMember.role).toBe('Developer');
      expect(teamMember.is_leader).toBe(false);
      expect(teamMember.skills).toEqual(['JavaScript', 'React', 'CSS']);
    });
    
    it('should allow partial TeamMember object with required fields', () => {
      const teamMember: TeamMember = {
        id: '1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
        user_id: '4',
        team_id: '1',
        role: 'Developer',
        is_leader: false,
        join_date: '2023-01-01'
      };
      
      expect(teamMember.id).toBe('1');
      expect(teamMember.user_id).toBe('4');
      expect(teamMember.team_id).toBe('1');
      expect(teamMember.role).toBe('Developer');
      expect(teamMember.skills).toBeUndefined();
    });
  });
  
  describe('OrganizationSettings', () => {
    it('should create a valid OrganizationSettings object', () => {
      const settings: OrganizationSettings = {
        id: '1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
        organization_id: '1',
        theme: 'light',
        language: 'en',
        timezone: 'America/New_York',
        date_format: 'MM/DD/YYYY',
        notification_preferences: {
          email: true,
          push: false,
          sms: false
        },
        security_settings: {
          two_factor_auth: true,
          password_expiry_days: 90
        },
        feature_flags: {
          beta_features: false,
          advanced_analytics: true
        }
      };
      
      expect(settings.id).toBe('1');
      expect(settings.organization_id).toBe('1');
      expect(settings.theme).toBe('light');
      expect(settings.notification_preferences.email).toBe(true);
      expect(settings.security_settings.two_factor_auth).toBe(true);
      expect(settings.feature_flags.beta_features).toBe(false);
    });
    
    it('should allow partial OrganizationSettings object with required fields', () => {
      const settings: OrganizationSettings = {
        id: '1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
        organization_id: '1',
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        date_format: 'YYYY-MM-DD',
        notification_preferences: {},
        security_settings: {},
        feature_flags: {}
      };
      
      expect(settings.id).toBe('1');
      expect(settings.organization_id).toBe('1');
      expect(settings.theme).toBe('light');
      expect(settings.notification_preferences).toEqual({});
    });
  });
  
  describe('EntityPaginatedResponse', () => {
    it('should create a valid EntityPaginatedResponse object', () => {
      const organizations: Organization[] = [
        {
          id: '1',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          is_active: true,
          name: 'Organization 1'
        },
        {
          id: '2',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          is_active: true,
          name: 'Organization 2'
        }
      ];
      
      const response: EntityPaginatedResponse<Organization> = {
        count: 2,
        next: 'https://api.example.com/organizations?page=2',
        previous: null,
        results: organizations
      };
      
      expect(response.count).toBe(2);
      expect(response.next).toBe('https://api.example.com/organizations?page=2');
      expect(response.previous).toBeNull();
      expect(response.results.length).toBe(2);
      expect(response.results[0].name).toBe('Organization 1');
      expect(response.results[1].name).toBe('Organization 2');
    });
    
    it('should handle empty results', () => {
      const response: EntityPaginatedResponse<Organization> = {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
      
      expect(response.count).toBe(0);
      expect(response.next).toBeNull();
      expect(response.previous).toBeNull();
      expect(response.results.length).toBe(0);
    });
  });
}); 