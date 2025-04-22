import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { useEntityStore } from '@/store/slices/entitySlice';
import { TeamMember } from '@/types/entity';
import { ValidationError } from '@/lib/api/errors';

interface TeamMemberFormProps {
  teamMember?: TeamMember;
}

interface FormErrors {
  user_id?: string;
  team_id?: string;
  role?: string;
  join_date?: string;
}

export const TeamMemberForm: React.FC<TeamMemberFormProps> = ({ teamMember }) => {
  const router = useRouter();
  const { createTeamMember, updateTeamMember } = useEntityStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    user_id: teamMember?.user_id || '',
    team_id: teamMember?.team_id || '',
    role: teamMember?.role || '',
    is_leader: teamMember?.is_leader || false,
    join_date: teamMember?.join_date || ''
  });

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.user_id) {
      errors.user_id = 'User ID is required';
    }
    if (!formData.team_id) {
      errors.team_id = 'Team is required';
    }
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    if (!formData.join_date) {
      errors.join_date = 'Join Date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      if (teamMember) {
        await updateTeamMember(teamMember.id, {
          ...teamMember,
          ...formData
        });
      } else {
        await createTeamMember(formData);
      }
      router.back();
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message);
        // Handle field-specific validation errors
        const fieldErrors: FormErrors = {};
        Object.entries(err.errors || {}).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            fieldErrors[field as keyof FormErrors] = messages[0];
          }
        });
        setFormErrors(fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for the field being changed
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">
          {teamMember ? 'Edit Team Member' : 'Create Team Member'}
        </h2>
      </CardHeader>
      <form onSubmit={handleSubmit} data-testid="team-member-form" className="p-4 space-y-4">
        <div>
          <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">
            User ID
          </label>
          <Input
            id="user_id"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            error={!!formErrors.user_id}
            errorMessage={formErrors.user_id}
          />
        </div>

        <div>
          <label htmlFor="team_id" className="block text-sm font-medium text-gray-700">
            Team
          </label>
          <Select
            id="team_id"
            name="team_id"
            value={formData.team_id}
            onChange={handleChange}
            error={!!formErrors.team_id}
            options={[
              { value: '', label: 'Select a team' },
              { value: 'team1', label: 'Team 1' },
              { value: 'team2', label: 'Team 2' }
            ]}
          />
          {formErrors.team_id && (
            <p className="mt-1 text-sm text-red-600">{formErrors.team_id}</p>
          )}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <Input
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            error={!!formErrors.role}
            errorMessage={formErrors.role}
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <Checkbox
              id="is_leader"
              name="is_leader"
              checked={formData.is_leader}
              onChange={handleCheckboxChange}
            />
            <span className="text-sm font-medium text-gray-700">Leader</span>
          </label>
        </div>

        <div>
          <label htmlFor="join_date" className="block text-sm font-medium text-gray-700">
            Join Date
          </label>
          <Input
            id="join_date"
            name="join_date"
            type="date"
            value={formData.join_date}
            onChange={handleChange}
            error={!!formErrors.join_date}
            errorMessage={formErrors.join_date}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm" role="alert">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <NavButton
            type="button"
            variant="outline"
            href="#"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </NavButton>
          <Button type="submit" disabled={loading}>
            {teamMember ? 'Update Team Member' : 'Create Team Member'}
          </Button>
        </div>
      </form>
    </Card>
  );
}; 