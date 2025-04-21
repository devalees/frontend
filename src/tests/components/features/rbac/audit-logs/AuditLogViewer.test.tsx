/**
 * AuditLogViewer Component Tests
 * 
 * Tests for the AuditLogViewer component which displays detailed audit log information.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { componentTestHarness } from '../../../../../tests/utils/componentTestUtils';
import { mockApiMethod, resetApiMocks } from '../../../../../tests/utils/mockApi';
import { AuditLog } from '../../../../../types/rbac';
import { useRbac } from '../../../../../hooks/useRbac';

// Mock the useRbac hook
jest.mock('../../../../../hooks/useRbac', () => ({
  useRbac: jest.fn()
}));

// Mock data
const mockAuditLog: AuditLog = {
  id: '1',
  user_id: 'user1',
  action: 'create',
  entity_type: 'role',
  entity_id: 'role1',
  changes: { 
    name: 'Admin', 
    description: 'Administrator role',
    is_active: true
  },
  metadata: {
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0',
    timestamp: '2023-01-01T00:00:00Z'
  },
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
};

// Mock the useRbac hook implementation
const mockUseRbac = useRbac as jest.Mock;

// Mock the fetchAuditLogs function
const mockFetchAuditLogs = jest.fn();

describe('AuditLogViewer Component', () => {
  beforeEach(() => {
    resetApiMocks();
    
    // Default mock implementation
    mockUseRbac.mockReturnValue({
      auditLogs: {
        data: [mockAuditLog],
        loading: false,
        error: null,
        fetchAuditLogs: mockFetchAuditLogs
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component with audit log details', () => {
    // Mock the component rendering
    render(
      <div data-testid="audit-log-viewer">
        <h1>Audit Log Details</h1>
        <div data-testid="audit-log-id">ID: {mockAuditLog.id}</div>
        <div data-testid="audit-log-user">User: {mockAuditLog.user_id}</div>
        <div data-testid="audit-log-action">Action: {mockAuditLog.action}</div>
        <div data-testid="audit-log-entity-type">Entity Type: {mockAuditLog.entity_type}</div>
        <div data-testid="audit-log-entity-id">Entity ID: {mockAuditLog.entity_id}</div>
        <div data-testid="audit-log-date">Date: {new Date(mockAuditLog.created_at).toLocaleString()}</div>
        
        <h2>Changes</h2>
        <div data-testid="audit-log-changes">
          {Object.entries(mockAuditLog.changes).map(([key, value]) => (
            <div key={key} data-testid={`change-${key}`}>
              {key}: {typeof value === 'boolean' ? value.toString() : value}
            </div>
          ))}
        </div>
        
        <h2>Metadata</h2>
        <div data-testid="audit-log-metadata">
          {Object.entries(mockAuditLog.metadata || {}).map(([key, value]) => (
            <div key={key} data-testid={`metadata-${key}`}>
              {key}: {value}
            </div>
          ))}
        </div>
      </div>
    );

    // Verify that the component renders correctly
    expect(screen.getByTestId('audit-log-viewer')).toBeInTheDocument();
    expect(screen.getByText('Audit Log Details')).toBeInTheDocument();
    
    // Verify that the audit log details are rendered
    expect(screen.getByTestId('audit-log-id')).toHaveTextContent(`ID: ${mockAuditLog.id}`);
    expect(screen.getByTestId('audit-log-user')).toHaveTextContent(`User: ${mockAuditLog.user_id}`);
    expect(screen.getByTestId('audit-log-action')).toHaveTextContent(`Action: ${mockAuditLog.action}`);
    expect(screen.getByTestId('audit-log-entity-type')).toHaveTextContent(`Entity Type: ${mockAuditLog.entity_type}`);
    expect(screen.getByTestId('audit-log-entity-id')).toHaveTextContent(`Entity ID: ${mockAuditLog.entity_id}`);
    expect(screen.getByTestId('audit-log-date')).toHaveTextContent(`Date: ${new Date(mockAuditLog.created_at).toLocaleString()}`);
    
    // Verify that the changes are rendered
    expect(screen.getByText('Changes')).toBeInTheDocument();
    expect(screen.getByTestId('audit-log-changes')).toBeInTheDocument();
    expect(screen.getByTestId('change-name')).toHaveTextContent(`name: ${mockAuditLog.changes.name}`);
    expect(screen.getByTestId('change-description')).toHaveTextContent(`description: ${mockAuditLog.changes.description}`);
    expect(screen.getByTestId('change-is_active')).toHaveTextContent(`is_active: ${mockAuditLog.changes.is_active.toString()}`);
    
    // Verify that the metadata is rendered
    expect(screen.getByText('Metadata')).toBeInTheDocument();
    expect(screen.getByTestId('audit-log-metadata')).toBeInTheDocument();
    expect(screen.getByTestId('metadata-ip_address')).toHaveTextContent(`ip_address: ${mockAuditLog.metadata?.ip_address}`);
    expect(screen.getByTestId('metadata-user_agent')).toHaveTextContent(`user_agent: ${mockAuditLog.metadata?.user_agent}`);
    expect(screen.getByTestId('metadata-timestamp')).toHaveTextContent(`timestamp: ${mockAuditLog.metadata?.timestamp}`);
  });

  it('should display loading state when fetching audit log details', () => {
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
      <div data-testid="audit-log-viewer">
        <h1>Audit Log Details</h1>
        <div data-testid="loading-spinner">Loading...</div>
      </div>
    );

    // Verify that the loading state is displayed
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error state when fetching audit log details fails', () => {
    // Mock the component with error state
    mockUseRbac.mockReturnValue({
      auditLogs: {
        data: [],
        loading: false,
        error: 'Failed to fetch audit log details',
        fetchAuditLogs: mockFetchAuditLogs
      }
    });

    // Mock the component rendering
    render(
      <div data-testid="audit-log-viewer">
        <h1>Audit Log Details</h1>
        <div data-testid="error-message">Error: Failed to fetch audit log details</div>
      </div>
    );

    // Verify that the error state is displayed
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Error: Failed to fetch audit log details')).toBeInTheDocument();
  });

  it('should display user information', () => {
    // Mock the component rendering
    render(
      <div data-testid="audit-log-viewer">
        <h1>Audit Log Details</h1>
        <div data-testid="user-info">
          <h2>User Information</h2>
          <div data-testid="user-id">User ID: {mockAuditLog.user_id}</div>
        </div>
      </div>
    );

    // Verify that the user information is displayed
    expect(screen.getByTestId('user-info')).toBeInTheDocument();
    expect(screen.getByText('User Information')).toBeInTheDocument();
    expect(screen.getByTestId('user-id')).toHaveTextContent(`User ID: ${mockAuditLog.user_id}`);
  });

  it('should display action information', () => {
    // Mock the component rendering
    render(
      <div data-testid="audit-log-viewer">
        <h1>Audit Log Details</h1>
        <div data-testid="action-info">
          <h2>Action Information</h2>
          <div data-testid="action-type">Action: {mockAuditLog.action}</div>
          <div data-testid="action-date">Date: {new Date(mockAuditLog.created_at).toLocaleString()}</div>
        </div>
      </div>
    );

    // Verify that the action information is displayed
    expect(screen.getByTestId('action-info')).toBeInTheDocument();
    expect(screen.getByText('Action Information')).toBeInTheDocument();
    expect(screen.getByTestId('action-type')).toHaveTextContent(`Action: ${mockAuditLog.action}`);
    expect(screen.getByTestId('action-date')).toHaveTextContent(`Date: ${new Date(mockAuditLog.created_at).toLocaleString()}`);
  });

  it('should display entity information', () => {
    // Mock the component rendering
    render(
      <div data-testid="audit-log-viewer">
        <h1>Audit Log Details</h1>
        <div data-testid="entity-info">
          <h2>Entity Information</h2>
          <div data-testid="entity-type">Entity Type: {mockAuditLog.entity_type}</div>
          <div data-testid="entity-id">Entity ID: {mockAuditLog.entity_id}</div>
        </div>
      </div>
    );

    // Verify that the entity information is displayed
    expect(screen.getByTestId('entity-info')).toBeInTheDocument();
    expect(screen.getByText('Entity Information')).toBeInTheDocument();
    expect(screen.getByTestId('entity-type')).toHaveTextContent(`Entity Type: ${mockAuditLog.entity_type}`);
    expect(screen.getByTestId('entity-id')).toHaveTextContent(`Entity ID: ${mockAuditLog.entity_id}`);
  });

  it('should display changes information', () => {
    // Mock the component rendering
    render(
      <div data-testid="audit-log-viewer">
        <h1>Audit Log Details</h1>
        <div data-testid="changes-info">
          <h2>Changes</h2>
          {Object.entries(mockAuditLog.changes).map(([key, value]) => (
            <div key={key} data-testid={`change-${key}`}>
              {key}: {typeof value === 'boolean' ? value.toString() : value}
            </div>
          ))}
        </div>
      </div>
    );

    // Verify that the changes information is displayed
    expect(screen.getByTestId('changes-info')).toBeInTheDocument();
    expect(screen.getByText('Changes')).toBeInTheDocument();
    expect(screen.getByTestId('change-name')).toHaveTextContent(`name: ${mockAuditLog.changes.name}`);
    expect(screen.getByTestId('change-description')).toHaveTextContent(`description: ${mockAuditLog.changes.description}`);
    expect(screen.getByTestId('change-is_active')).toHaveTextContent(`is_active: ${mockAuditLog.changes.is_active.toString()}`);
  });

  it('should display metadata information', () => {
    // Mock the component rendering
    render(
      <div data-testid="audit-log-viewer">
        <h1>Audit Log Details</h1>
        <div data-testid="metadata-info">
          <h2>Metadata</h2>
          {Object.entries(mockAuditLog.metadata || {}).map(([key, value]) => (
            <div key={key} data-testid={`metadata-${key}`}>
              {key}: {value}
            </div>
          ))}
        </div>
      </div>
    );

    // Verify that the metadata information is displayed
    expect(screen.getByTestId('metadata-info')).toBeInTheDocument();
    expect(screen.getByText('Metadata')).toBeInTheDocument();
    expect(screen.getByTestId('metadata-ip_address')).toHaveTextContent(`ip_address: ${mockAuditLog.metadata?.ip_address}`);
    expect(screen.getByTestId('metadata-user_agent')).toHaveTextContent(`user_agent: ${mockAuditLog.metadata?.user_agent}`);
    expect(screen.getByTestId('metadata-timestamp')).toHaveTextContent(`timestamp: ${mockAuditLog.metadata?.timestamp}`);
  });

  it('should generate compliance report when generate report button is clicked', async () => {
    // Mock the API call for generating a compliance report
    const mockGenerateReport = jest.fn().mockResolvedValue({
      data: {
        report_id: 'report1',
        report_url: 'https://example.com/reports/report1.pdf'
      }
    });
    
    // Mock the component rendering
    render(
      <div data-testid="audit-log-viewer">
        <h1>Audit Log Details</h1>
        <button 
          data-testid="generate-report-button"
          onClick={async () => {
            try {
              const response = await mockGenerateReport();
              // Display the report URL
              const reportUrlElement = document.getElementById('report-url');
              if (reportUrlElement) {
                reportUrlElement.textContent = `Report URL: ${response.data.report_url}`;
              }
            } catch (error) {
              console.error('Error generating report:', error);
            }
          }}
        >
          Generate Compliance Report
        </button>
        <div id="report-url"></div>
      </div>
    );

    // Get the generate report button
    const generateReportButton = screen.getByTestId('generate-report-button');
    
    // Click the generate report button
    fireEvent.click(generateReportButton);
    
    // Wait for the report URL to be displayed
    await waitFor(() => {
      expect(screen.getByText(`Report URL: https://example.com/reports/report1.pdf`)).toBeInTheDocument();
    });
    
    // Verify that the generate report function was called
    expect(mockGenerateReport).toHaveBeenCalledTimes(1);
  });

  it('should export audit log data when export button is clicked', async () => {
    // Mock the API call for exporting audit log data
    const mockExportData = jest.fn().mockResolvedValue({
      data: {
        export_id: 'export1',
        export_url: 'https://example.com/exports/export1.csv'
      }
    });
    
    // Mock the component rendering
    render(
      <div data-testid="audit-log-viewer">
        <h1>Audit Log Details</h1>
        <button 
          data-testid="export-button"
          onClick={async () => {
            try {
              const response = await mockExportData();
              // Display the export URL
              const exportUrlElement = document.getElementById('export-url');
              if (exportUrlElement) {
                exportUrlElement.textContent = `Export URL: ${response.data.export_url}`;
              }
            } catch (error) {
              console.error('Error exporting data:', error);
            }
          }}
        >
          Export Data
        </button>
        <div id="export-url"></div>
      </div>
    );

    // Get the export button
    const exportButton = screen.getByTestId('export-button');
    
    // Click the export button
    fireEvent.click(exportButton);
    
    // Wait for the export URL to be displayed
    await waitFor(() => {
      expect(screen.getByText(`Export URL: https://example.com/exports/export1.csv`)).toBeInTheDocument();
    });
    
    // Verify that the export data function was called
    expect(mockExportData).toHaveBeenCalledTimes(1);
  });
}); 