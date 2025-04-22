'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OrganizationDetail } from '@/components/features/entity/organizations/OrganizationDetail';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { useToast } from '@/components/ui/use-toast';
import { useEntityStore } from '@/store/slices/entitySlice';

interface OrganizationDetailPageProps {
  params: {
    id: string;
  };
}

const OrganizationDetailPage = ({ params }: OrganizationDetailPageProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { deleteOrganization } = useEntityStore();

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/' },
    { label: 'Entities', href: '/entities' },
    { label: 'Organizations', href: '/entities/organizations' },
    { label: 'Details' }
  ];

  const handleEdit = () => {
    router.push(`/entities/organizations/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await deleteOrganization(params.id);
        toast({
          title: 'Organization deleted',
          description: 'The organization has been successfully deleted.',
        });
        router.push('/entities/organizations');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete organization. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-2" />
        <h1 className="text-2xl font-bold">Organization Details</h1>
        <p className="text-muted-foreground mt-1">
          View and manage organization details, departments, and team members
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <OrganizationDetail
          organizationId={params.id}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default OrganizationDetailPage; 