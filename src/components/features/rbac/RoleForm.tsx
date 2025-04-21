/**
 * RoleForm Component
 * 
 * A form component for adding and editing roles in the RBAC system.
 * Uses the existing Form, Input, and Select components.
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormSection } from '../../forms/Form';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Textarea } from '../../ui/Textarea';
import { useToast } from '../../ui/use-toast';
import { Role } from '../../../types/rbac';
import { useRbac } from '../../../hooks/useRbac';
import { Select, SelectOption } from '../../forms/Select';

const roleFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

export interface RoleFormProps {
  role?: Role;
  onClose: () => void;
}

/**
 * RoleForm component for adding and editing roles
 * 
 * @param role - Optional role to edit. If not provided, a new role will be created.
 * @param onClose - Callback function to be called when the form is cancelled.
 */
export function RoleForm({ role, onClose }: RoleFormProps) {
  const { toast } = useToast();
  const { roles } = useRbac();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
    },
  });

  useEffect(() => {
    if (role) {
      form.reset({
        name: role.name,
        description: role.description,
      });
    }
  }, [role, form]);

  const onSubmit = async (data: RoleFormValues) => {
    try {
      setIsLoading(true);
      const roleData: Partial<Role> = {
        name: data.name,
        description: data.description,
        is_active: true
      };

      if (role) {
        // Update existing role
        await roles.update(role.id, roleData);
      } else {
        // Create new role
        await roles.create(roleData);
      }

      toast({
        title: 'Success',
        description: role ? 'Role updated successfully' : 'Role created successfully',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save role',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a wrapper function that matches the Form component's expected onSubmit type
  const handleFormSubmit = (formData: FormData) => {
    // Convert FormData to RoleFormValues
    const data: RoleFormValues = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    };
    
    // Call the original onSubmit function
    return onSubmit(data);
  };

  return (
    <Form onSubmit={handleFormSubmit}>
      <FormSection title="Role Details">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Enter role name"
              error={!!form.formState.errors.name}
              errorMessage={form.formState.errors.name?.message}
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Enter role description"
              error={!!form.formState.errors.description}
              helperText={form.formState.errors.description?.message}
            />
          </div>
        </div>
      </FormSection>
      
      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : role ? 'Update' : 'Create'}
        </Button>
      </div>
    </Form>
  );
}

export default RoleForm; 