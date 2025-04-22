'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TeamMemberList } from '@/components/features/entity/team-members/TeamMemberList';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { TeamMember } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { useToast } from '@/components/ui/use-toast';

const TeamMembersPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { deleteTeamMember } = useEntityStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/' },
    { label: 'Entities', href: '/entities' },
    { label: 'Team Members' }
  ];

  const handleViewDetails = (teamMember: TeamMember) => {
    router.push(`/entities/team-members/${teamMember.id}`);
  };

  const handleEdit = (teamMember: TeamMember) => {
    router.push(`/entities/team-members/${teamMember.id}/edit`);
  };

  const handleDelete = async (teamMember: TeamMember) => {
    if (window.confirm(`Are you sure you want to delete this team member?`)) {
      try {
        setIsDeleting(true);
        await deleteTeamMember(teamMember.id);
        toast({
          title: 'Team member deleted',
          description: `Team member has been successfully deleted.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete team member. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCreateNew = () => {
    router.push('/entities/team-members/new');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-2" />
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Team Members</h1>
          <Button 
            onClick={handleCreateNew}
            className="flex items-center gap-2"
            data-testid="create-team-member-button"
          >
            <Plus className="h-4 w-4" />
            New Team Member
          </Button>
        </div>
        <p className="text-muted-foreground mt-1">
          Manage team members and their roles
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <TeamMemberList
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default TeamMembersPage; 