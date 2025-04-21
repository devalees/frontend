/**
 * RoleForm Component
 * 
 * A form component for adding and editing roles in the RBAC system.
 * Uses the existing Form, Input, and Select components.
 */

import React, { useState, useEffect } from 'react';
import { Role } from '../../types/rbac';
import { useRbac } from '../../hooks/useRbac';
import Form, { FormSection } from '../../components/forms/Form';
import { Input } from '../../components/ui/Input';
import { Select, SelectOption } from '../../components/forms/Select';

interface RoleFormProps {
  role?: Role;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * RoleForm component for adding and editing roles
 * 
 * @param role - Optional role to edit. If not provided, a new role will be created.
 * @param onSuccess - Callback function to be called when the form is successfully submitted.
 * @param onCancel - Callback function to be called when the form is cancelled.
 */
export const RoleForm: React.FC<RoleFormProps> = ({ 
  role, 
  onSuccess, 
  onCancel 
}) => {
  const { roles } = useRbac();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Role>>({
    name: '',
    description: '',
    is_active: true
  });

  // Update form data when role prop changes
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        is_active: role.is_active
      });
    }
  }, [role]);

  // Validation rules for form fields
  const validationRules = {
    name: (value: string) => {
      if (!value.trim()) return 'Role name is required';
      if (value.length < 3) return 'Role name must be at least 3 characters';
      if (value.length > 50) return 'Role name must be less than 50 characters';
      return undefined;
    },
    description: (value: string) => {
      if (!value.trim()) return 'Description is required';
      if (value.length > 200) return 'Description must be less than 200 characters';
      return undefined;
    }
  };

  // Handle form submission
  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const roleData: Partial<Role> = {
        name: data.get('name') as string,
        description: data.get('description') as string,
        is_active: data.get('is_active') === 'true'
      };

      if (role) {
        // Update existing role
        await roles.updateRole(role.id, roleData);
      } else {
        // Create new role
        await roles.createRole(roleData);
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error submitting role form:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving the role');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {role ? 'Edit Role' : 'Create New Role'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md" role="alert">
          {error}
        </div>
      )}

      <Form 
        onSubmit={handleSubmit} 
        validationRules={validationRules}
        aria-label={role ? 'Edit role form' : 'Create role form'}
      >
        <FormSection title="Role Details">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Role Name
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                defaultValue={formData.name}
                placeholder="Enter role name"
                required
                aria-label="Role name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Input
                type="text"
                id="description"
                name="description"
                defaultValue={formData.description}
                placeholder="Enter role description"
                required
                aria-label="Role description"
              />
            </div>

            <div>
              <label htmlFor="is_active" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <Select
                options={[
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' }
                ]}
                onChange={(value) => {
                  const input = document.createElement('input');
                  input.type = 'hidden';
                  input.name = 'is_active';
                  input.value = value as string;
                  document.getElementById('is_active')?.appendChild(input);
                }}
                aria-label="Role status"
              />
              <div id="is_active" className="hidden"></div>
            </div>
          </div>
        </FormSection>

        <div className="mt-6 flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default RoleForm; 