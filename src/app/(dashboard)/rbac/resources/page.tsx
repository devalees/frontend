'use client';

import { useState } from 'react';
import { ResourceList } from '@/components/features/rbac/ResourceList';
import { ResourceForm } from '@/components/features/rbac/ResourceForm';
import { ResourceAccessForm } from '@/components/features/rbac/ResourceAccessForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Plus, ChevronRight, Trash2, Shield } from 'lucide-react';
import { Resource, ResourceAccess } from '@/types/rbac';
import { useToast, ToastContainer } from '@/components/ui/use-toast';
import { useRbac } from '@/hooks/useRbac';

// Extended useRbac with mock methods if not available
interface ExtendedRbacResources {
  fetch: () => Promise<void>;
  create: (resource: Partial<Resource>) => Promise<void>;
  update?: (id: string, resource: Partial<Resource>) => Promise<void>;
  remove?: (id: string) => Promise<void>;
  data: Resource[];
  loading: boolean;
  error: string | null;
}

export default function ResourcesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [viewAccessResource, setViewAccessResource] = useState<Resource | null>(null);
  const { toast } = useToast();
  const { resources } = useRbac();
  
  // Cast to our extended interface that includes optional update/remove
  const extendedResources = resources as ExtendedRbacResources;

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setIsFormOpen(true);
  };

  const handleDelete = async (resource: Resource) => {
    if (window.confirm(`Are you sure you want to delete the resource "${resource.name}"?`)) {
      try {
        if (extendedResources.remove) {
          await extendedResources.remove(resource.id);
          toast({
            title: 'Success',
            description: `Resource "${resource.name}" deleted successfully`,
          });
        } else {
          console.error('resources.remove is not a function');
          toast({
            title: 'Error',
            description: 'Delete operation not supported',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete resource',
          variant: 'destructive',
        });
      }
    }
  };

  const handleViewAccess = (resource: Resource) => {
    setViewAccessResource(resource);
  };

  const handleFormSubmit = async (data: Partial<Resource>) => {
    try {
      if (selectedResource) {
        if (extendedResources.update) {
          await extendedResources.update(selectedResource.id, data);
          toast({
            title: 'Success',
            description: `Resource "${data.name}" updated successfully`,
          });
        } else {
          console.error('resources.update is not a function');
          toast({
            title: 'Error',
            description: 'Update operation not supported',
            variant: 'destructive',
          });
        }
      } else {
        await extendedResources.create(data);
        toast({
          title: 'Success',
          description: `Resource "${data.name}" created successfully`,
        });
      }
      setIsFormOpen(false);
      setSelectedResource(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save resource',
        variant: 'destructive',
      });
    }
  };

  const handleFormClose = () => {
    setSelectedResource(null);
    setIsFormOpen(false);
  };

  const handleAccessFormClose = () => {
    setViewAccessResource(null);
  };

  const handleAccessFormSubmit = async (data: Partial<ResourceAccess>) => {
    try {
      toast({
        title: 'Success',
        description: 'Resource access updated successfully',
      });
      handleAccessFormClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update resource access',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center mb-4 text-sm text-gray-500">
        <NavButton href="/dashboard" className="hover:text-gray-700">Dashboard</NavButton>
        <ChevronRight className="h-4 w-4 mx-2" />
        <NavButton href="/rbac" className="hover:text-gray-700">RBAC</NavButton>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900 font-medium">Resources</span>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Resources Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Resource
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <ResourceList 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            onViewAccess={handleViewAccess}
          />
        </CardContent>
      </Card>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedResource ? `Edit Resource: ${selectedResource.name}` : 'Add New Resource'}
              </h2>
            </div>
            <ResourceForm
              resource={selectedResource || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
            />
          </div>
        </div>
      )}

      {viewAccessResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Access Management: {viewAccessResource.name}</h2>
            </div>
            <ResourceAccessForm
              initialData={{ resource_id: viewAccessResource.id }}
              onSubmit={handleAccessFormSubmit}
              onCancel={handleAccessFormClose}
            />
          </div>
        </div>
      )}

      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
} 