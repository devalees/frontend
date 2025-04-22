/**
 * OrganizationHierarchyViewer Component
 * 
 * Displays the hierarchy of organization contexts, showing ancestors and descendants.
 */

import React, { useEffect, useState } from 'react';
import { OrganizationContext } from '../../../types/rbac';
import { useRbac } from '../../../hooks/useRbac';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../ui/Card';
import { NavButton } from '../../ui/NavButton';
import { Tree, TreeItem } from '../../ui/Tree';
import { Network, ChevronRight, ChevronDown } from 'lucide-react';

interface OrganizationHierarchyViewerProps {
  context: OrganizationContext;
  onClose: () => void;
}

export const OrganizationHierarchyViewer: React.FC<OrganizationHierarchyViewerProps> = ({
  context,
  onClose,
}) => {
  const { organizationContexts } = useRbac();
  const [ancestors, setAncestors] = useState<OrganizationContext[]>([]);
  const [descendants, setDescendants] = useState<OrganizationContext[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHierarchy = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, these would be separate API calls
        // but for this example, we'll simulate using the existing data
        const contextAncestors = organizationContexts.data.filter(
          (ctx: OrganizationContext) => context.parent_id && (ctx.id === context.parent_id)
        );
        
        const contextDescendants = organizationContexts.data.filter(
          (ctx: OrganizationContext) => ctx.parent_id === context.id
        );
        
        setAncestors(contextAncestors);
        setDescendants(contextDescendants);
      } catch (error) {
        console.error('Error fetching hierarchy:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHierarchy();
  }, [context.id, context.parent_id, organizationContexts.data]);

  // Render a simple tree view for demo purposes
  // In a real implementation, this would be a more sophisticated tree component
  const renderHierarchyTree = () => {
    return (
      <div className="p-4 border rounded-md bg-gray-50">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Ancestors</h3>
          {ancestors.length > 0 ? (
            <ul className="pl-5 space-y-2">
              {ancestors.map(ancestor => (
                <li key={ancestor.id} className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  <span className="font-medium">{ancestor.name}</span>
                  {ancestor.parent_id && <span className="text-gray-500 ml-2">(has parent)</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No ancestors (root context)</p>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Current Context</h3>
          <div className="pl-5 flex items-center">
            <Network className="h-5 w-5 mr-2 text-blue-600" />
            <span className="font-bold">{context.name}</span>
            <span className="ml-2 text-gray-500">({context.is_active ? 'Active' : 'Inactive'})</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Descendants</h3>
          {descendants.length > 0 ? (
            <ul className="pl-5 space-y-2">
              {descendants.map(descendant => (
                <li key={descendant.id} className="flex items-center">
                  <ChevronDown className="h-4 w-4 mr-2" />
                  <span className="font-medium">{descendant.name}</span>
                  <span className="ml-2 text-gray-500">({descendant.is_active ? 'Active' : 'Inactive'})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No descendants (leaf context)</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="organization-hierarchy-viewer">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Hierarchy for: {context.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-10 text-center">
              <p>Loading hierarchy data...</p>
            </div>
          ) : (
            renderHierarchyTree()
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <NavButton 
            href="#"
            onClick={onClose} 
            data-testid="close-hierarchy-btn"
          >
            Close
          </NavButton>
        </CardFooter>
      </Card>
    </div>
  );
}; 