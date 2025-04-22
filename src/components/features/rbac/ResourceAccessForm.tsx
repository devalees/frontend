import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Spinner } from '@/components/ui/Spinner';
import { useRbac } from '@/hooks/useRbac';
import { ResourceAccess, Resource, Role, Permission } from '@/types/rbac';

// Form validation schema
const resourceAccessSchema = z.object({
  resource_id: z.string().min(1, 'Resource is required'),
  role_id: z.string().min(1, 'Role is required'),
  permission_id: z.string().min(1, 'Permission is required'),
});

type FormData = z.infer<typeof resourceAccessSchema>;

interface ResourceAccessFormProps {
  initialData?: Partial<ResourceAccess>;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string;
}

export const ResourceAccessForm: React.FC<ResourceAccessFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
}) => {
  const {
    resources,
    roles,
    permissions,
  } = useRbac();

  const form = useForm<FormData>({
    resolver: zodResolver(resourceAccessSchema),
    defaultValues: {
      resource_id: initialData?.resource_id || '',
      role_id: initialData?.role_id || '',
      permission_id: initialData?.permission_id || '',
    },
  });

  const handleSubmit = form.handleSubmit(async (formData) => {
    try {
      await onSubmit(formData);
      form.reset();
    } catch (error) {
      console.error('Error submitting resource access:', error);
      // Let the parent component handle the error
    }
  });

  const isLoadingForm = resources.loading || roles.loading || permissions.loading;
  const hasError = resources.error || roles.error || permissions.error;
  const errorMessage = resources.error || roles.error || permissions.error || '';

  if (hasError) {
    return (
      <div className="p-4 text-red-500">
        Error: {errorMessage}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {isLoadingForm ? (
        <div className="flex justify-center items-center p-4">
          <Spinner size="large" />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Resource
            </label>
            <Controller
              name="resource_id"
              control={form.control}
              render={({ field }) => (
                <div>
                  <Select
                    options={resources.data?.map((resource: Resource) => ({
                      value: resource.id,
                      label: resource.name,
                    }))}
                    onChange={field.onChange}
                    error={!!form.formState.errors.resource_id}
                    aria-label="Resource"
                  />
                  {form.formState.errors.resource_id && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.formState.errors.resource_id.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <Controller
              name="role_id"
              control={form.control}
              render={({ field }) => (
                <div>
                  <Select
                    options={roles.data?.map((role: Role) => ({
                      value: role.id,
                      label: role.name,
                    }))}
                    onChange={field.onChange}
                    error={!!form.formState.errors.role_id}
                    aria-label="Role"
                  />
                  {form.formState.errors.role_id && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.formState.errors.role_id.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Permission
            </label>
            <Controller
              name="permission_id"
              control={form.control}
              render={({ field }) => (
                <div>
                  <Select
                    options={permissions.data?.map((permission: Permission) => ({
                      value: permission.id,
                      label: permission.name,
                    }))}
                    onChange={field.onChange}
                    error={!!form.formState.errors.permission_id}
                    aria-label="Permission"
                  />
                  {form.formState.errors.permission_id && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.formState.errors.permission_id.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end space-x-2">
            {onCancel && (
              <NavButton
                variant="outline"
                href="#"
                onClick={onCancel}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </NavButton>
            )}
            <Button
              type="submit"
              loading={form.formState.isSubmitting}
              disabled={!form.formState.isDirty || form.formState.isSubmitting}
            >
              {isLoading ? 'Loading...' : initialData ? 'Update' : 'Create'} Resource Access
            </Button>
          </div>
        </>
      )}
    </form>
  );
}; 