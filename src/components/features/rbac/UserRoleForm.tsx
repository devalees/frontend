/**
 * UserRoleForm Component
 * 
 * Form for assigning roles to users with validation and error handling.
 * Uses existing form components and integrates with the RBAC API.
 */

import React, { useState, useEffect } from 'react';
import { Form, FormSection } from '../../forms/Form';
import { Select, SelectOption } from '../../forms/Select';
import { Button } from '../../ui/Button';
import { useRbac } from '../../../hooks/useRbac';
import { UserRole } from '../../../types/rbac';
import { useUserProfile } from '../../../hooks/useUserProfile';

interface UserRoleFormProps {
  onSubmit: (userRole: Partial<UserRole>) => Promise<void>;
  initialData?: Partial<UserRole>;
  onCancel?: () => void;
  className?: string;
}

export const UserRoleForm: React.FC<UserRoleFormProps> = ({
  onSubmit,
  initialData = {},
  onCancel,
  className = '',
}) => {
  const { roles, userRoles } = useRbac();
  const { user } = useUserProfile();
  
  const [userId, setUserId] = useState<string>(initialData.user_id || '');
  const [roleId, setRoleId] = useState<string>(initialData.role_id || '');
  const [isActive, setIsActive] = useState<boolean>(initialData.is_active !== undefined ? initialData.is_active : true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        await roles.fetch();
      } catch (err) {
        console.error('Error fetching roles:', err);
        setError('Failed to load roles. Please try again.');
      }
    };

    fetchRoles();
  }, [roles]);

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form data
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!roleId) {
        throw new Error('Role ID is required');
      }

      // Check if user role already exists
      const existingUserRole = userRoles.data.find(
        ur => ur.user_id === userId && ur.role_id === roleId
      );

      if (existingUserRole) {
        throw new Error('This user already has this role assigned');
      }

      // Create user role
      const userRoleData: Partial<UserRole> = {
        user_id: userId,
        role_id: roleId,
        is_active: isActive,
      };

      await onSubmit(userRoleData);
      setSuccess(true);
      
      // Reset form if not editing
      if (!initialData.id) {
        setUserId('');
        setRoleId('');
        setIsActive(true);
      }
    } catch (err) {
      console.error('Error submitting user role form:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert roles to select options
  const roleOptions: SelectOption[] = roles.data.map(role => ({
    value: role.id,
    label: role.name,
  }));

  // Mock user options (in a real app, this would come from an API)
  const userOptions: SelectOption[] = [
    { value: '1', label: 'User 1' },
    { value: '2', label: 'User 2' },
    { value: '3', label: 'User 3' },
  ];

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <Form 
        onSubmit={handleSubmit}
        className="space-y-6"
        aria-label="User Role Form"
      >
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md" role="alert">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md" role="alert">
            User role {initialData.id ? 'updated' : 'created'} successfully!
          </div>
        )}

        <FormSection title="User Role Details">
          <div className="space-y-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                User
              </label>
              <Select
                options={userOptions}
                onChange={(value) => setUserId(value as string)}
                aria-label="Select User"
                error={!!error && !userId}
              />
              {error && !userId && (
                <p className="mt-1 text-sm text-red-600">User is required</p>
              )}
            </div>

            <div>
              <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <Select
                options={roleOptions}
                onChange={(value) => setRoleId(value as string)}
                aria-label="Select Role"
                error={!!error && !roleId}
              />
              {error && !roleId && (
                <p className="mt-1 text-sm text-red-600">Role is required</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>
        </FormSection>

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {initialData.id ? 'Update' : 'Create'} User Role
          </Button>
        </div>
      </Form>
    </div>
  );
}; 