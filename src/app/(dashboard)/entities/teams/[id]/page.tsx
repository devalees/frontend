import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TeamDetail } from '@/components/features/entity/teams/TeamDetail';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { deleteTeam } = useEntityStore();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const handleEdit = () => {
    router.push(`/entities/teams/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deleteTeam(id);
      router.push('/entities/teams');
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Entities', href: '/entities' },
          { label: 'Teams', href: '/entities/teams' },
          { label: 'Team Details', href: '#' }
        ]}
      />

      <div className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Team Details</h1>
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

        <TeamDetail id={id} />

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Delete Team</h2>
            <p className="mb-4">Are you sure you want to delete this team?</p>
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
                data-testid="confirm-delete-button"
              >
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
} 