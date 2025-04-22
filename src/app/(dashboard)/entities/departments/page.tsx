'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DepartmentList } from '@/components/features/entity/departments/DepartmentList';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NavButton } from '@/components/ui/NavButton';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Department } from '@/types/entity';
import { useToast } from '@/components/ui/use-toast';
import { useEntityStore } from '@/store/slices/entitySlice';

export default function DepartmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { deleteDepartment } = useEntityStore();

  const handleViewDetails = (department: Department) => {
    router.push(`/entities/departments/${department.id}`);
  };

  const handleEdit = (department: Department) => {
    router.push(`/entities/departments/${department.id}/edit`);
  };

  const handleDelete = async (department: Department) => {
    if (window.confirm(`Are you sure you want to delete ${department.name}?`)) {
      try {
        await deleteDepartment(department.id);
        toast({
          title: 'Success',
          description: 'Department deleted successfully',
          variant: 'success',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete department',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCreate = () => {
    router.push('/entities/departments/new');
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Entities', href: '/entities' },
    { label: 'Departments' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Departments</CardTitle>
          <NavButton
            href="/entities/departments/new"
            data-testid="create-department-button"
          >
            Create Department
          </NavButton>
        </CardHeader>

        <div className="p-6">
          <DepartmentList
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </Card>
    </div>
  );
} 