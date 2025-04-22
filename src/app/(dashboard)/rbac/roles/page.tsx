'use client';

import React, { useState } from 'react';
import { RoleList } from '@/components/features/rbac/RoleList';
import { RoleForm } from '@/components/features/rbac/RoleForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Plus, ChevronRight, Trash2, Shield } from 'lucide-react';
import { Role } from '@/types/rbac';
import { useToast, ToastContainer } from '@/components/ui/use-toast';
import { useRbac } from '@/hooks/useRbac';

export default function RolesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
  const [viewPermissionsRole, setViewPermissionsRole] = useState<Role | undefined>(undefined);
  const { toast } = useToast();
  const { roles } = useRbac();

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      try {
        await roles.remove(role.id);
        toast({
          title: 'Success',
          description: `Role "${role.name}" deleted successfully`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete role',
          variant: 'destructive',
        });
      }
    }
  };

  const handleViewPermissions = (role: Role) => {
    setViewPermissionsRole(role);
    // In a real implementation, this would open a modal or navigate to a permissions page
    toast({
      title: 'Viewing Permissions',
      description: `Viewing permissions for role "${role.name}"`,
    });
  };

  const handleFormClose = () => {
    setSelectedRole(undefined);
    setIsFormOpen(false);
  };

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center mb-4 text-sm text-gray-500">
        <NavButton href="/dashboard" className="hover:text-gray-700">Dashboard</NavButton>
        <ChevronRight className="h-4 w-4 mx-2" />
        <NavButton href="/rbac" className="hover:text-gray-700">RBAC</NavButton>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900 font-medium">Roles</span>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Roles Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleList 
            onEditRole={handleEdit} 
            onDeleteRole={handleDelete}
            onViewPermissions={handleViewPermissions}
          />
        </CardContent>
      </Card>

      {isFormOpen && (
        <RoleForm
          role={selectedRole}
          onClose={handleFormClose}
        />
      )}

      {/* This would be replaced with a proper modal in a real implementation */}
      {viewPermissionsRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Permissions for {viewPermissionsRole.name}</h2>
              <Button 
                variant="tertiary" 
                onClick={() => setViewPermissionsRole(undefined)}
              >
                Close
              </Button>
            </div>
            <p className="mb-4">This is a placeholder for the permissions view. In a real implementation, this would show the permissions assigned to this role.</p>
            <div className="flex justify-end">
              <Button onClick={() => setViewPermissionsRole(undefined)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
} 