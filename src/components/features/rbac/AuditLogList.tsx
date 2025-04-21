/**
 * AuditLogList Component
 * 
 * Displays a list of audit logs with filtering, pagination, and date range selection.
 * Provides actions for viewing detailed audit log information.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { useRbac } from '../../../hooks/useRbac';
import { AuditLog } from '../../../types/rbac';

export const AuditLogList: React.FC = () => {
  const { auditLogs } = useRbac();
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');

  useEffect(() => {
    auditLogs.fetch();
  }, [auditLogs.fetch]);

  const filteredLogs = auditLogs.data.filter((log: AuditLog) => {
    const matchesSearch = log.user_id.toLowerCase().includes(search.toLowerCase()) ||
                         log.entity_type.toLowerCase().includes(search.toLowerCase());
    
    const matchesAction = !actionFilter || log.action === actionFilter;
    const matchesEntityType = !entityTypeFilter || log.entity_type === entityTypeFilter;
    
    const logDate = new Date(log.created_at);
    const matchesDateRange = (!startDate || logDate >= startDate) && 
                           (!endDate || logDate <= endDate);

    return matchesSearch && matchesAction && matchesEntityType && matchesDateRange;
  });

  if (auditLogs.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (auditLogs.error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{auditLogs.error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Audit Logs</Typography>
      
      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Search"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          size="small"
          inputProps={{ 'aria-label': 'Search' }}
        />
        
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
          slotProps={{ 
            textField: { 
              size: 'small',
              inputProps: { 'aria-label': 'Start Date' }
            } 
          }}
        />
        
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          slotProps={{ 
            textField: { 
              size: 'small',
              inputProps: { 'aria-label': 'End Date' }
            } 
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="action-label">Action</InputLabel>
          <Select
            labelId="action-label"
            value={actionFilter}
            label="Action"
            onChange={(e: SelectChangeEvent) => setActionFilter(e.target.value)}
            inputProps={{ 'aria-label': 'Action' }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="create">Create</MenuItem>
            <MenuItem value="update">Update</MenuItem>
            <MenuItem value="delete">Delete</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="entity-type-label">Entity Type</InputLabel>
          <Select
            labelId="entity-type-label"
            value={entityTypeFilter}
            label="Entity Type"
            onChange={(e: SelectChangeEvent) => setEntityTypeFilter(e.target.value)}
            inputProps={{ 'aria-label': 'Entity Type' }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="role">Role</MenuItem>
            <MenuItem value="permission">Permission</MenuItem>
            <MenuItem value="user_role">User Role</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredLogs.map((log: AuditLog) => (
        <Paper key={log.id} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1">User: {log.user_id}</Typography>
          <Typography variant="body2">Action: {log.action}</Typography>
          <Typography variant="body2">
            Entity: {log.entity_type} ({log.entity_id})
          </Typography>
          <Typography variant="body2">
            Date: {new Date(log.created_at).toLocaleString()}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}; 