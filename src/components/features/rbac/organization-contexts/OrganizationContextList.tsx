import React, { useEffect, useState } from 'react';
import { useRbac } from '../../../../hooks/useRbac';
import { OrganizationContext } from '../../../../types/rbac';
import { formatDate } from '../../../../utils/dateUtils';

export const OrganizationContextList: React.FC = () => {
  const {
    organizationContexts,
    fetchOrganizationContexts,
    deleteOrganizationContext,
    activateOrganizationContext,
    deactivateOrganizationContext
  } = useRbac();

  const [filteredContexts, setFilteredContexts] = useState<OrganizationContext[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrganizationContexts();
  }, [fetchOrganizationContexts]);

  useEffect(() => {
    if (organizationContexts.data) {
      const filtered = organizationContexts.data.filter(context =>
        context.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        context.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContexts(filtered);
    }
  }, [organizationContexts.data, searchTerm]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this organization context?')) {
      await deleteOrganizationContext(id);
    }
  };

  const handleActivate = async (id: string) => {
    await activateOrganizationContext(id);
  };

  const handleDeactivate = async (id: string) => {
    await deactivateOrganizationContext(id);
  };

  if (organizationContexts.loading) {
    return <div>Loading organization contexts...</div>;
  }

  if (organizationContexts.error) {
    return <div>Error: {organizationContexts.error}</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search organization contexts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <table className="min-w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredContexts.map((context) => (
            <tr key={context.id}>
              <td>{context.name}</td>
              <td>{context.description}</td>
              <td>{context.is_active ? 'Active' : 'Inactive'}</td>
              <td>{formatDate(context.created_at)}</td>
              <td>{formatDate(context.updated_at)}</td>
              <td>
                <button
                  onClick={() => context.is_active ? handleDeactivate(context.id) : handleActivate(context.id)}
                  className="mr-2"
                >
                  {context.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(context.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 