'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DepartmentDetail } from '@/components/features/entity/departments/DepartmentDetail';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { useToast } from '@/components/ui/use-toast';
import { useEntityStore } from '@/store/slices/entitySlice';

interface DepartmentDetailPageProps {
  params: {
    id: string;
  };
}

const DepartmentDetailPage = ({ params }: DepartmentDetailPageProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { deleteDepartment } = useEntityStore();

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/' },
    { label: 'Entities', href: '/entities' },
    { label: 'Departments', href: '/entities/departments' },
    { label: 'Details' }
  ];

  const handleEdit = () => {
    router.push(`/entities/departments/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(params.id);
        toast({
          title: 'Department deleted',
          description: 'The department has been successfully deleted.',
        });
        router.push('/entities/departments');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete department. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-2" />
        <h1 className="text-2xl font-bold">Department Details</h1>
        <p className="text-muted-foreground mt-1">
          View and manage department details, teams, and team members
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <DepartmentDetail
          id={params.id}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default DepartmentDetailPage; 