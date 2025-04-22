'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrganizationList } from '@/components/features/entity/organizations/OrganizationList';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { NavButton } from '@/components/ui/NavButton';
import { Plus } from 'lucide-react';
import { Organization } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { useToast } from '@/components/ui/use-toast';

const OrganizationsPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { deleteOrganization } = useEntityStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/' },
    { label: 'Entities', href: '/entities' },
    { label: 'Organizations' }
  ];

  const handleViewDetails = (organization: Organization) => {
    router.push(`/entities/organizations/${organization.id}`);
  };

  const handleEdit = (organization: Organization) => {
    router.push(`/entities/organizations/${organization.id}/edit`);
  };

  const handleDelete = async (organization: Organization) => {
    if (window.confirm(`Are you sure you want to delete ${organization.name}?`)) {
      try {
        setIsDeleting(true);
        await deleteOrganization(organization.id);
        toast({
          title: 'Organization deleted',
          description: `${organization.name} has been successfully deleted.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete organization. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-2" />
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Organizations</h1>
          <NavButton 
            href="/entities/organizations/new"
            className="flex items-center gap-2"
            data-testid="create-organization-button"
          >
            <Plus className="h-4 w-4" />
            New Organization
          </NavButton>
        </div>
        <p className="text-muted-foreground mt-1">
          Manage your organizations, departments, and teams
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <OrganizationList
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default OrganizationsPage; 