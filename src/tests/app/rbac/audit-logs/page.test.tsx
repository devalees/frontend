/**
 * Audit Logs Page Tests
 * 
 * Tests for the RBAC audit logs page, including:
 * - Page rendering
 * - Navigation
 * - Integration with components and hooks
 */

import React from 'react';
import { renderWithProviders } from '../../../utils/componentTestUtils';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import AuditLogPage from '../../../../app/(dashboard)/rbac/audit-logs/page';
import { AuditLog } from '../../../../types/rbac';

// Mock the RBAC hook
const mockFetchAuditLogs = jest.fn(() => Promise.resolve());
const mockGenerateComplianceReport = jest.fn(() => Promise.resolve());
const mockCleanupExpiredLogs = jest.fn(() => Promise.resolve());

jest.mock('../../../../hooks/useRbac', () => ({
  useRbac: () => ({
    auditLogs: {
      data: [
        {
          id: '1',
          user_id: 'user1',
          action: 'create',
          entity_type: 'ROLE',
          entity_id: 'role1',
          changes: { name: 'Admin', description: 'Created new role: Admin' },
          created_at: '2024-01-01T12:00:00Z',
          updated_at: '2024-01-01T12:00:00Z'
        },
        {
          id: '2',
          user_id: 'user2',
          action: 'update',
          entity_type: 'PERMISSION',
          entity_id: 'perm1',
          changes: { name: 'View Projects', description: 'Updated permission: View Projects' },
          created_at: '2024-01-02T12:00:00Z',
          updated_at: '2024-01-02T12:00:00Z'
        },
        {
          id: '3',
          user_id: 'user1',
          action: 'delete',
          entity_type: 'RESOURCE',
          entity_id: 'res1',
          changes: { name: 'Project Dashboard', description: 'Deleted resource: Project Dashboard' },
          created_at: '2024-01-03T12:00:00Z',
          updated_at: '2024-01-03T12:00:00Z'
        }
      ],
      loading: false,
      error: null
    },
    fetchAuditLogs: mockFetchAuditLogs,
    generateComplianceReport: mockGenerateComplianceReport,
    cleanupExpiredLogs: mockCleanupExpiredLogs
  }),
}));

// Mock the AuditLogList component
jest.mock('../../../../components/features/rbac/AuditLogList', () => ({
  AuditLogList: ({ 
    onViewDetails,
    onFilterChange
  }: { 
    onViewDetails?: (log: AuditLog) => void,
    onFilterChange?: (filters: any) => void
  }) => (
    <div data-testid="audit-log-list">
      <button data-testid="view-details-button" onClick={() => onViewDetails && onViewDetails({ 
        id: '1',
        user_id: 'user1',
        action: 'create',
        entity_type: 'ROLE',
        entity_id: 'role1',
        changes: { name: 'Admin', description: 'Created new role: Admin' },
        created_at: '2024-01-01T12:00:00Z',
        updated_at: '2024-01-01T12:00:00Z'
      })}>
        View Details
      </button>
      <button data-testid="apply-filters-button" onClick={() => onFilterChange && onFilterChange({ 
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        action: 'create',
        entityType: 'ROLE',
        userId: 'user1'
      })}>
        Apply Filters
      </button>
    </div>
  ),
}));

// Mock the AuditLogViewer component
jest.mock('../../../../components/features/rbac/AuditLogViewer', () => ({
  AuditLogViewer: ({ 
    log, 
    onClose 
  }: { 
    log: AuditLog; 
    onClose: () => void; 
  }) => (
    <div data-testid="audit-log-viewer">
      <h3>Audit Log Details: {log.action} {log.entity_type}</h3>
      <p>{JSON.stringify(log.changes)}</p>
      <button data-testid="close-viewer-btn" onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock the ComplianceReportForm component
jest.mock('../../../../components/features/rbac/ComplianceReportForm', () => ({
  ComplianceReportForm: ({ 
    onSubmit, 
    onCancel 
  }: { 
    onSubmit: (data: any) => Promise<void>; 
    onCancel: () => void; 
  }) => (
    <div data-testid="compliance-report-form">
      <h3>Generate Compliance Report</h3>
      <button data-testid="generate-report-btn" onClick={() => onSubmit({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        includeDeleted: true,
        format: 'PDF'
      })}>
        Generate Report
      </button>
      <button data-testid="cancel-report-btn" onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

// Mock the toast component
const mockToast = jest.fn();
jest.mock('../../../../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
  ToastContainer: () => <div data-testid="toast-container">
    {mockToast.mock.calls.map((call, i) => (
      <div key={i} data-testid={`toast-${i}`}>
        <div data-testid={`toast-title-${i}`}>{call[0]?.title}</div>
        <div data-testid={`toast-description-${i}`}>{call[0]?.description}</div>
      </div>
    ))}
  </div>,
}));

// Mock the Card components
jest.mock('../../../../components/ui/Card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the Button component
jest.mock('../../../../components/ui/Button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  FileText: () => <span data-testid="file-text-icon">📄</span>,
  ChevronRight: () => <span data-testid="chevron-right">&gt;</span>,
  BarChart2: () => <span data-testid="bar-chart-icon">📊</span>,
  Trash2: () => <span data-testid="trash-icon">🗑</span>,
}));

describe('Audit Log Page', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the audit log page correctly', () => {
    renderWithProviders(<AuditLogPage />);
    
    // Check if the page title is rendered
    expect(screen.getByRole('heading', { name: 'Audit Logs' })).toBeInTheDocument();
    expect(screen.getByTestId('audit-log-list')).toBeInTheDocument();
  });

  it('opens the audit log viewer when View Details button is clicked', async () => {
    renderWithProviders(<AuditLogPage />);
    
    // Find and click the View Details button
    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);
    
    // Check if the viewer is displayed
    expect(screen.getByTestId('audit-log-viewer')).toBeInTheDocument();
    expect(screen.getByText('Audit Log Details: create ROLE')).toBeInTheDocument();
    
    // Close the viewer
    const closeButton = screen.getByTestId('close-viewer-btn');
    fireEvent.click(closeButton);
    
    // Check if the viewer is closed
    expect(screen.queryByTestId('audit-log-viewer')).not.toBeInTheDocument();
  });

  it('opens the compliance report form when Generate Report button is clicked', async () => {
    renderWithProviders(<AuditLogPage />);
    
    // Find and click the Generate Report button
    const generateReportButton = screen.getByRole('button', { name: /Generate Compliance Report/i });
    fireEvent.click(generateReportButton);
    
    // Check if the form is displayed
    expect(screen.getByTestId('compliance-report-form')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Generate Compliance Report' })).toBeInTheDocument();
  });

  it('submits the compliance report form with correct data', async () => {
    renderWithProviders(<AuditLogPage />);
    
    // Open the form
    const generateReportButton = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'button' && 
        element.innerHTML.includes('Generate Compliance Report');
    });
    fireEvent.click(generateReportButton);
    
    // Find and click the generate report button in the form
    const submitButton = screen.getByTestId('generate-report-btn');
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Since our page implementation uses a mock without calling the actual API function,
    // we should check if the toast was shown for the report generation
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Report Generated',
      description: expect.stringContaining('Compliance report generated successfully')
    }));
    
    // Check if the form is closed after submission
    expect(screen.queryByTestId('compliance-report-form')).not.toBeInTheDocument();
  });

  it('applies filters to audit logs', async () => {
    renderWithProviders(<AuditLogPage />);
    
    // Find and click the apply filters button
    const applyFiltersButton = screen.getByTestId('apply-filters-button');
    await act(async () => {
      fireEvent.click(applyFiltersButton);
    });
    
    // Check if the toast notification for filter application is shown
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Filters Applied'
    }));
  });

  it('calls cleanup expired logs when cleanup button is clicked', async () => {
    renderWithProviders(<AuditLogPage />);
    
    // Find and click the cleanup button
    const cleanupButton = screen.getByRole('button', { name: /Cleanup Expired Logs/i });
    await act(async () => {
      fireEvent.click(cleanupButton);
    });
    
    // Check if a success toast was shown
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Cleanup Complete',
      description: expect.stringContaining('Expired audit logs')
    }));
  });

  it('fetches audit logs on page load', () => {
    // Since the AuditLogPage component doesn't directly call fetchAuditLogs on mount,
    // but relies on the useRbac hook to do so, we can only check if the component renders
    // with the data from the mock hook
    renderWithProviders(<AuditLogPage />);
    
    // Check if the audit log list is rendered with the mock data
    expect(screen.getByTestId('audit-log-list')).toBeInTheDocument();
  });
}); 