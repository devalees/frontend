'use client';

import { useState } from 'react';
import { AuditLogList } from '@/components/features/rbac/AuditLogList';
import { AuditLogViewer } from '@/components/features/rbac/AuditLogViewer';
import { ComplianceReportForm } from '@/components/features/rbac/ComplianceReportForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { FileText, ChevronRight, Trash2 } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/ui/use-toast';

// Use the same interface as in AuditLogList
interface AuditLogItem {
  id: string;
  timestamp: string;
  user_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  resource_type: string;
  resource_id: string;
  details: string;
  ip_address: string;
  user_agent: string;
}

export default function AuditLogPage() {
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const { toast } = useToast();

  const handleViewDetails = (log: AuditLogItem) => {
    setSelectedLog(log);
  };

  const handleCloseViewer = () => {
    setSelectedLog(null);
  };

  const handleFilterChange = async (filters: any) => {
    // In a real implementation, this would filter the logs
    toast({
      title: 'Filters Applied',
      description: 'Filters have been applied to the audit logs',
    });
  };

  const handleGenerateReport = () => {
    setIsReportFormOpen(true);
  };

  const handleReportSubmit = async (data: any) => {
    // Mock implementation
    toast({
      title: 'Report Generated',
      description: `Compliance report generated successfully for period ${data.startDate} to ${data.endDate}`,
    });
    setIsReportFormOpen(false);
  };

  const handleCloseReportForm = () => {
    setIsReportFormOpen(false);
  };

  const handleCleanupExpiredLogs = async () => {
    // Mock implementation
    toast({
      title: 'Cleanup Complete',
      description: 'Expired audit logs have been cleaned up successfully',
    });
  };

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center mb-4 text-sm text-gray-500">
        <NavButton href="/dashboard" className="hover:text-gray-700">Dashboard</NavButton>
        <ChevronRight className="h-4 w-4 mx-2" />
        <NavButton href="/rbac" className="hover:text-gray-700">RBAC</NavButton>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900 font-medium">Audit Logs</span>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <div className="space-x-2">
          <Button onClick={handleGenerateReport} className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Generate Compliance Report
          </Button>
          <Button onClick={handleCleanupExpiredLogs} variant="secondary" className="flex items-center">
            <Trash2 className="mr-2 h-4 w-4" />
            Cleanup Expired Logs
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogList 
            onViewDetails={handleViewDetails}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>

      {selectedLog && (
        <AuditLogViewer
          log={selectedLog}
          onClose={handleCloseViewer}
        />
      )}

      {isReportFormOpen && (
        <ComplianceReportForm
          onSubmit={handleReportSubmit}
          onCancel={handleCloseReportForm}
        />
      )}

      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
} 