/**
 * AuditLogViewer Component
 * 
 * Displays detailed information about a selected audit log entry.
 */

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '../../ui/Button';
import { X, Clock, User, Activity, Database, FileText, Globe, Monitor } from 'lucide-react';

// Using the mock interface from AuditLogList
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

interface AuditLogViewerProps {
  log: AuditLogItem;
  onClose: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  log,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Audit Log Details
          </CardTitle>
          <Button 
            variant="tertiary" 
            size="small" 
            onClick={onClose}
            className="p-1 h-auto"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Timestamp
              </div>
              <div className="text-base">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500 flex items-center">
                <User className="h-4 w-4 mr-1" />
                User
              </div>
              <div className="text-base">{log.user_id}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500 flex items-center">
                <Activity className="h-4 w-4 mr-1" />
                Action
              </div>
              <div className="text-base">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  log.action === 'CREATE' ? 'bg-green-100 text-green-800' : 
                  log.action === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' : 
                  log.action === 'DELETE' ? 'bg-red-100 text-red-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {log.action}
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500 flex items-center">
                <Database className="h-4 w-4 mr-1" />
                Resource Type
              </div>
              <div className="text-base">{log.resource_type}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500 flex items-center">
                <Database className="h-4 w-4 mr-1" />
                Resource ID
              </div>
              <div className="text-base font-mono text-sm bg-gray-100 p-1 rounded">{log.resource_id}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500 flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                IP Address
              </div>
              <div className="text-base">{log.ip_address}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500 flex items-center">
                <Monitor className="h-4 w-4 mr-1" />
                User Agent
              </div>
              <div className="text-base truncate">{log.user_agent}</div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500 flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Details
            </div>
            <div className="text-base bg-gray-50 p-3 rounded border">{log.details}</div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </CardFooter>
      </Card>
    </div>
  );
}; 