import React, { useState } from 'react';
import { FormSection } from '@/components/forms/Form';
import { OrganizationSettings } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Select, SelectOption } from '@/components/forms/Select';

interface OrganizationSettingsFormProps {
  settings?: OrganizationSettings;
  organizationId?: string;
  onSubmit: (data: Partial<OrganizationSettings>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const OrganizationSettingsForm: React.FC<OrganizationSettingsFormProps> = ({
  settings,
  organizationId,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
}) => {
  const [formError, setFormError] = useState<string | null>(error);
  const [notificationPreferences, setNotificationPreferences] = useState<Record<string, boolean>>(
    settings?.notification_preferences || {}
  );
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>(
    settings?.feature_flags || {}
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const settingsData: Partial<OrganizationSettings> = {
      organization_id: organizationId || settings?.organization_id,
      theme: formData.get('theme') as string,
      language: formData.get('language') as string,
      timezone: formData.get('timezone') as string,
      date_format: formData.get('date_format') as string,
      notification_preferences: notificationPreferences,
      security_settings: {
        password_policy: formData.get('password_policy') as string,
        session_timeout: parseInt(formData.get('session_timeout') as string, 10),
        two_factor_auth: formData.get('two_factor_auth') === 'true',
      },
      feature_flags: featureFlags,
    };

    try {
      await onSubmit(settingsData);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save organization settings');
    }
  };

  const themeOptions: SelectOption[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System Default' },
  ];

  const languageOptions: SelectOption[] = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
  ];

  const timezoneOptions: SelectOption[] = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  ];

  const dateFormatOptions: SelectOption[] = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  ];

  const passwordPolicyOptions: SelectOption[] = [
    { value: 'basic', label: 'Basic (8+ characters)' },
    { value: 'medium', label: 'Medium (8+ chars, numbers, letters)' },
    { value: 'strong', label: 'Strong (8+ chars, numbers, letters, symbols)' },
  ];

  const handleNotificationToggle = (key: string) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFeatureToggle = (key: string) => {
    setFeatureFlags(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="organization-settings-form" id="organization-settings-form">
      {(formError || error) && (
        <div className="p-4 text-red-600 bg-red-50 rounded-md" data-testid="error">
          {formError || error}
        </div>
      )}

      <FormSection title="Appearance">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
              Theme
            </label>
            <Select
              options={themeOptions}
              onChange={(value) => {
                const select = document.getElementById('theme') as HTMLSelectElement;
                if (select) {
                  select.value = value as string;
                }
              }}
              className="w-full mt-1"
              aria-label="Theme"
            />
            <select
              id="theme"
              name="theme"
              defaultValue={settings?.theme || 'light'}
              className="hidden"
              data-testid="theme-input"
            >
              {themeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Language
            </label>
            <Select
              options={languageOptions}
              onChange={(value) => {
                const select = document.getElementById('language') as HTMLSelectElement;
                if (select) {
                  select.value = value as string;
                }
              }}
              className="w-full mt-1"
              aria-label="Language"
            />
            <select
              id="language"
              name="language"
              defaultValue={settings?.language || 'en'}
              className="hidden"
              data-testid="language-input"
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      <FormSection title="Regional Settings">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <Select
              options={timezoneOptions}
              onChange={(value) => {
                const select = document.getElementById('timezone') as HTMLSelectElement;
                if (select) {
                  select.value = value as string;
                }
              }}
              className="w-full mt-1"
              aria-label="Timezone"
            />
            <select
              id="timezone"
              name="timezone"
              defaultValue={settings?.timezone || 'UTC'}
              className="hidden"
              data-testid="timezone-input"
            >
              {timezoneOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date_format" className="block text-sm font-medium text-gray-700">
              Date Format
            </label>
            <Select
              options={dateFormatOptions}
              onChange={(value) => {
                const select = document.getElementById('date_format') as HTMLSelectElement;
                if (select) {
                  select.value = value as string;
                }
              }}
              className="w-full mt-1"
              aria-label="Date Format"
            />
            <select
              id="date_format"
              name="date_format"
              defaultValue={settings?.date_format || 'MM/DD/YYYY'}
              className="hidden"
              data-testid="date-format-input"
            >
              {dateFormatOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      <FormSection title="Security Settings">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="password_policy" className="block text-sm font-medium text-gray-700">
              Password Policy
            </label>
            <Select
              options={passwordPolicyOptions}
              onChange={(value) => {
                const select = document.getElementById('password_policy') as HTMLSelectElement;
                if (select) {
                  select.value = value as string;
                }
              }}
              className="w-full mt-1"
              aria-label="Password Policy"
            />
            <select
              id="password_policy"
              name="password_policy"
              defaultValue={settings?.security_settings?.password_policy || 'medium'}
              className="hidden"
              data-testid="password-policy-input"
            >
              {passwordPolicyOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="session_timeout" className="block text-sm font-medium text-gray-700">
              Session Timeout (minutes)
            </label>
            <input
              id="session_timeout"
              name="session_timeout"
              type="number"
              min="5"
              max="1440"
              defaultValue={settings?.security_settings?.session_timeout || 30}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
              data-testid="session-timeout-input"
            />
          </div>

          <div>
            <label htmlFor="two_factor_auth" className="block text-sm font-medium text-gray-700">
              Two-Factor Authentication
            </label>
            <select
              id="two_factor_auth"
              name="two_factor_auth"
              defaultValue={settings?.security_settings?.two_factor_auth !== undefined 
                ? String(settings.security_settings.two_factor_auth) 
                : 'false'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
              data-testid="two-factor-auth-input"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
        </div>
      </FormSection>

      <FormSection title="Notification Preferences">
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="email_notifications"
              type="checkbox"
              checked={notificationPreferences['email_notifications'] || false}
              onChange={() => handleNotificationToggle('email_notifications')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              data-testid="email-notifications-input"
            />
            <label htmlFor="email_notifications" className="ml-2 block text-sm text-gray-700">
              Email Notifications
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="push_notifications"
              type="checkbox"
              checked={notificationPreferences['push_notifications'] || false}
              onChange={() => handleNotificationToggle('push_notifications')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              data-testid="push-notifications-input"
            />
            <label htmlFor="push_notifications" className="ml-2 block text-sm text-gray-700">
              Push Notifications
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="task_reminders"
              type="checkbox"
              checked={notificationPreferences['task_reminders'] || false}
              onChange={() => handleNotificationToggle('task_reminders')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              data-testid="task-reminders-input"
            />
            <label htmlFor="task_reminders" className="ml-2 block text-sm text-gray-700">
              Task Reminders
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="project_updates"
              type="checkbox"
              checked={notificationPreferences['project_updates'] || false}
              onChange={() => handleNotificationToggle('project_updates')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              data-testid="project-updates-input"
            />
            <label htmlFor="project_updates" className="ml-2 block text-sm text-gray-700">
              Project Updates
            </label>
          </div>
        </div>
      </FormSection>

      <FormSection title="Feature Flags">
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="dark_mode"
              type="checkbox"
              checked={featureFlags['dark_mode'] || false}
              onChange={() => handleFeatureToggle('dark_mode')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              data-testid="dark-mode-input"
            />
            <label htmlFor="dark_mode" className="ml-2 block text-sm text-gray-700">
              Dark Mode
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="advanced_analytics"
              type="checkbox"
              checked={featureFlags['advanced_analytics'] || false}
              onChange={() => handleFeatureToggle('advanced_analytics')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              data-testid="advanced-analytics-input"
            />
            <label htmlFor="advanced_analytics" className="ml-2 block text-sm text-gray-700">
              Advanced Analytics
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="team_collaboration"
              type="checkbox"
              checked={featureFlags['team_collaboration'] || false}
              onChange={() => handleFeatureToggle('team_collaboration')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              data-testid="team-collaboration-input"
            />
            <label htmlFor="team_collaboration" className="ml-2 block text-sm text-gray-700">
              Team Collaboration
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="document_sharing"
              type="checkbox"
              checked={featureFlags['document_sharing'] || false}
              onChange={() => handleFeatureToggle('document_sharing')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              data-testid="document-sharing-input"
            />
            <label htmlFor="document_sharing" className="ml-2 block text-sm text-gray-700">
              Document Sharing
            </label>
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end space-x-4 mt-6">
        <NavButton
          type="button"
          variant="outline"
          onClick={onCancel}
          href="#"
          disabled={isLoading}
          data-testid="cancel-button"
        >
          Cancel
        </NavButton>
        <Button
          type="submit"
          variant="default"
          disabled={isLoading}
          data-testid="submit-button"
        >
          {settings ? 'Update Settings' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
};

export default OrganizationSettingsForm; 