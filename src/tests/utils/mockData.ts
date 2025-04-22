import { Organization, Department, Team, TeamMember, OrganizationSettings } from '@/types/entity'

export const mockOrganization: Organization = {
  id: '1',
  name: 'Test Organization',
  description: 'A test organization',
  size: 'MEDIUM',
  industry: 'Technology',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_active: true
}

export const mockDepartment: Department = {
  id: '1',
  name: 'Test Department',
  description: 'A test department',
  organization_id: '1',
  parent_department_id: undefined,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_active: true
}

export const mockTeam: Team = {
  id: '1',
  name: 'Test Team',
  description: 'A test team',
  department_id: '1',
  project_id: undefined,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_active: true
}

export const mockTeamMember: TeamMember = {
  id: '1',
  user_id: '1',
  team_id: '1',
  role: 'Developer',
  is_leader: false,
  join_date: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_active: true
}

export const mockOrganizationSettings: OrganizationSettings = {
  id: '1',
  organization_id: '1',
  theme: 'light',
  language: 'en',
  timezone: 'UTC',
  date_format: 'YYYY-MM-DD',
  notification_preferences: {
    email: true,
    push: false
  },
  security_settings: {
    two_factor_auth: false,
    password_expiry_days: 90
  },
  feature_flags: {
    beta_features: false,
    advanced_analytics: true
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_active: true
} 