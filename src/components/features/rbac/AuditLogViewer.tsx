/**
 * AuditLogViewer Component
 * 
 * Displays detailed information about a specific audit log entry.
 * Shows user, action, entity, changes, and metadata information.
 */

import React, { useState } from 'react';
import { AuditLog } from '../../../types/rbac';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Spinner } from '../../ui/Spinner';

interface AuditLogViewerProps {
  auditLog: AuditLog;
  onClose?: () => void;
  onExport?: (auditLog: AuditLog) => void;
  onGenerateReport?: (auditLog: AuditLog) => void;
  className?: string;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  auditLog,
  onClose,
  onExport,
  onGenerateReport,
  className = '',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format changes object for display
  const formatChanges = (changes: Record<string, any> | undefined) => {
    if (!changes) return 'No changes recorded';
    
    return Object.entries(changes).map(([key, value]) => {
      const oldValue = typeof value.old === 'object' ? JSON.stringify(value.old) : value.old;
      const newValue = typeof value.new === 'object' ? JSON.stringify(value.new) : value.new;
      
      return (
        <div key={key} className="mb-2">
          <span className="font-medium">{key}:</span>
          <div className="ml-4">
            <div className="text-red-600">Old: {oldValue}</div>
            <div className="text-green-600">New: {newValue}</div>
          </div>
        </div>
      );
    });
  };

  // Format metadata object for display
  const formatMetadata = (metadata: Record<string, any> | undefined) => {
    if (!metadata) return 'No metadata available';
    
    return Object.entries(metadata).map(([key, value]) => (
      <div key={key} className="mb-2">
        <span className="font-medium">{key}:</span>
        <span className="ml-2">
          {typeof value === 'object' ? JSON.stringify(value) : value}
        </span>
      </div>
    ));
  };

  // Handle export button click
  const handleExport = async () => {
    if (!onExport) return;
    
    setIsExporting(true);
    try {
      await onExport(auditLog);
    } catch (error) {
      console.error('Error exporting audit log:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle generate report button click
  const handleGenerateReport = async () => {
    if (!onGenerateReport) return;
    
    setIsGeneratingReport(true);
    try {
      await onGenerateReport(auditLog);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Audit Log Details</h2>
        {onClose && (
          <Button 
            variant="tertiary" 
            onClick={onClose}
            aria-label="Close"
          >
            Close
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium mb-2">Basic Information</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">ID:</span>
                <span className="ml-2">{auditLog.id}</span>
              </div>
              <div>
                <span className="font-medium">Created:</span>
                <span className="ml-2">{formatDate(auditLog.created_at)}</span>
              </div>
              <div>
                <span className="font-medium">Updated:</span>
                <span className="ml-2">{formatDate(auditLog.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div>
            <h3 className="text-lg font-medium mb-2">User Information</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">User ID:</span>
                <span className="ml-2">{auditLog.user_id}</span>
              </div>
            </div>
          </div>

          {/* Action Information */}
          <div>
            <h3 className="text-lg font-medium mb-2">Action Information</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Action:</span>
                <span className="ml-2">{auditLog.action}</span>
              </div>
            </div>
          </div>

          {/* Entity Information */}
          <div>
            <h3 className="text-lg font-medium mb-2">Entity Information</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Entity Type:</span>
                <span className="ml-2">{auditLog.entity_type}</span>
              </div>
              <div>
                <span className="font-medium">Entity ID:</span>
                <span className="ml-2">{auditLog.entity_id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Changes Information */}
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Changes</h3>
          <div className="bg-gray-50 p-3 rounded-md">
            {formatChanges(auditLog.changes)}
          </div>
        </div>

        {/* Metadata Information */}
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Metadata</h3>
          <div className="bg-gray-50 p-3 rounded-md">
            {formatMetadata(auditLog.metadata)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-2">
          {onExport && (
            <Button 
              variant="default" 
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Spinner className="mr-2" size="small" />
                  Exporting...
                </>
              ) : (
                'Export'
              )}
            </Button>
          )}
          
          {onGenerateReport && (
            <Button 
              variant="default" 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <>
                  <Spinner className="mr-2" size="small" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}; 