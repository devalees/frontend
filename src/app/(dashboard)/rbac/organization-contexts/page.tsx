'use client';

import { useState } from 'react';
import { OrganizationContextList } from '@/components/features/rbac/organization-contexts/OrganizationContextList';
import { OrganizationContextForm } from '@/components/features/rbac/OrganizationContextForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Plus, ChevronRight } from 'lucide-react';
import { ToastContainer, useToast } from '@/components/ui/use-toast';
import { OrganizationContext } from '@/types/rbac';

export default function OrganizationContextPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContext, setSelectedContext] = useState<OrganizationContext | undefined>(undefined);
  const [viewHierarchyContext, setViewHierarchyContext] = useState<OrganizationContext | undefined>(undefined);
  const { toast } = useToast();

  const handleEdit = (context: OrganizationContext) => {
    setSelectedContext(context);
    setIsFormOpen(true);
  };

  const handleDelete = async (context: OrganizationContext) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${context.name}"?`);
    if (confirmDelete) {
      toast({
        title: 'Organization Context Deleted',
        description: `"${context.name}" has been deleted successfully.`,
      });
    }
  };

  const handleActivate = async (context: OrganizationContext) => {
    toast({
      title: 'Organization Context Activated',
      description: `"${context.name}" has been activated successfully.`,
    });
  };

  const handleDeactivate = async (context: OrganizationContext) => {
    toast({
      title: 'Organization Context Deactivated',
      description: `"${context.name}" has been deactivated successfully.`,
    });
  };

  const handleViewHierarchy = (context: OrganizationContext) => {
    setViewHierarchyContext(context);
    toast({
      title: 'Hierarchy View',
      description: `Viewing hierarchy for "${context.name}".`,
    });
  };

  const handleFormSubmit = (data: any) => {
    if (data.id) {
      // Update existing context
      toast({
        title: 'Organization Context Updated',
        description: `"${data.name}" has been updated successfully.`,
      });
    } else {
      // Create new context
      toast({
        title: 'Organization Context Created',
        description: `"${data.name}" has been created successfully.`,
      });
    }
    setIsFormOpen(false);
    setSelectedContext(undefined);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedContext(undefined);
  };

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center mb-4 text-sm text-gray-500">
        <NavButton href="/dashboard" className="hover:text-gray-700">Dashboard</NavButton>
        <ChevronRight className="h-4 w-4 mx-2" />
        <NavButton href="/rbac" className="hover:text-gray-700">RBAC</NavButton>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900 font-medium">Organization Contexts</span>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organization Context Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Organization Context
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Contexts</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationContextList 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            onViewHierarchy={handleViewHierarchy}
          />
        </CardContent>
      </Card>

      {isFormOpen && (
        <OrganizationContextForm
          initialData={selectedContext}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
} 