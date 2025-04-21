'use client';

import { useState } from 'react';
import { PermissionList } from '@/components/features/rbac/PermissionList';
import { PermissionForm } from '@/components/features/rbac/PermissionForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, ChevronRight } from 'lucide-react';
import { Permission } from '@/types/rbac';
import { useToast, ToastContainer } from '@/components/ui/use-toast';
import { useRbac } from '@/hooks/useRbac';

export default function PermissionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | undefined>(undefined);
  const { toast } = useToast();
  const { permissions } = useRbac();

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsFormOpen(true);
  };

  const handleDelete = async (permission: Permission) => {
    if (window.confirm(`Are you sure you want to delete the permission "${permission.name}"?`)) {
      try {
        await permissions.delete(permission.id);
        toast({
          title: 'Success',
          description: `Permission "${permission.name}" deleted successfully`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete permission',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFormClose = () => {
    setSelectedPermission(undefined);
    setIsFormOpen(false);
  };

  const handleFormSubmit = async (permissionData: Partial<Permission>) => {
    try {
      if (selectedPermission) {
        await permissions.update(selectedPermission.id, permissionData);
        toast({
          title: 'Success',
          description: `Permission "${permissionData.name}" updated successfully`,
        });
      } else {
        await permissions.create(permissionData);
        toast({
          title: 'Success',
          description: `Permission "${permissionData.name}" created successfully`,
        });
      }
      handleFormClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${selectedPermission ? 'update' : 'create'} permission`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center mb-4 text-sm text-gray-500">
        <a href="/dashboard" className="hover:text-gray-700">Dashboard</a>
        <ChevronRight className="h-4 w-4 mx-2" />
        <a href="/rbac" className="hover:text-gray-700">RBAC</a>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900 font-medium">Permissions</span>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Permissions Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Permission
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <PermissionList 
            onEditPermission={handleEdit} 
            onDeletePermission={handleDelete}
          />
        </CardContent>
      </Card>

      {isFormOpen && (
        <PermissionForm
          permission={selectedPermission}
          onSubmit={handleFormSubmit}
          onCancel={handleFormClose}
        />
      )}

      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
} 