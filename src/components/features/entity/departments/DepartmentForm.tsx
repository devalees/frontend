import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Department } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import FormField from '@/components/ui/FormField';

// Form validation schema
const departmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  organization_id: z.string().min(1, 'Organization is required'),
  parent_department_id: z.string().optional(),
  manager_id: z.string().optional(),
  budget: z.number().optional(),
  location: z.string().optional(),
  headcount: z.number().optional(),
  is_active: z.boolean().optional()
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  department?: Department;
  onSubmit?: (department: Department) => void;
  onCancel?: () => void;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
  department,
  onSubmit,
  onCancel
}) => {
  const {
    organizations,
    departments,
    loading,
    error: storeError,
    fetchOrganizations,
    fetchDepartments,
    createDepartment,
    updateDepartment
  } = useEntityStore();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name || '',
      description: department?.description || '',
      organization_id: department?.organization_id || '',
      parent_department_id: department?.parent_department_id || '',
      manager_id: department?.manager_id || '',
      budget: department?.budget || undefined,
      location: department?.location || '',
      headcount: department?.headcount || undefined,
      is_active: department?.is_active ?? true
    }
  });

  useEffect(() => {
    fetchOrganizations();
    fetchDepartments();
  }, [fetchOrganizations, fetchDepartments]);

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        description: department.description,
        organization_id: department.organization_id,
        parent_department_id: department.parent_department_id || '',
        manager_id: department.manager_id || '',
        budget: department.budget,
        location: department.location,
        headcount: department.headcount,
        is_active: department.is_active
      });
    }
  }, [department, reset]);

  const onSubmitForm = async (data: DepartmentFormData) => {
    try {
      setSubmitError(null);
      let result;
      if (department?.id) {
        result = await updateDepartment(department.id, data);
      } else {
        result = await createDepartment(data);
      }
      if (result) {
        onSubmit?.(result);
      }
    } catch (error) {
      console.error('Failed to save department:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create department');
    }
  };

  if (loading) {
    return <div data-testid="loading">Loading...</div>;
  }

  if (storeError) {
    return <div data-testid="error">{storeError}</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {submitError && (
        <div 
          className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md" 
          role="alert"
          data-testid="error-message"
        >
          {submitError}
        </div>
      )}
      
      <FormField
        label="Name"
        error={errors.name?.message}
        required
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Enter department name"
              data-testid="name-input"
            />
          )}
        />
      </FormField>

      <FormField
        label="Description"
        error={errors.description?.message}
      >
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Enter department description"
              data-testid="description-input"
            />
          )}
        />
      </FormField>

      <FormField
        label="Organization"
        error={errors.organization_id?.message}
        required
      >
        <Controller
          name="organization_id"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={organizations.map(org => ({
                value: org.id,
                label: org.name
              }))}
              placeholder="Select organization"
              data-testid="organization-select"
            />
          )}
        />
      </FormField>

      <FormField
        label="Parent Department"
        error={errors.parent_department_id?.message}
      >
        <Controller
          name="parent_department_id"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={departments
                .filter(dept => dept.id !== department?.id)
                .map(dept => ({
                  value: dept.id,
                  label: dept.name
                }))}
              placeholder="Select parent department"
              data-testid="parent-department-select"
            />
          )}
        />
      </FormField>

      <FormField
        label="Manager"
        error={errors.manager_id?.message}
      >
        <Controller
          name="manager_id"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Enter manager ID"
              data-testid="manager-input"
            />
          )}
        />
      </FormField>

      <FormField
        label="Budget"
        error={errors.budget?.message}
      >
        <Controller
          name="budget"
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <Input
              {...field}
              type="number"
              value={value || ''}
              onChange={e => onChange(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Enter budget"
              data-testid="budget-input"
            />
          )}
        />
      </FormField>

      <FormField
        label="Location"
        error={errors.location?.message}
      >
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Enter location"
              data-testid="location-input"
            />
          )}
        />
      </FormField>

      <FormField
        label="Headcount"
        error={errors.headcount?.message}
      >
        <Controller
          name="headcount"
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <Input
              {...field}
              type="number"
              value={value || ''}
              onChange={e => onChange(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Enter headcount"
              data-testid="headcount-input"
            />
          )}
        />
      </FormField>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            data-testid="cancel-button"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          data-testid="submit-button"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default DepartmentForm; 