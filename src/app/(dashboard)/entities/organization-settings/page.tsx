'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEntityStore } from '@/store/slices/entitySlice';
import { OrganizationSettingsForm } from '@/components/features/entity/organization-settings/OrganizationSettingsForm';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useToast } from '@/components/ui/use-toast';
import { OrganizationSettings } from '@/types/entity';

const OrganizationSettingsPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const {
    getOrganizationSettings,
    updateOrganizationSettings,
    organizationSettings,
    isLoading,
    error,
  } = useEntityStore();

  useEffect(() => {
    getOrganizationSettings();
  }, [getOrganizationSettings]);

  const handleSubmit = async (data: Partial<OrganizationSettings>) => {
    try {
      await updateOrganizationSettings(data);
      toast({
        title: 'Success',
        description: 'Organization settings updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Organization Settings', href: '/entities/organization-settings' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Breadcrumbs items={breadcrumbItems} data-testid="breadcrumbs" />
        <h1 className="text-2xl font-bold mt-4">Organization Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <OrganizationSettingsForm
          settings={organizationSettings}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default OrganizationSettingsPage; 