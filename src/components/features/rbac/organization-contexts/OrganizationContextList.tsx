import React, { useEffect, useState } from 'react';
import { useRbac } from '../../../../hooks/useRbac';
import { OrganizationContext } from '../../../../types/rbac';
import { formatDate } from '../../../../utils/dateUtils';

interface OrganizationContextListProps {
  onEdit?: (context: OrganizationContext) => void;
  onDelete?: (context: OrganizationContext) => void;
  onActivate?: (context: OrganizationContext) => void;
  onDeactivate?: (context: OrganizationContext) => void;
  onViewHierarchy?: (context: OrganizationContext) => void;
}

export const OrganizationContextList: React.FC<OrganizationContextListProps> = ({
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onViewHierarchy
}) => {
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
    if (organizationContexts?.data) {
      console.log('Filtering organization contexts with searchTerm:', searchTerm);
      const filtered = organizationContexts.data.filter(context =>
        context.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        context.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContexts(filtered);
    }
  }, [organizationContexts?.data, searchTerm]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this organization context?')) {
      await deleteOrganizationContext(id);
      // Call the parent callback if provided
      const contextToDelete = filteredContexts.find(context => context.id === id);
      if (contextToDelete && onDelete) {
        onDelete(contextToDelete);
      }
    }
  };

  const handleActivate = async (id: string) => {
    await activateOrganizationContext(id);
    // Call the parent callback if provided
    const contextToActivate = filteredContexts.find(context => context.id === id);
    if (contextToActivate && onActivate) {
      onActivate(contextToActivate);
    }
  };

  const handleDeactivate = async (id: string) => {
    await deactivateOrganizationContext(id);
    // Call the parent callback if provided
    const contextToDeactivate = filteredContexts.find(context => context.id === id);
    if (contextToDeactivate && onDeactivate) {
      onDeactivate(contextToDeactivate);
    }
  };

  // Handle loading state
  if (organizationContexts?.loading) {
    return <div>Loading organization contexts...</div>;
  }

  // Handle error state
  if (organizationContexts?.error) {
    return <div>Error: {organizationContexts.error}</div>;
  }

  // Handle null or undefined state
  if (!organizationContexts || !filteredContexts) {
    return <div>No organization contexts available</div>;
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
                {onEdit && (
                  <button
                    onClick={() => onEdit(context)}
                    className="mr-2 bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                )}
                
                {onViewHierarchy && (
                  <button
                    onClick={() => onViewHierarchy(context)}
                    className="mr-2 bg-green-500 text-white px-2 py-1 rounded"
                  >
                    View Hierarchy
                  </button>
                )}
                
                {context.is_active ? (
                  <button
                    onClick={() => handleDeactivate(context.id)}
                    className="mr-2 bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(context.id)}
                    className="mr-2 bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Activate
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(context.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
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