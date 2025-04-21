/**
 * RBAC Type Tests
 * 
 * Tests for the RBAC type definitions
 */
import { describe, it, expect } from '../../tests/utils';
import { 
  Role, 
  Permission, 
  UserRole, 
  Resource, 
  ResourceAccess, 
  OrganizationContext, 
  AuditLog,
  PaginatedResponse
} from '../../types/rbac';

describe('RBAC Types', () => {
  describe('PaginatedResponse', () => {
    it('should create a valid PaginatedResponse object', () => {
      const paginatedResponse: PaginatedResponse<Role> = {
        count: 2,
        next: 'http://api.example.com/roles/?page=2',
        previous: null,
        results: [
          {
            id: '1',
            name: 'Admin',
            description: 'Administrator role',
            is_active: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'User',
            description: 'Regular user role',
            is_active: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          }
        ]
      };
      
      expect(paginatedResponse.count).toBe(2);
      expect(paginatedResponse.next).toBe('http://api.example.com/roles/?page=2');
      expect(paginatedResponse.previous).toBeNull();
      expect(paginatedResponse.results.length).toBe(2);
      expect(paginatedResponse.results[0].name).toBe('Admin');
      expect(paginatedResponse.results[1].name).toBe('User');
    });
  });

  describe('Role', () => {
    it('should create a valid Role object', () => {
      const role: Role = {
        id: '1',
        name: 'Admin',
        description: 'Administrator role',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };
      
      expect(role.id).toBe('1');
      expect(role.name).toBe('Admin');
      expect(role.description).toBe('Administrator role');
      expect(role.is_active).toBe(true);
      expect(role.created_at).toBe('2023-01-01T00:00:00Z');
      expect(role.updated_at).toBe('2023-01-01T00:00:00Z');
    });
    
    it('should allow optional permissions', () => {
      const role: Role = {
        id: '1',
        name: 'Admin',
        description: 'Administrator role',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        permissions: [
          {
            id: '1',
            name: 'Create User',
            codename: 'create_user',
            description: 'Can create users',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          }
        ]
      };
      
      expect(role.permissions).toBeDefined();
      expect(role.permissions?.length).toBe(1);
      expect(role.permissions?.[0].codename).toBe('create_user');
    });
  });

  describe('Permission', () => {
    it('should create a valid Permission object', () => {
      const permission: Permission = {
        id: '1',
        name: 'Create User',
        codename: 'create_user',
        description: 'Can create users',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };
      
      expect(permission.id).toBe('1');
      expect(permission.name).toBe('Create User');
      expect(permission.codename).toBe('create_user');
      expect(permission.description).toBe('Can create users');
      expect(permission.created_at).toBe('2023-01-01T00:00:00Z');
      expect(permission.updated_at).toBe('2023-01-01T00:00:00Z');
    });
  });

  describe('UserRole', () => {
    it('should create a valid UserRole object', () => {
      const userRole: UserRole = {
        id: '1',
        user_id: 'user-1',
        role_id: 'role-1',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };
      
      expect(userRole.id).toBe('1');
      expect(userRole.user_id).toBe('user-1');
      expect(userRole.role_id).toBe('role-1');
      expect(userRole.is_active).toBe(true);
      expect(userRole.created_at).toBe('2023-01-01T00:00:00Z');
      expect(userRole.updated_at).toBe('2023-01-01T00:00:00Z');
    });
    
    it('should allow optional role', () => {
      const userRole: UserRole = {
        id: '1',
        user_id: 'user-1',
        role_id: 'role-1',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        role: {
          id: 'role-1',
          name: 'Admin',
          description: 'Administrator role',
          is_active: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      };
      
      expect(userRole.role).toBeDefined();
      expect(userRole.role?.name).toBe('Admin');
    });
  });

  describe('Resource', () => {
    it('should create a valid Resource object', () => {
      const resource: Resource = {
        id: '1',
        name: 'User Management',
        type: 'module',
        description: 'User management module',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };
      
      expect(resource.id).toBe('1');
      expect(resource.name).toBe('User Management');
      expect(resource.type).toBe('module');
      expect(resource.description).toBe('User management module');
      expect(resource.created_at).toBe('2023-01-01T00:00:00Z');
      expect(resource.updated_at).toBe('2023-01-01T00:00:00Z');
    });
  });

  describe('ResourceAccess', () => {
    it('should create a valid ResourceAccess object', () => {
      const resourceAccess: ResourceAccess = {
        id: '1',
        resource_id: 'resource-1',
        role_id: 'role-1',
        permission_id: 'permission-1',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };
      
      expect(resourceAccess.id).toBe('1');
      expect(resourceAccess.resource_id).toBe('resource-1');
      expect(resourceAccess.role_id).toBe('role-1');
      expect(resourceAccess.permission_id).toBe('permission-1');
      expect(resourceAccess.is_active).toBe(true);
      expect(resourceAccess.created_at).toBe('2023-01-01T00:00:00Z');
      expect(resourceAccess.updated_at).toBe('2023-01-01T00:00:00Z');
    });
    
    it('should allow optional related objects', () => {
      const resourceAccess: ResourceAccess = {
        id: '1',
        resource_id: 'resource-1',
        role_id: 'role-1',
        permission_id: 'permission-1',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        resource: {
          id: 'resource-1',
          name: 'User Management',
          type: 'module',
          description: 'User management module',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        },
        role: {
          id: 'role-1',
          name: 'Admin',
          description: 'Administrator role',
          is_active: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        },
        permission: {
          id: 'permission-1',
          name: 'Create User',
          codename: 'create_user',
          description: 'Can create users',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      };
      
      expect(resourceAccess.resource).toBeDefined();
      expect(resourceAccess.role).toBeDefined();
      expect(resourceAccess.permission).toBeDefined();
      expect(resourceAccess.resource?.name).toBe('User Management');
      expect(resourceAccess.role?.name).toBe('Admin');
      expect(resourceAccess.permission?.codename).toBe('create_user');
    });
  });

  describe('OrganizationContext', () => {
    it('should create a valid OrganizationContext object', () => {
      const orgContext: OrganizationContext = {
        id: '1',
        name: 'Company',
        parent_id: null,
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };
      
      expect(orgContext.id).toBe('1');
      expect(orgContext.name).toBe('Company');
      expect(orgContext.parent_id).toBeNull();
      expect(orgContext.is_active).toBe(true);
      expect(orgContext.created_at).toBe('2023-01-01T00:00:00Z');
      expect(orgContext.updated_at).toBe('2023-01-01T00:00:00Z');
    });
    
    it('should allow optional children', () => {
      const orgContext: OrganizationContext = {
        id: '1',
        name: 'Company',
        parent_id: null,
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        children: [
          {
            id: '2',
            name: 'Department',
            parent_id: '1',
            is_active: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          }
        ]
      };
      
      expect(orgContext.children).toBeDefined();
      expect(orgContext.children?.length).toBe(1);
      expect(orgContext.children?.[0].name).toBe('Department');
    });
  });

  describe('AuditLog', () => {
    it('should create a valid AuditLog object', () => {
      const auditLog: AuditLog = {
        id: '1',
        user_id: 'user-1',
        action: 'create',
        resource_type: 'user',
        resource_id: 'user-2',
        details: { name: 'John Doe', email: 'john@example.com' },
        created_at: '2023-01-01T00:00:00Z'
      };
      
      expect(auditLog.id).toBe('1');
      expect(auditLog.user_id).toBe('user-1');
      expect(auditLog.action).toBe('create');
      expect(auditLog.resource_type).toBe('user');
      expect(auditLog.resource_id).toBe('user-2');
      expect(auditLog.details).toEqual({ name: 'John Doe', email: 'john@example.com' });
      expect(auditLog.created_at).toBe('2023-01-01T00:00:00Z');
    });
  });
}); 