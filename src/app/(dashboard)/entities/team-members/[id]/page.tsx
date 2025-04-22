'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TeamMemberDetail } from '@/components/features/entity/team-members/TeamMemberDetail';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/use-toast';

export default function TeamMemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { deleteTeamMember } = useEntityStore();
  const { toast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleEdit = () => {
    router.push(`/entities/team-members/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTeamMember(id);
      toast({
        title: 'Team member deleted',
        description: 'Team member has been successfully deleted.',
      });
      router.push('/entities/team-members');
    } catch (error) {
      console.error('Failed to delete team member:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete team member. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Entities', href: '/entities' },
          { label: 'Team Members', href: '/entities/team-members' },
          { label: 'Team Member Details', href: '#' }
        ]}
      />

      <div className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Team Member Details</h1>
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={handleEdit}
              data-testid="edit-button"
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
              data-testid="delete-button"
            >
              Delete
            </Button>
          </div>
        </div>

        <TeamMemberDetail id={id} />

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Delete Team Member</h2>
            <p className="mb-4">Are you sure you want to delete this team member?</p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                data-testid="confirm-delete-button"
              >
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
} 