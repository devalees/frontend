/**
 * User Roles Page Component
 * 
 * Manages user role assignments with a list view and form for adding/editing user roles.
 * Includes breadcrumb navigation and toast notifications for actions.
 */

'use client';

import React, { useState } from 'react';
import { useRbac } from '../../../hooks/useRbac';
import { UserRole } from '../../../types/rbac';
import { UserRoleList } from '../../../components/features/rbac/UserRoleList';
import { UserRoleForm } from '../../../components/features/rbac/UserRoleForm';
import { Button } from '../../../components/ui/Button';
import { Breadcrumb } from '../../../components/ui/Breadcrumb';
import { Toast } from '../../../components/ui/Toast';

export default function UserRolesPage() {
  const { userRoles } = useRbac();
  const [showForm, setShowForm] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | undefined>();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleActivateUserRole = async (userRole: UserRole) => {
    try {
      await userRoles.create({
        ...userRole,
        is_active: true
      });
      setToast({ message: 'User role activated successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to activate user role', type: 'error' });
    }
  };

  const handleDeactivateUserRole = async (userRole: UserRole) => {
    try {
      await userRoles.create({
        ...userRole,
        is_active: false
      });
      setToast({ message: 'User role deactivated successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to deactivate user role', type: 'error' });
    }
  };

  const handleDelegateUserRole = async (userRole: UserRole) => {
    try {
      await userRoles.create({
        ...userRole,
        delegated_by: userRole.user_id
      });
      setToast({ message: 'User role delegated successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to delegate user role', type: 'error' });
    }
  };

  const handleSubmit = async (userRole: Partial<UserRole>) => {
    try {
      await userRoles.create(userRole);
      setShowForm(false);
      setSelectedUserRole(undefined);
      setToast({ message: 'User role saved successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to save user role', type: 'error' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'RBAC', href: '/rbac' },
          { label: 'User Roles', href: '/rbac/user-roles' }
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Roles</h1>
        <Button
          variant="primary"
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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
} 