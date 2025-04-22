'use client';

import { useState, useEffect } from 'react';
import { ResourceAccessList } from '@/components/features/rbac/ResourceAccessList';
import { ResourceAccessForm } from '@/components/features/rbac/ResourceAccessForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Plus, ChevronRight } from 'lucide-react';
import { ResourceAccess } from '@/types/rbac';
import { useToast, ToastContainer } from '@/components/ui/use-toast';
import { useRbac } from '@/hooks/useRbac';

export default function ResourceAccessPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<ResourceAccess | null>(null);
  const { toast } = useToast();
  const { 
    resourceAccess,
    createResourceAccess,
    updateResourceAccess,
    deleteResourceAccess,
    activateResourceAccess,
    deactivateResourceAccess,
    fetchResourceAccesses
  } = useRbac();

  useEffect(() => {
    fetchResourceAccesses();
  }, [fetchResourceAccesses]);

  const handleEdit = (access: ResourceAccess) => {
    setSelectedAccess(access);
    setIsFormOpen(true);
  };

  const handleDelete = async (access: ResourceAccess) => {
    try {
      await deleteResourceAccess(access.id);
      toast({
        title: 'Success',
        description: 'Resource access deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete resource access',
        variant: 'destructive',
      });
    }
  };

  const handleActivate = async (access: ResourceAccess) => {
    try {
      await activateResourceAccess(access.id);
      toast({
        title: 'Success',
        description: 'Resource access activated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate resource access',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivate = async (access: ResourceAccess) => {
    try {
      await deactivateResourceAccess(access.id);
      toast({
        title: 'Success',
        description: 'Resource access deactivated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deactivate resource access',
        variant: 'destructive',
      });
    }
  };

  const handleFormSubmit = async (data: Partial<ResourceAccess>) => {
    try {
      if (selectedAccess) {
        await updateResourceAccess(selectedAccess.id, data);
        toast({
          title: 'Success',
          description: 'Resource access updated successfully',
        });
      } else {
        await createResourceAccess(data);
        toast({
          title: 'Success',
          description: 'Resource access created successfully',
        });
      }
      setIsFormOpen(false);
      setSelectedAccess(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save resource access',
        variant: 'destructive',
      });
    }
  };

  const handleFormClose = () => {
    setSelectedAccess(null);
    setIsFormOpen(false);
  };

  const handleSearch = (query: string) => {
    // Handle search if needed
  };

  const handlePageChange = (page: number) => {
    // Handle page change if needed
  };

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center mb-4 text-sm text-gray-500">
        <NavButton href="/dashboard" className="hover:text-gray-700">Dashboard</NavButton>
        <ChevronRight className="h-4 w-4 mx-2" />
        <NavButton href="/rbac" className="hover:text-gray-700">RBAC</NavButton>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900 font-medium">Resource Access</span>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Resource Access Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Resource Access
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resource Access</CardTitle>
        </CardHeader>
        <CardContent>
          <ResourceAccessList 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
          />
        </CardContent>
      </Card>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedAccess ? 'Edit Resource Access' : 'Add Resource Access'}
              </h2>
            </div>
            <ResourceAccessForm
              initialData={selectedAccess || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
            />
          </div>
        </div>
      )}

      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
} 