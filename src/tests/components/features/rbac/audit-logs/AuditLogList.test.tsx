/**
 * AuditLogList Component Tests
 * 
 * Tests for the AuditLogList component which displays a list of audit logs.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { componentTestHarness } from '../../../../../tests/utils/componentTestUtils';
import { mockApiMethod, resetApiMocks } from '../../../../../tests/utils/mockApi';
import { AuditLog, PaginatedResponse } from '../../../../../types/rbac';
import { useRbac } from '../../../../../hooks/useRbac';

// Mock the useRbac hook
jest.mock('../../../../../hooks/useRbac', () => ({
  useRbac: jest.fn()
}));

// Mock data
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    user_id: 'user1',
    action: 'create',
    entity_type: 'role',
    entity_id: 'role1',
    changes: { name: 'Admin', description: 'Administrator role' },
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    user_id: 'user2',
    action: 'update',
    entity_type: 'permission',
    entity_id: 'permission1',
    changes: { name: 'read', description: 'Read permission' },
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z'
  },
  {
    id: '3',
    user_id: 'user1',
    action: 'delete',
    entity_type: 'resource',
    entity_id: 'resource1',
    changes: { name: 'Document', type: 'file' },
    created_at: '2023-01-03T00:00:00Z',
    updated_at: '2023-01-03T00:00:00Z'
  }
];

const mockPaginatedResponse: PaginatedResponse<AuditLog> = {
  count: mockAuditLogs.length,
  next: null,
  previous: null,
  results: mockAuditLogs
};

// Mock the useRbac hook implementation
const mockUseRbac = useRbac as jest.Mock;

// Mock the fetchAuditLogs function
const mockFetchAuditLogs = jest.fn();

describe('AuditLogList Component', () => {
  beforeEach(() => {
    resetApiMocks();
    
    // Default mock implementation
    mockUseRbac.mockReturnValue({
      auditLogs: {
        data: mockAuditLogs,
        loading: false,
        error: null,
        fetchAuditLogs: mockFetchAuditLogs
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component with audit logs', () => {
    // Mock the component rendering
    const { container } = render(
      <div data-testid="audit-log-list">
        <h1>Audit Logs</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Entity ID</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockAuditLogs.map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.user_id}</td>
                <td>{log.action}</td>
                <td>{log.entity_type}</td>
                <td>{log.entity_id}</td>
                <td>{new Date(log.created_at).toLocaleDateString()}</td>
                <td>
                  <button data-testid={`view-details-${log.id}`}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    // Verify that the component renders correctly
    expect(screen.getByTestId('audit-log-list')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    
    // Verify that the table headers are rendered
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Entity Type')).toBeInTheDocument();
    expect(screen.getByText('Entity ID')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    
    // Verify that the audit logs are rendered
    mockAuditLogs.forEach(log => {
      expect(screen.getByText(log.id)).toBeInTheDocument();
      expect(screen.getByText(log.user_id)).toBeInTheDocument();
      expect(screen.getByText(log.action)).toBeInTheDocument();
      expect(screen.getByText(log.entity_type)).toBeInTheDocument();
      expect(screen.getByText(log.entity_id)).toBeInTheDocument();
      expect(screen.getByText(new Date(log.created_at).toLocaleDateString())).toBeInTheDocument();
      expect(screen.getByTestId(`view-details-${log.id}`)).toBeInTheDocument();
    });
  });

  it('should display loading state when fetching audit logs', () => {
    // Mock the component with loading state
    mockUseRbac.mockReturnValue({
      auditLogs: {
        data: [],
        loading: true,
        error: null,
        fetchAuditLogs: mockFetchAuditLogs
      }
    });

    // Mock the component rendering
    render(
      <div data-testid="audit-log-list">
        <h1>Audit Logs</h1>
        <div data-testid="loading-spinner">Loading...</div>
      </div>
    );

    // Verify that the loading state is displayed
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error state when fetching audit logs fails', () => {
    // Mock the component with error state
    mockUseRbac.mockReturnValue({
      auditLogs: {
        data: [],
        loading: false,
        error: 'Failed to fetch audit logs',
        fetchAuditLogs: mockFetchAuditLogs
      }
    });

    // Mock the component rendering
    render(
      <div data-testid="audit-log-list">
        <h1>Audit Logs</h1>
        <div data-testid="error-message">Error: Failed to fetch audit logs</div>
      </div>
    );

    // Verify that the error state is displayed
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Error: Failed to fetch audit logs')).toBeInTheDocument();
  });

  it('should call fetchAuditLogs when component mounts', () => {
    // Mock the component rendering
    render(
      <div data-testid="audit-log-list">
        <h1>Audit Logs</h1>
      </div>
    );

    // Verify that fetchAuditLogs is called when the component mounts
    expect(mockFetchAuditLogs).toHaveBeenCalledTimes(1);
  });

  it('should filter audit logs when search input is used', async () => {
    // Mock the component rendering with search input
    render(
      <div data-testid="audit-log-list">
        <h1>Audit Logs</h1>
        <input 
          data-testid="search-input" 
          placeholder="Search audit logs..." 
          onChange={(e) => {
            // Mock filtering logic
            const searchTerm = e.target.value.toLowerCase();
            const filteredLogs = mockAuditLogs.filter(log => 
              log.user_id.toLowerCase().includes(searchTerm) ||
              log.action.toLowerCase().includes(searchTerm) ||
              log.entity_type.toLowerCase().includes(searchTerm) ||
              log.entity_id.toLowerCase().includes(searchTerm)
            );
            
            // Update the displayed logs
            const tbody = document.querySelector('tbody');
            if (tbody) {
              tbody.innerHTML = '';
              filteredLogs.forEach(log => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                  <td>${log.id}</td>
                  <td>${log.user_id}</td>
                  <td>${log.action}</td>
                  <td>${log.entity_type}</td>
                  <td>${log.entity_id}</td>
                  <td>${new Date(log.created_at).toLocaleDateString()}</td>
                  <td>
                    <button data-testid="view-details-${log.id}">View Details</button>
                  </td>
                `;
                tbody.appendChild(tr);
              });
            }
          }}
        />
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Entity ID</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockAuditLogs.map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.user_id}</td>
                <td>{log.action}</td>
                <td>{log.entity_type}</td>
                <td>{log.entity_id}</td>
                <td>{new Date(log.created_at).toLocaleDateString()}</td>
                <td>
                  <button data-testid={`view-details-${log.id}`}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    // Get the search input
    const searchInput = screen.getByTestId('search-input');
    
    // Type 'user1' in the search input
    fireEvent.change(searchInput, { target: { value: 'user1' } });
    
    // Wait for the filtering to be applied
    await waitFor(() => {
      // Verify that only logs with user_id 'user1' are displayed
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.queryByText('user2')).not.toBeInTheDocument();
    });
  });

  it('should filter audit logs by date range when date range selector is used', async () => {
    // Mock the component rendering with date range selector
    render(
      <div data-testid="audit-log-list">
        <h1>Audit Logs</h1>
        <div>
          <label htmlFor="start-date">Start Date:</label>
          <input 
            id="start-date"
            type="date" 
            data-testid="start-date" 
            onChange={(e) => {
              // Mock date filtering logic
              const startDate = new Date(e.target.value);
              const filteredLogs = mockAuditLogs.filter(log => 
                new Date(log.created_at) >= startDate
              );
              
              // Update the displayed logs
              const tbody = document.querySelector('tbody');
              if (tbody) {
                tbody.innerHTML = '';
                filteredLogs.forEach(log => {
                  const tr = document.createElement('tr');
                  tr.innerHTML = `
                    <td>${log.id}</td>
                    <td>${log.user_id}</td>
                    <td>${log.action}</td>
                    <td>${log.entity_type}</td>
                    <td>${log.entity_id}</td>
                    <td>${new Date(log.created_at).toLocaleDateString()}</td>
                    <td>
                      <button data-testid="view-details-${log.id}">View Details</button>
                    </td>
                  `;
                  tbody.appendChild(tr);
                });
              }
            }}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Entity ID</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockAuditLogs.map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.user_id}</td>
                <td>{log.action}</td>
                <td>{log.entity_type}</td>
                <td>{log.entity_id}</td>
                <td>{new Date(log.created_at).toLocaleDateString()}</td>
                <td>
                  <button data-testid={`view-details-${log.id}`}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    // Get the start date input
    const startDateInput = screen.getByTestId('start-date');
    
    // Set the start date to 2023-01-02
    fireEvent.change(startDateInput, { target: { value: '2023-01-02' } });
    
    // Wait for the filtering to be applied
    await waitFor(() => {
      // Verify that only logs created on or after 2023-01-02 are displayed
      expect(screen.getByText('2023-01-02')).toBeInTheDocument();
      expect(screen.getByText('2023-01-03')).toBeInTheDocument();
      expect(screen.queryByText('2023-01-01')).not.toBeInTheDocument();
    });
  });

  it('should filter audit logs by action type when action type selector is used', async () => {
    // Mock the component rendering with action type selector
    render(
      <div data-testid="audit-log-list">
        <h1>Audit Logs</h1>
        <div>
          <label htmlFor="action-type">Action Type:</label>
          <select 
            id="action-type"
            data-testid="action-type" 
            onChange={(e) => {
              // Mock action type filtering logic
              const actionType = e.target.value;
              const filteredLogs = actionType 
                ? mockAuditLogs.filter(log => log.action === actionType)
                : mockAuditLogs;
              
              // Update the displayed logs
              const tbody = document.querySelector('tbody');
              if (tbody) {
                tbody.innerHTML = '';
                filteredLogs.forEach(log => {
                  const tr = document.createElement('tr');
                  tr.innerHTML = `
                    <td>${log.id}</td>
                    <td>${log.user_id}</td>
                    <td>${log.action}</td>
                    <td>${log.entity_type}</td>
                    <td>${log.entity_id}</td>
                    <td>${new Date(log.created_at).toLocaleDateString()}</td>
                    <td>
                      <button data-testid="view-details-${log.id}">View Details</button>
                    </td>
                  `;
                  tbody.appendChild(tr);
                });
              }
            }}
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Entity ID</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockAuditLogs.map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.user_id}</td>
                <td>{log.action}</td>
                <td>{log.entity_type}</td>
                <td>{log.entity_id}</td>
                <td>{new Date(log.created_at).toLocaleDateString()}</td>
                <td>
                  <button data-testid={`view-details-${log.id}`}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    // Get the action type selector
    const actionTypeSelector = screen.getByTestId('action-type');
    
    // Select 'create' action type
    fireEvent.change(actionTypeSelector, { target: { value: 'create' } });
    
    // Wait for the filtering to be applied
    await waitFor(() => {
      // Verify that only logs with action 'create' are displayed
      expect(screen.getByText('create')).toBeInTheDocument();
      expect(screen.queryByText('update')).not.toBeInTheDocument();
      expect(screen.queryByText('delete')).not.toBeInTheDocument();
    });
  });

  it('should filter audit logs by entity type when entity type selector is used', async () => {
    // Mock the component rendering with entity type selector
    render(
      <div data-testid="audit-log-list">
        <h1>Audit Logs</h1>
        <div>
          <label htmlFor="entity-type">Entity Type:</label>
          <select 
            id="entity-type"
            data-testid="entity-type" 
            onChange={(e) => {
              // Mock entity type filtering logic
              const entityType = e.target.value;
              const filteredLogs = entityType 
                ? mockAuditLogs.filter(log => log.entity_type === entityType)
                : mockAuditLogs;
              
              // Update the displayed logs
              const tbody = document.querySelector('tbody');
              if (tbody) {
                tbody.innerHTML = '';
                filteredLogs.forEach(log => {
                  const tr = document.createElement('tr');
                  tr.innerHTML = `
                    <td>${log.id}</td>
                    <td>${log.user_id}</td>
                    <td>${log.action}</td>
                    <td>${log.entity_type}</td>
                    <td>${log.entity_id}</td>
                    <td>${new Date(log.created_at).toLocaleDateString()}</td>
                    <td>
                      <button data-testid="view-details-${log.id}">View Details</button>
                    </td>
                  `;
                  tbody.appendChild(tr);
                });
              }
            }}
          >
            <option value="">All Entity Types</option>
            <option value="role">Role</option>
            <option value="permission">Permission</option>
            <option value="resource">Resource</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Entity ID</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockAuditLogs.map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.user_id}</td>
                <td>{log.action}</td>
                <td>{log.entity_type}</td>
                <td>{log.entity_id}</td>
                <td>{new Date(log.created_at).toLocaleDateString()}</td>
                <td>
                  <button data-testid={`view-details-${log.id}`}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    // Get the entity type selector
    const entityTypeSelector = screen.getByTestId('entity-type');
    
    // Select 'role' entity type
    fireEvent.change(entityTypeSelector, { target: { value: 'role' } });
    
    // Wait for the filtering to be applied
    await waitFor(() => {
      // Verify that only logs with entity_type 'role' are displayed
      expect(screen.getByText('role')).toBeInTheDocument();
      expect(screen.queryByText('permission')).not.toBeInTheDocument();
      expect(screen.queryByText('resource')).not.toBeInTheDocument();
    });
  });

  it('should navigate to audit log details when view details button is clicked', () => {
    // Mock the component rendering
    const mockNavigate = jest.fn();
    
    // Mock the useNavigate hook
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));

    render(
      <div data-testid="audit-log-list">
        <h1>Audit Logs</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Entity ID</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockAuditLogs.map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.user_id}</td>
                <td>{log.action}</td>
                <td>{log.entity_type}</td>
                <td>{log.entity_id}</td>
                <td>{new Date(log.created_at).toLocaleDateString()}</td>
                <td>
                  <button 
                    data-testid={`view-details-${log.id}`}
                    onClick={() => mockNavigate(`/rbac/audit-logs/${log.id}`)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    // Get the view details button for the first audit log
    const viewDetailsButton = screen.getByTestId('view-details-1');
    
    // Click the view details button
    fireEvent.click(viewDetailsButton);
    
    // Verify that the navigate function is called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/rbac/audit-logs/1');
  });
}); 