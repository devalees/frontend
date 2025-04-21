import React, { useEffect, useState } from 'react';
import { useRbac } from '../../../../hooks/useRbac';
import { OrganizationContext } from '../../../../types/rbac';

interface OrganizationContextFormProps {
  context?: OrganizationContext;
  onSubmit: () => void;
  onCancel: () => void;
}

export const OrganizationContextForm: React.FC<OrganizationContextFormProps> = ({
  context,
  onSubmit,
  onCancel
}) => {
  const {
    createOrganizationContext,
    updateOrganizationContext,
    organizationContexts
  } = useRbac();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: ''
  });

  useEffect(() => {
    if (context) {
      setFormData({
        name: context.name,
        description: context.description || '',
        parent_id: context.parent_id || ''
      });
    }
  }, [context]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (context) {
        await updateOrganizationContext(context.id, formData);
      } else {
        await createOrganizationContext(formData);
      }
      onSubmit();
    } catch (error) {
      console.error('Error submitting organization context:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700">
          Parent Context
        </label>
        <select
          id="parent_id"
          name="parent_id"
          value={formData.parent_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">None</option>
          {organizationContexts.data?.map((ctx) => (
            ctx.id !== context?.id && (
              <option key={ctx.id} value={ctx.id}>
                {ctx.name}
              </option>
            )
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {context ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}; 