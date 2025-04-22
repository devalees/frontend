import React, { useState } from 'react';
import { FormSection } from '@/components/forms/Form';
import { Organization } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';

interface OrganizationFormProps {
  organization?: Organization;
  onSubmit: (data: Partial<Organization>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const OrganizationForm: React.FC<OrganizationFormProps> = ({
  organization,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
}) => {
  const [formError, setFormError] = useState<string | null>(error);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const organizationData: Partial<Organization> = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      website: formData.get('website') as string,
      industry: formData.get('industry') as string,
      size: formData.get('size') as string,
      founded_date: formData.get('founded_date') as string,
      headquarters: formData.get('headquarters') as string,
      contact_email: formData.get('contact_email') as string,
      contact_phone: formData.get('contact_phone') as string,
      logo_url: formData.get('logo_url') as string,
      is_active: formData.get('is_active') === 'true',
    };

    try {
      await onSubmit(organizationData);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save organization');
    }
  };

  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'services', label: 'Services' },
    { value: 'other', label: 'Other' },
  ];

  const sizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1001+', label: '1001+ employees' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="organization-form" id="organization-form">
      {(formError || error) && (
        <div className="p-4 text-red-600 bg-red-50 rounded-md" data-testid="error">
          {formError || error}
        </div>
      )}

      <FormSection title="Basic Information">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Organization Name*
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={organization?.name}
              required
              placeholder="Enter organization name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
              data-testid="name-input"
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={organization?.description}
              placeholder="Describe your organization"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
              rows={3}
              data-testid="description-input"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              id="website"
              name="website"
              type="text"
              defaultValue={organization?.website}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
              data-testid="website-input"
            />
          </div>

          <div>
            <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700">
              Logo URL
            </label>
            <input
              id="logo_url"
              name="logo_url"
              type="text"
              defaultValue={organization?.logo_url}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
              data-testid="logo-url-input"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Organization Details">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
              Industry
            </label>
            <select
              id="industry"
              name="industry"
              defaultValue={organization?.industry}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
              data-testid="industry-input"
            >
              <option value="">Select industry</option>
              {industryOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700">
              Company Size
            </label>
            <select
              id="size"
              name="size"
              defaultValue={organization?.size}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
              data-testid="size-input"
            >
              <option value="">Select company size</option>
              {sizeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="founded_date" className="block text-sm font-medium text-gray-700">
              Founded Date
            </label>
            <input
              id="founded_date"
              name="founded_date"
              type="date"
              defaultValue={organization?.founded_date 
                ? new Date(organization.founded_date).toISOString().split('T')[0] 
                : ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
              data-testid="founded-date-input"
            />
          </div>

          <div>
            <label htmlFor="headquarters" className="block text-sm font-medium text-gray-700">
              Headquarters
            </label>
            <input
              id="headquarters"
              name="headquarters"
              type="text"
              defaultValue={organization?.headquarters}
              placeholder="City, Country"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
              data-testid="headquarters-input"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Contact Information">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
              Contact Email
            </label>
            <input
              id="contact_email"
              name="contact_email"
              type="email"
              defaultValue={organization?.contact_email}
              placeholder="contact@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
              data-testid="contact-email-input"
            />
          </div>

          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
              Contact Phone
            </label>
            <input
              id="contact_phone"
              name="contact_phone"
              type="tel"
              defaultValue={organization?.contact_phone}
              placeholder="+1 (123) 456-7890"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
              data-testid="contact-phone-input"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Status">
        <div>
          <label htmlFor="is_active" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="is_active"
            name="is_active"
            defaultValue={organization?.is_active !== undefined ? String(organization.is_active) : 'true'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
            data-testid="status-input"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </FormSection>

      <div className="flex justify-end space-x-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          data-testid="cancel-button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="default"
          disabled={isLoading}
          data-testid="submit-button"
        >
          {organization ? 'Update Organization' : 'Create Organization'}
        </Button>
      </div>
    </form>
  );
};

export default OrganizationForm; 