'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TeamMemberForm } from '@/components/features/entity/team-members/TeamMemberForm';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useToast } from '@/components/ui/use-toast';
import { TeamMember } from '@/types/entity';

export default function TeamMemberEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { getTeamMember } = useEntityStore();
  const { toast } = useToast();
  const [teamMember, setTeamMember] = useState<TeamMember | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeamMember = async () => {
      try {
        setLoading(true);
        const data = await getTeamMember(id);
        setTeamMember(data);
      } catch (err) {
        console.error('Failed to load team member:', err);
        setError('Failed to load team member. Please try again.');
        toast({
          title: 'Error',
          description: 'Failed to load team member. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadTeamMember();
  }, [id, getTeamMember, toast]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Entities', href: '/entities' },
            { label: 'Team Members', href: '/entities/team-members' },
            { label: 'Edit Team Member', href: '#' }
          ]}
        />
        <div className="mt-6">
          <p>Loading team member data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Entities', href: '/entities' },
            { label: 'Team Members', href: '/entities/team-members' },
            { label: 'Edit Team Member', href: '#' }
          ]}
        />
        <div className="mt-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Entities', href: '/entities' },
          { label: 'Team Members', href: '/entities/team-members' },
          { label: 'Edit Team Member', href: '#' }
        ]}
      />

      <div className="mt-6">
        <h1 className="text-2xl font-bold mb-6">Edit Team Member</h1>
        {teamMember && <TeamMemberForm teamMember={teamMember} />}
      </div>
    </div>
  );
} 