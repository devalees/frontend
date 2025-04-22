/**
 * OrganizationContextList Component
 * 
 * Displays a list of organization contexts with filtering, pagination, and actions for edit, delete, activate, deactivate, and view hierarchy.
 */

'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Badge } from '@/components/ui/Badge';
import { Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';

// Mock data for organization contexts
const mockOrganizationContexts = [
  {
    id: '1',
    name: 'Global Context',
    description: 'Top-level organization context',
    parent_id: null,
    is_active: true,
    level: 1,
    created_at: '2023-09-15T10:00:00Z',
    updated_at: '2023-09-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'North America Region',
    description: 'North American regional context',
    parent_id: '1',
    is_active: true,
    level: 2,
    created_at: '2023-09-15T11:00:00Z',
    updated_at: '2023-09-15T11:00:00Z',
  },
  {
    id: '3',
    name: 'Europe Region',
    description: 'European regional context',
    parent_id: '1',
    is_active: true,
    level: 2,
    created_at: '2023-09-15T12:00:00Z',
    updated_at: '2023-09-15T12:00:00Z',
  },
  {
    id: '4',
    name: 'US Division',
    description: 'United States division',
    parent_id: '2',
    is_active: false,
    level: 3,
    created_at: '2023-09-16T09:00:00Z',
    updated_at: '2023-09-16T09:00:00Z',
  },
  {
    id: '5',
    name: 'UK Division',
    description: 'United Kingdom division',
    parent_id: '3',
    is_active: true,
    level: 3,
    created_at: '2023-09-16T10:00:00Z',
    updated_at: '2023-09-16T10:00:00Z',
  }
];

interface OrganizationContextItem {
  id: string;
  name: string;
  description: string;
  parent_id: string | null;
  is_active: boolean;
  level: number;
  created_at: string;
  updated_at: string;
}

interface OrganizationContextListProps {
  onEdit: (context: OrganizationContextItem) => void;
  onDelete: (context: OrganizationContextItem) => void;
  onActivate: (context: OrganizationContextItem) => void;
  onDeactivate: (context: OrganizationContextItem) => void;
  onViewHierarchy: (context: OrganizationContextItem) => void;
}

export function OrganizationContextList({
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onViewHierarchy,
}: OrganizationContextListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isLoading] = useState(false);

  // Filter organization contexts based on search term
  const filteredContexts = mockOrganizationContexts.filter(context =>
    context.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    context.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContexts = filteredContexts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContexts.length / itemsPerPage);

  // Get parent name by id
  const getParentName = (parentId: string | null) => {
    if (!parentId) return 'None';
    const parent = mockOrganizationContexts.find(context => context.id === parentId);
    return parent ? parent.name : 'Unknown';
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Input
            type="text"
            placeholder="Search organization contexts..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-10"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : currentContexts.length > 0 ? (
        <>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentContexts.map((context) => (
                  <tr key={context.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{context.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{context.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getParentName(context.parent_id)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={context.is_active ? "success" : "error"}>
                        {context.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <NavButton
                          variant="outline"
                          size="small"
                          href="#"
                          onClick={() => onEdit(context)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </NavButton>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => onDelete(context)}
                          title="Delete"
                          className="text-destructive border-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {context.is_active ? (
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => onDeactivate(context)}
                            title="Deactivate"
                          >
                            <ToggleRight className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => onActivate(context)}
                            title="Activate"
                          >
                            <ToggleLeft className="h-4 w-4" />
                          </Button>
                        )}
                        <NavButton
                          variant="outline"
                          size="small"
                          href="#"
                          onClick={() => onViewHierarchy(context)}
                          title="View Hierarchy"
                        >
                          <Eye className="h-4 w-4" />
                        </NavButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              <NavButton
                variant="outline"
                size="small"
                href="#"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </NavButton>
              {Array.from({ length: totalPages }).map((_, index) => (
                <NavButton
                  key={index}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  size="small"
                  href="#"
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </NavButton>
              ))}
              <NavButton
                variant="outline"
                size="small"
                href="#"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </NavButton>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <p className="text-gray-500">No organization contexts found</p>
        </div>
      )}
    </div>
  );
} 