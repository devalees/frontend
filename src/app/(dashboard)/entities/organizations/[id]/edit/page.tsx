'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrganizationForm } from '@/components/features/entity/organizations/OrganizationForm';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { useToast } from '@/components/ui/use-toast';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Organization } from '@/types/entity';

interface OrganizationEditPageProps {
  params: {
    id: string;
  };
}

const OrganizationEditPage = ({ params }: OrganizationEditPageProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { getOrganization, updateOrganization } = useEntityStore();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/' },
    { label: 'Entities', href: '/entities' },
    { label: 'Organizations', href: '/entities/organizations' },
    { label: 'Details', href: `/entities/organizations/${params.id}` },
    { label: 'Edit' }
  ];

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setIsLoading(true);
        const data = await getOrganization(params.id);
        setOrganization(data);
        setError(null);
      } catch (err) {
        setError('Failed to load organization details');
        toast({
          title: 'Error',
          description: 'Failed to load organization details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, [params.id, getOrganization, toast]);

  const handleSubmit = async (data: Partial<Organization>) => {
    try {
      setIsLoading(true);
      await updateOrganization(params.id, data);
      toast({
        title: 'Organization updated',
        description: 'The organization has been successfully updated.',
      });
      router.push(`/entities/organizations/${params.id}`);
    } catch (err) {
      setError('Failed to update organization');
      toast({
        title: 'Error',
        description: 'Failed to update organization. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/entities/organizations/${params.id}`);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-2" />
        <h1 className="text-2xl font-bold">Edit Organization</h1>
        <p className="text-muted-foreground mt-1">
          Update organization details and settings
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {isLoading && !organization ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        ) : (
          <OrganizationForm
            organization={organization || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

export default OrganizationEditPage; 