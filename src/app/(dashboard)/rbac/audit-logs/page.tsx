'use client';

import { useState, useEffect } from 'react';
import { AuditLogList } from '@/components/features/rbac/AuditLogList';
import { AuditLogViewer } from '@/components/features/rbac/AuditLogViewer';
import { ComplianceReportForm } from '@/components/features/rbac/ComplianceReportForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, ChevronRight, BarChart2, Trash2 } from 'lucide-react';
import { AuditLog } from '@/types/rbac';
import { useToast, ToastContainer } from '@/components/ui/use-toast';
import { useRbac } from '@/hooks/useRbac';

export default function AuditLogPage() {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const { toast } = useToast();
  const { 
    auditLog,
    fetchAuditLogs,
    generateComplianceReport,
    cleanupExpiredLogs
  } = useRbac();

  // Fetch audit logs on page load
  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
  };

  const handleCloseViewer = () => {
    setSelectedLog(null);
  };

  const handleFilterChange = async (filters: any) => {
    try {
      await fetchAuditLogs(filters);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply filters',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateReport = () => {
    setIsReportFormOpen(true);
  };

  const handleReportSubmit = async (data: any) => {
    try {
      await generateComplianceReport(data);
      toast({
        title: 'Success',
        description: 'Compliance report generated successfully',
      });
      setIsReportFormOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate compliance report',
        variant: 'destructive',
      });
    }
  };

  const handleCloseReportForm = () => {
    setIsReportFormOpen(false);
  };

  const handleCleanupExpiredLogs = async () => {
    try {
      await cleanupExpiredLogs();
      toast({
        title: 'Success',
        description: 'Expired audit logs cleaned up successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clean up expired logs',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center mb-4 text-sm text-gray-500">
        <a href="/dashboard" className="hover:text-gray-700">Dashboard</a>
        <ChevronRight className="h-4 w-4 mx-2" />
        <a href="/rbac" className="hover:text-gray-700">RBAC</a>
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