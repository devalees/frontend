'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DepartmentForm } from '@/components/features/entity/departments/DepartmentForm';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { useToast } from '@/components/ui/use-toast';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Department } from '@/types/entity';

interface DepartmentEditPageProps {
  params: {
    id: string;
  };
}

const DepartmentEditPage = ({ params }: DepartmentEditPageProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { getDepartment, updateDepartment } = useEntityStore();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/' },
    { label: 'Entities', href: '/entities' },
    { label: 'Departments', href: '/entities/departments' },
    { label: 'Details', href: `/entities/departments/${params.id}` },
    { label: 'Edit' }
  ];

  useEffect(() => {
    const loadDepartment = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDepartment(params.id);
        setDepartment(data);
      } catch (err) {
        setError('Failed to load department data');
        toast({
          title: 'Error',
          description: 'Failed to load department data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadDepartment();
  }, [params.id, getDepartment, toast]);

  const handleSubmit = async (updatedDepartment: Department) => {
    try {
      await updateDepartment(params.id, updatedDepartment);
      toast({
        title: 'Department updated',
        description: 'The department has been successfully updated.',
      });
      router.push(`/entities/departments/${params.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update department. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push(`/entities/departments/${params.id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} className="mb-2" />
          <h1 className="text-2xl font-bold">Edit Department</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div data-testid="loading">Loading department data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} className="mb-2" />
          <h1 className="text-2xl font-bold">Edit Department</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div data-testid="error" className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-2" />
        <h1 className="text-2xl font-bold">Edit Department</h1>
        <p className="text-muted-foreground mt-1">
          Update department information and settings
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {department && (
          <DepartmentForm
            department={department}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default DepartmentEditPage; 