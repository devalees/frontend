/**
 * ResourceForm Component
 * 
 * Form component for creating and editing resources.
 * Uses existing form components and handles validation.
 */

import React from 'react';
import { Form } from '@/components/forms/Form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Resource } from '@/types/rbac';
import { useRbac } from '@/hooks/useRbac';

interface ResourceFormProps {
  resource?: Resource;
  onSubmit: (data: Partial<Resource>) => void;
  onCancel: () => void;
}

export const ResourceForm: React.FC<ResourceFormProps> = ({
  resource,
  onSubmit,
  onCancel,
}) => {
  const { loading, error } = useRbac();

  const validationRules = {
    name: (value: string) => {
      if (!value.trim()) return 'Name is required';
      return undefined;
    },
    type: (value: string) => {
      if (!value.trim()) return 'Type is required';
      return undefined;
    },
  };

  const handleSubmit = async (formData: FormData) => {
    const data = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      description: formData.get('description') as string,
      is_active: formData.has('is_active'),
    };

    if (resource) {
      // If editing, include the resource ID and timestamps
      onSubmit({
        ...resource,
        ...data,
      });
    } else {
      // If creating new resource
      onSubmit(data);
    }
  };

  const resourceTypes = [
    { value: 'module', label: 'Module' },
    { value: 'storage', label: 'Storage' },
    { value: 'service', label: 'Service' },
    { value: 'api', label: 'API' },
  ];

  return (
    <Form
      onSubmit={handleSubmit}
      validationRules={validationRules}
      className="space-y-6"
      aria-label="Resource form"
    >
      {error && (
        <div className="text-red-500 mb-4" role="alert">Error: {error}</div>
      )}

      <div className="space-y-4">
        <div className="form-field">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={resource?.name || ''}
            placeholder="Enter resource name"
            disabled={loading}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={resource?.type || ''}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            disabled={loading}
            required
          >
            <option value="">Select a type</option>
            {resourceTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <Input
            id="description"
            name="description"
            type="text"
            defaultValue={resource?.description || ''}
            placeholder="Enter resource description"
            disabled={loading}
          />
        </div>

        <div className="form-field">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={resource?.is_active ?? true}
              className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              disabled={loading}
            />
            <span className="ml-2">Active</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner data-testid="spinner" className="mr-2" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
      </div>
    </Form>
  );
}; 