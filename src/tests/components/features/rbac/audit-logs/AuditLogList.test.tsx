/**
 * AuditLogList Component Tests
 * 
 * Tests for the AuditLogList component that displays a list of audit logs
 * with filtering, pagination, and date range selection.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import userEvent from '@testing-library/user-event';
import { AuditLogList } from '../../../../../components/features/rbac/AuditLogList';
import { useRbac } from '../../../../../hooks/useRbac';
import { AuditLog } from '../../../../../types/rbac';
import { createMockResponse } from '../../../../utils/mockApi';
import { renderWithProviders } from '../../../../utils/componentTestUtils';

// Mock the useRbac hook
jest.mock('../../../../../hooks/useRbac');

// Mock data for audit logs
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    user_id: 'user1',
    action: 'create',
    entity_type: 'role',
    entity_id: 'role1',
    changes: { name: 'admin' },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    user_id: 'user2',
    action: 'update',
    entity_type: 'permission',
    entity_id: 'perm1',
    changes: { name: 'read' },
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    user_id: 'user3',
    action: 'delete',
    entity_type: 'role',
    entity_id: 'role2',
    changes: { name: 'user' },
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  }
];

describe('AuditLogList', () => {
  const mockFetchAuditLogs = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the useRbac hook implementation
    (useRbac as jest.Mock).mockReturnValue({
      auditLogs: {
        data: mockAuditLogs,
        loading: false,
        error: null,
        fetch: mockFetchAuditLogs
      }
    });
  });

  it('renders the component with audit logs', async () => {
    await act(async () => {
      render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuditLogList />
        </LocalizationProvider>
      );
    });
    
    // Check if the component renders
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Start Date' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'End Date' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Entity Type' })).toBeInTheDocument();
    
    // Check if all audit logs are displayed
    mockAuditLogs.forEach(log => {
      expect(screen.getByText(`User: ${log.user_id}`)).toBeInTheDocument();
      expect(screen.getByText(`Action: ${log.action}`)).toBeInTheDocument();
      expect(screen.getByText(`Entity: ${log.entity_type} (${log.entity_id})`)).toBeInTheDocument();
    });
  });

  it('displays loading state', async () => {
    (useRbac as jest.Mock).mockReturnValue({
      auditLogs: {
        data: [],
        loading: true,
        error: null,
        fetch: mockFetchAuditLogs
      }
    });

    await act(async () => {
      render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuditLogList />
        </LocalizationProvider>
      );
    });
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error state', async () => {
    const errorMessage = 'Failed to fetch audit logs';
    (useRbac as jest.Mock).mockReturnValue({
      auditLogs: {
        data: [],
        loading: false,
        error: errorMessage,
        fetch: mockFetchAuditLogs
      }
    });

    await act(async () => {
      render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuditLogList />
        </LocalizationProvider>
      );
    });
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('calls fetchAuditLogs on mount', async () => {
    await act(async () => {
      render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuditLogList />
        </LocalizationProvider>
      );
    });
    expect(mockFetchAuditLogs).toHaveBeenCalledTimes(1);
  });

  it('filters logs based on search input', async () => {
    await act(async () => {
      render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuditLogList />
        </LocalizationProvider>
      );
    });
    
    const searchInput = screen.getByLabelText('Search');
    await act(async () => {
      await userEvent.type(searchInput, 'user1');
    });

    // After filtering, only user1's log should be visible
    expect(screen.getByText('User: user1')).toBeInTheDocument();
    expect(screen.queryByText('User: user2')).not.toBeInTheDocument();
    expect(screen.queryByText('User: user3')).not.toBeInTheDocument();
  });

  it('filters logs based on action type', async () => {
    await act(async () => {
      render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuditLogList />
        </LocalizationProvider>
      );
    });
    
    const actionSelect = screen.getByRole('combobox', { name: 'Action' });
    await act(async () => {
      await userEvent.click(actionSelect);
    });

    // Wait for the menu to be visible
    const menu = await screen.findByRole('listbox');
    const createOption = within(menu).getByText('Create');
    await userEvent.click(createOption);

    // After filtering, only create actions should be visible
    expect(screen.getByText('Action: create')).toBeInTheDocument();
    expect(screen.queryByText('Action: update')).not.toBeInTheDocument();
    expect(screen.queryByText('Action: delete')).not.toBeInTheDocument();
  });

  it('filters logs based on entity type', async () => {
    await act(async () => {
      render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuditLogList />
        </LocalizationProvider>
      );
    });
    
    const entityTypeSelect = screen.getByRole('combobox', { name: 'Entity Type' });
    await act(async () => {
      await userEvent.click(entityTypeSelect);
    });

    // Wait for the menu to be visible
    const menu = await screen.findByRole('listbox');
    const roleOption = within(menu).getByText('Role');
    await userEvent.click(roleOption);

    // After filtering, only role entities should be visible
    const roleEntries = screen.getAllByText(/Entity: role/);
    expect(roleEntries).toHaveLength(2);
    expect(screen.queryByText(/Entity: permission/)).not.toBeInTheDocument();
  });
}); 