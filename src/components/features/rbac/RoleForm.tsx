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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Role } from '../../types/rbac';
import { useRbac } from '../../hooks/useRbac';
import { Select, SelectOption } from '../../components/forms/Select';

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
        await roles.updateRole(role.id, roleData);
      } else {
        // Create new role
        await roles.createRole(roleData);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter role name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter role description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : role ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default RoleForm; 