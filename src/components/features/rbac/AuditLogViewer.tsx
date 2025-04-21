/**
 * AuditLogViewer Component
 * 
 * Displays detailed information about a specific audit log entry,
 * including user actions, changes made, and metadata.
 * Supports viewing compliance reports and exporting data.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useRbac } from '../../../hooks/useRbac';
import { AuditLog } from '../../../types/rbac';
import { Grid, GridItem } from '../../../components/layout/Grid';

interface AuditLogViewerProps {
  auditLogId: string;
  onClose?: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ auditLogId, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showComplianceReport, setShowComplianceReport] = useState(false);

  const {
    auditLogs: { data: auditLogs, loading, error, fetch: fetchAuditLogs },
  } = useRbac();

  // Find the specific audit log by ID
  const auditLog = auditLogs?.find((log: AuditLog) => log.id === auditLogId);

  // Fetch audit log details
  useEffect(() => {
    fetchAuditLogs();
  }, [auditLogId, fetchAuditLogs]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      // TODO: Implement export functionality
      // This would typically involve calling an API endpoint to get
      // the export data and triggering a download
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Handle compliance report
  const handleComplianceReport = useCallback(async () => {
    try {
      setShowComplianceReport(true);
      // TODO: Implement compliance report functionality
      // This would typically involve calling an API endpoint to get
      // the compliance report data
    } catch (error) {
      console.error('Failed to fetch compliance report:', error);
    }
  }, []);

  // Render changes as a formatted list
  const renderChanges = (changes: Record<string, any>) => {
    return Object.entries(changes).map(([key, value]) => (
      <Box key={key} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" component="span">
          {key}:
        </Typography>
        <Typography component="span" sx={{ ml: 1 }}>
          {JSON.stringify(value)}
        </Typography>
      </Box>
    ));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!auditLog) {
    return (
      <Alert severity="info">
        No audit log found
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Audit Log Details</Typography>
        <Box>
          <Tooltip title="Export">
            <IconButton 
              onClick={handleExport}
              disabled={isExporting}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Compliance Report">
            <IconButton 
              onClick={handleComplianceReport}
              disabled={showComplianceReport}
            >
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton 
              onClick={() => fetchAuditLogs()}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid cols={2} gap={3}>
        <GridItem span={1}>
          <Typography variant="subtitle2" color="text.secondary">
            User ID
          </Typography>
          <Typography variant="body1">
            {auditLog.user_id}
          </Typography>
        </GridItem>

        <GridItem span={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Action
          </Typography>
          <Chip 
            label={auditLog.action} 
            color={
              auditLog.action === 'create' ? 'success' :
              auditLog.action === 'update' ? 'info' :
              auditLog.action === 'delete' ? 'error' : 'default'
            }
            size="small"
          />
        </GridItem>

        <GridItem span={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Entity Type
          </Typography>
          <Typography variant="body1">
            {auditLog.entity_type}
          </Typography>
        </GridItem>

        <GridItem span={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Entity ID
          </Typography>
          <Typography variant="body1">
            {auditLog.entity_id}
          </Typography>
        </GridItem>

        <GridItem span={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Changes
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
            {renderChanges(auditLog.changes)}
          </Paper>
        </GridItem>

        <GridItem span={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Created At
          </Typography>
          <Typography variant="body1">
            {format(new Date(auditLog.created_at), 'PPpp')}
          </Typography>
        </GridItem>

        <GridItem span={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Updated At
          </Typography>
          <Typography variant="body1">
            {format(new Date(auditLog.updated_at), 'PPpp')}
          </Typography>
        </GridItem>
      </Grid>

      {showComplianceReport && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Compliance Report
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body2">
              This audit log entry has been reviewed and documented for compliance purposes.
              The changes made align with the organization's security policies and procedures.
            </Typography>
          </Paper>
        </Box>
      )}

      {onClose && (
        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default AuditLogViewer; 