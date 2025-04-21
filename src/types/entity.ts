import { BaseEntity } from './common';

/**
 * Organization interface representing a company or business entity
 */
export interface Organization extends BaseEntity {
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  size?: string;
  founded_date?: string;
  headquarters?: string;
  contact_email?: string;
  contact_phone?: string;
  settings_id?: string;
}

/**
 * Department interface representing a division within an organization
 */
export interface Department extends BaseEntity {
  name: string;
  description?: string;
  organization_id: string;
  parent_department_id?: string;
  manager_id?: string;
  budget?: number;
  location?: string;
  headcount?: number;
}

/**
 * Team interface representing a group within a department
 */
export interface Team extends BaseEntity {
  name: string;
  description?: string;
  department_id: string;
  leader_id?: string;
  project_id?: string;
  size?: number;
  skills?: string[];
}

/**
 * TeamMember interface representing a person assigned to a team
 */
export interface TeamMember extends BaseEntity {
  user_id: string;
  team_id: string;
  role: string;
  is_leader: boolean;
  join_date: string;
  skills?: string[];
  availability?: number;
  performance_rating?: number;
}

/**
 * OrganizationSettings interface representing configuration for an organization
 */
export interface OrganizationSettings extends BaseEntity {
  organization_id: string;
  theme: string;
  language: string;
  timezone: string;
  date_format: string;
  notification_preferences: Record<string, boolean>;
  security_settings: Record<string, any>;
  feature_flags: Record<string, boolean>;
}

/**
 * Paginated response for entity lists
 */
export interface EntityPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
} 