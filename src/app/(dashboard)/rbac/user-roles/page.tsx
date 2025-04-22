/**
 * User Roles Page Component
 * 
 * Manages user role assignments with a list view and form for adding/editing user roles.
 * Includes breadcrumb navigation and toast notifications for actions.
 */

'use client';

import React, { useState } from 'react';
import { useRbac } from '@/hooks/useRbac';
import { UserRole } from '@/types/rbac';
import { UserRoleList } from '@/components/features/rbac/UserRoleList';
import { UserRoleForm } from '@/components/features/rbac/UserRoleForm';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useToast } from '@/components/ui/use-toast';

export default function UserRolesPage() {
  const { userRoles } = useRbac();
  const [showForm, setShowForm] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | undefined>();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { toast: showToast } = useToast();

  const handleActivateUserRole = async (userRole: UserRole) => {
    try {
      await userRoles.create({
        ...userRole,
        is_active: true
      });
      showToast({
        title: 'Success',
        description: 'User role activated successfully'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to activate user role',
        variant: 'destructive'
      });
    }
  };

  const handleDeactivateUserRole = async (userRole: UserRole) => {
    try {
      await userRoles.create({
        ...userRole,
        is_active: false
      });
      showToast({
        title: 'Success',
        description: 'User role deactivated successfully'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to deactivate user role',
        variant: 'destructive'
      });
    }
  };

  const handleDelegateUserRole = async (userRole: UserRole) => {
    try {
      await userRoles.create({
        ...userRole,
        delegated_by: userRole.user_id
      });
      showToast({
        title: 'Success',
        description: 'User role delegated successfully'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to delegate user role',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (userRole: Partial<UserRole>) => {
    try {
      await userRoles.create(userRole);
      setShowForm(false);
      setSelectedUserRole(undefined);
      showToast({
        title: 'Success',
        description: 'User role saved successfully'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to save user role',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'RBAC', href: '/rbac' },
          { label: 'User Roles', href: '/rbac/user-roles' }
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Roles</h1>
        <Button
          variant="default"
          onClick={() => {
            setSelectedUserRole(undefined);
            setShowForm(true);
          }}
        >
          Assign Role
        </Button>
      </div>

      <UserRoleList
        onActivateUserRole={handleActivateUserRole}
        onDeactivateUserRole={handleDeactivateUserRole}
        onDelegateUserRole={handleDelegateUserRole}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {selectedUserRole ? 'Edit User Role' : 'Assign New Role'}
            </h2>
            <UserRoleForm
              onSubmit={handleSubmit}
              initialData={selectedUserRole}
              onCancel={() => {
                setShowForm(false);
                setSelectedUserRole(undefined);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 