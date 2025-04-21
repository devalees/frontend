/**
 * AuditLogViewer Component
 * 
 * Displays detailed information about a specific audit log entry.
 */

import React from 'react';
import { AuditLog } from '../../../types/rbac';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { X, Clock, User, FileText, Tag, Database } from 'lucide-react';

interface AuditLogViewerProps {
  log: AuditLog;
  onClose: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  log,
  onClose,
}) => {
  // Format the timestamp to a readable format
  const formattedTimestamp = new Date(log.timestamp).toLocaleString();

  // Get a badge color based on the action type
  const getBadgeVariant = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'warning';
      case 'DELETE':
        return 'error';
      default:
        return 'info';
    }
  };

  // Format changes object for display
  const formatChanges = (changes: Record<string, any>) => {
    if (!changes || Object.keys(changes).length === 0) {
      return <p className="text-gray-500 italic">No changes recorded</p>;
    }

    return (
      <div className="space-y-2">
        {Object.entries(changes).map(([key, value]) => (
          <div key={key} className="grid grid-cols-3 gap-2 border-b pb-2">
            <span className="font-medium">{key}</span>
            <span className="col-span-2">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="audit-log-viewer">
      <Card className="w-full max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Audit Log Details: {log.action} {log.resource_type}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">Timestamp:</span>
              </div>
              <p className="text-sm ml-6">{formattedTimestamp}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">User ID:</span>
              </div>
              <p className="text-sm ml-6">{log.user_id}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">Action:</span>
              </div>
              <div className="ml-6">
                <Badge variant={getBadgeVariant(log.action)}>
                  {log.action}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">Resource Type:</span>
              </div>
              <p className="text-sm ml-6">{log.resource_type}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Database className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">Resource ID:</span>
              </div>
              <p className="text-sm ml-6">{log.resource_id}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Database className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">Organization Context:</span>
              </div>
              <p className="text-sm ml-6">{log.organization_context_id || 'None'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-md font-medium">Details</h3>
            <p className="text-sm p-3 bg-gray-50 rounded-md">{log.details}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-md font-medium">Changes</h3>
            <div className="p-3 bg-gray-50 rounded-md">
              {formatChanges(log.changes)}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={onClose} data-testid="close-viewer-btn">
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}; 