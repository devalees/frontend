'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TeamForm } from '@/components/features/entity/teams/TeamForm';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useTeam } from '@/hooks/useEntity';
import { Team } from '@/types/entity';
import { useToast } from '@/components/ui/use-toast';

export default function TeamEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const { getTeamById, updateTeam, loading } = useTeam();
  const [team, setTeam] = useState<Team | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const teamData = getTeamById(id);
        if (teamData) {
          setTeam(teamData);
        } else {
          toast({
            title: 'Error',
            description: 'Team not found',
            variant: 'destructive',
          });
          router.push('/entities/teams');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch team details',
          variant: 'destructive',
        });
        router.push('/entities/teams');
      }
    };

    fetchTeam();
  }, [id, getTeamById, router, toast]);

  const handleSubmit = async (updatedTeam: Partial<Team>) => {
    try {
      setIsSubmitting(true);
      await updateTeam(id, updatedTeam);
      toast({
        title: 'Success',
        description: 'Team updated successfully',
      });
      router.push(`/entities/teams/${id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update team',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/entities/teams/${id}`);
  };

  if (loading || !team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Entities', href: '/entities' },
            { label: 'Teams', href: '/entities/teams' },
            { label: 'Edit Team', href: '#' }
          ]}
        />
        <div className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Team</h1>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p>Loading team details...</p>
          </div>
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
          { label: 'Teams', href: '/entities/teams' },
          { label: team.name, href: `/entities/teams/${id}` },
          { label: 'Edit', href: '#' }
        ]}
      />

      <div className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Team</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <TeamForm
            team={team}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
} 