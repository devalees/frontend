/**
 * PermissionForm Component
 * 
 * Form for adding and editing permissions with validation and error handling.
 */

import React, { useState, useEffect } from 'react';
import { useRbac } from '../../../hooks/useRbac';
import { Permission } from '../../../types/rbac';
import { Form, FormSection } from '../../forms/Form';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';

interface PermissionFormProps {
  permission?: Permission;
  onSubmit: (permission: Partial<Permission>) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export const PermissionForm: React.FC<PermissionFormProps> = ({
  permission,
  onSubmit,
  onCancel,
  className = '',
}) => {
  const { permissions } = useRbac();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Permission>>({
    name: '',
    description: '',
    is_active: true,
    ...(permission || {})
  });

  // Update form data when permission prop changes
  useEffect(() => {
    if (permission) {
      setFormData({
        ...formData,
        name: permission.name,
        description: permission.description,
        is_active: permission.is_active,
      });
    }
  }, [permission]);

  // Handle form submission
  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert FormData to Permission object
      const permissionData: Partial<Permission> = {
        name: data.get('name') as string,
        description: data.get('description') as string,
        is_active: data.get('is_active') === 'true',
      };

      // If editing, include the ID
      if (permission?.id) {
        permissionData.id = permission.id;
      }

      await onSubmit(permissionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save permission');
      console.error('Error saving permission:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation rules
  const validationRules = {
    name: (value: string) => {
      if (!value.trim()) return 'Name is required';
      if (value.length < 3) return 'Name must be at least 3 characters';
      return undefined;
    },
    description: (value: string) => {
      if (!value.trim()) return 'Description is required';
      if (value.length < 10) return 'Description must be at least 10 characters';
      return undefined;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-xl font-semibold">
        {permission ? 'Edit Permission' : 'Create Permission'}
      </h2>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md" role="alert">
          {error}
        </div>
      )}

      <Form 
        onSubmit={handleSubmit} 
        validationRules={validationRules}
        aria-label="Permission form"
      >
        <FormSection title="Permission Details">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter permission name"
                required
                aria-label="Permission name"
              />
              <p className="mt-1 text-sm text-gray-500">
                A unique identifier for this permission (e.g., "view_users", "edit_projects")
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter permission description"
                required
                aria-label="Permission description"
              />
              <p className="mt-1 text-sm text-gray-500">
                A clear description of what this permission allows
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>
        </FormSection>

        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            variant="tertiary" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant="default"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : permission ? 'Update Permission' : 'Create Permission'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default PermissionForm; 