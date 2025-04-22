import React from 'react';
import { OrganizationSettings } from '@/types/entity';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Link } from '@/components/ui/Link';

interface OrganizationSettingsDetailProps {
  settings: OrganizationSettings;
  onEdit: () => void;
  onDelete: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const OrganizationSettingsDetail: React.FC<OrganizationSettingsDetailProps> = ({
  settings,
  onEdit,
  onDelete,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md" data-testid="error">
        {error}
      </div>
    );
  }

  const formatBoolean = (value: boolean | undefined): string => {
    return value ? 'Enabled' : 'Disabled';
  };

  const formatNotificationPreferences = (preferences: Record<string, boolean>): JSX.Element => {
    return (
      <div className="space-y-1">
        {Object.entries(preferences).map(([key, value]) => (
          <div key={key} className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            <span className="text-sm">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          </div>
        ))}
      </div>
    );
  };

  const formatFeatureFlags = (flags: Record<string, boolean>): JSX.Element => {
    return (
      <div className="space-y-1">
        {Object.entries(flags).map(([key, value]) => (
          <div key={key} className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            <span className="text-sm">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden" data-testid="organization-settings-detail">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Organization Settings</h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onEdit}
            data-testid="edit-button"
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            data-testid="delete-button"
          >
            Delete
          </Button>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Theme</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{settings.theme}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Language</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{settings.language}</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Timezone</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{settings.timezone}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Date Format</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{settings.date_format}</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Password Policy</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
              {settings.security_settings?.password_policy || 'Not set'}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Session Timeout</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {settings.security_settings?.session_timeout ? `${settings.security_settings.session_timeout} minutes` : 'Not set'}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Two-Factor Authentication</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatBoolean(settings.security_settings?.two_factor_auth)}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Notification Preferences</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {settings.notification_preferences ? formatNotificationPreferences(settings.notification_preferences) : 'Not set'}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Feature Flags</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {settings.feature_flags ? formatFeatureFlags(settings.feature_flags) : 'Not set'}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {new Date(settings.created_at).toLocaleString()}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {new Date(settings.updated_at).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        <NavButton 
          href={`/entities/organizations/${settings.organization_id}`}
          variant="outline" 
          data-testid="view-organization-button"
        >
          View Organization
        </NavButton>
      </div>
    </div>
  );
};

export default OrganizationSettingsDetail; 