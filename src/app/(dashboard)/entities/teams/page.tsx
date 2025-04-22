'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TeamList } from '@/components/features/entity/teams/TeamList';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { NavButton } from '@/components/ui/NavButton';
import { Plus } from 'lucide-react';
import { Team } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { useToast } from '@/components/ui/use-toast';

const TeamsPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { deleteTeam } = useEntityStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/' },
    { label: 'Entities', href: '/entities' },
    { label: 'Teams' }
  ];

  const handleViewDetails = (team: Team) => {
    router.push(`/entities/teams/${team.id}`);
  };

  const handleEdit = (team: Team) => {
    router.push(`/entities/teams/${team.id}/edit`);
  };

  const handleDelete = async (team: Team) => {
    if (window.confirm(`Are you sure you want to delete ${team.name}?`)) {
      try {
        setIsDeleting(true);
        await deleteTeam(team.id);
        toast({
          title: 'Team deleted',
          description: `${team.name} has been successfully deleted.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete team. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-2" />
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teams</h1>
          <NavButton 
            href="/entities/teams/new"
            className="flex items-center gap-2"
            data-testid="create-team-button"
          >
            <Plus className="h-4 w-4" />
            New Team
          </NavButton>
        </div>
        <p className="text-muted-foreground mt-1">
          Manage teams within departments
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <TeamList
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default TeamsPage; 