/**
 * OrganizationContextForm Component
 * 
 * Form for creating and editing organization contexts.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { X } from 'lucide-react';

interface OrganizationContextFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string;
    parent_id: string | null;
    is_active: boolean;
    level: number;
    created_at: string;
    updated_at: string;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const OrganizationContextForm: React.FC<OrganizationContextFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [parentId, setParentId] = useState<string>(initialData?.parent_id || '');
  const [isActive, setIsActive] = useState(initialData?.is_active !== false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Mock parent contexts for the dropdown
  const parentContexts = [
    { id: '1', name: 'Global Context' },
    { id: '2', name: 'North America Region' },
    { id: '3', name: 'Europe Region' },
    { id: '4', name: 'US Division' },
    { id: '5', name: 'UK Division' }
  ].filter(context => context.id !== initialData?.id); // Filter out current context to prevent circular reference

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        id: initialData?.id,
        name,
        description,
        parent_id: parentId || null,
        is_active: isActive,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {initialData ? `Edit Organization Context: ${initialData.name}` : 'Add New Organization Context'}
          </CardTitle>
          <Button
            variant="tertiary"
            size="small"
            onClick={onCancel}
            className="p-1 h-auto"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter organization context name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter organization context description"
                className={errors.description ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">Parent Context (Optional)</Label>
              <Select 
                value={parentId} 
                onValueChange={(value) => setParentId(value)}
              >
                <SelectTrigger id="parent">
                  <SelectValue placeholder="Select a parent context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Root)</SelectItem>
                  {parentContexts.map(context => (
                    <SelectItem key={context.id} value={context.id}>
                      {context.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="is-active" 
                checked={isActive} 
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is-active">Active</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="secondary" 
              onClick={onCancel} 
              type="button"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}; 