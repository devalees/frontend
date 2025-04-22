'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Select, SelectOption } from '@/components/ui/Select';
import { Grid } from '@/components/layout/Grid';
import { Link } from '@/components/ui/Link';
import { NavButton } from '@/components/ui/NavButton';
import { PaginatedList } from '@/components/PaginatedList';

// Import useEntity - this will be mocked in tests
import { useEntity } from '@/hooks/useEntity';

// Define types for the component props
interface OrganizationActivityProps {
  organizationId: string;
  testId?: string; // Added for testing
}

// Define types for filter options
type TimePeriod = 'last_week' | 'last_month' | 'last_quarter' | 'last_year' | 'all_time';
type ActivityType = 'all' | 'member' | 'department' | 'team' | 'project' | 'task';

// Define activity data type
interface ActivityItem {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    avatar_url: string;
  };
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  details: Record<string, any>;
}

interface ActivityData {
  activities: ActivityItem[];
  total_count: number;
  active_users: number;
  most_active_department: {
    id: string;
    name: string;
    activity_count: number;
  };
  most_active_team: {
    id: string;
    name: string;
    activity_count: number;
  };
}

/**
 * Organization Activity Component
 * 
 * Displays activity logs and metrics for an organization
 */
const OrganizationActivity: React.FC<OrganizationActivityProps> = ({ 
  organizationId,
  testId = 'organization-activity'
}) => {
  // Get organization activity data 
  const { getOrganizationActivity } = useEntity();
  
  // Component state
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('last_month');
  const [activityType, setActivityType] = useState<ActivityType>('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Get activity state
  const activityState = getOrganizationActivity(organizationId, {
    time_period: timePeriod,
    activity_type: activityType,
    page,
    page_size: pageSize
  });

  // Fetch page function for PaginatedList
  const fetchPage = useCallback(async (pageNumber: number) => {
    setPage(pageNumber);
    await getOrganizationActivity(organizationId, {
      time_period: timePeriod,
      activity_type: activityType,
      page: pageNumber,
      page_size: pageSize
    });
  }, [organizationId, timePeriod, activityType, pageSize, getOrganizationActivity]);

  // Handle refresh button click
  const handleRefresh = () => {
    getOrganizationActivity(organizationId, {
      time_period: timePeriod,
      activity_type: activityType,
      page,
      page_size: pageSize
    });
  };

  // Handle time period change
  const handleTimePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimePeriod = e.target.value as TimePeriod;
    setTimePeriod(newTimePeriod);
    setPage(1); // Reset page when filter changes
    getOrganizationActivity(organizationId, {
      time_period: newTimePeriod,
      activity_type: activityType,
      page: 1,
      page_size: pageSize
    });
  };

  // Handle activity type change
  const handleActivityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newActivityType = e.target.value as ActivityType;
    setActivityType(newActivityType);
    setPage(1); // Reset page when filter changes
    getOrganizationActivity(organizationId, {
      time_period: timePeriod,
      activity_type: newActivityType,
      page: 1,
      page_size: pageSize
    });
  };

  // Expose methods for testing
  if (process.env.NODE_ENV === 'test') {
    (window as any).testHelpers = {
      ...(window as any).testHelpers,
      [`${testId}`]: {
        handleTimePeriodChange: (value: TimePeriod) => {
          // Create a synthetic event
          const event = { 
            target: { value }
          } as React.ChangeEvent<HTMLSelectElement>;
          handleTimePeriodChange(event);
        },
        handleActivityTypeChange: (value: ActivityType) => {
          // Create a synthetic event
          const event = { 
            target: { value }
          } as React.ChangeEvent<HTMLSelectElement>;
          handleActivityTypeChange(event);
        },
        handleRefresh: () => {
          handleRefresh();
        },
        fetchPage: fetchPage
      }
    };
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Time period options for the select
  const timePeriodOptions: SelectOption[] = [
    { value: 'last_week', label: 'Last Week' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'all_time', label: 'All Time' }
  ];

  // Activity type options for the select
  const activityTypeOptions: SelectOption[] = [
    { value: 'all', label: 'All Activities' },
    { value: 'member', label: 'Member Activities' },
    { value: 'department', label: 'Department Activities' },
    { value: 'team', label: 'Team Activities' },
    { value: 'project', label: 'Project Activities' },
    { value: 'task', label: 'Task Activities' }
  ];

  // Loading state
  if (activityState && activityState.loading && !activityState.data) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner data-testid="loading-spinner" size="large" />
      </div>
    );
  }

  // Error state
  if (activityState && activityState.error && !activityState.data) {
    return (
      <Card className="mb-6 bg-red-50">
        <CardContent className="p-6">
          <div className="text-red-600 font-medium">
            {activityState.error.message || 'Failed to load activity data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total pages
  const totalPages = activityState?.data 
    ? Math.ceil((activityState.data as ActivityData).total_count / pageSize)
    : 0;

  // Render activity item
  const renderActivityItem = (activity: ActivityItem) => (
    <div className="flex items-center gap-4 border-b border-gray-100 py-3" data-testid="activity-item">
      <div className="w-40 text-sm text-gray-500">
        {formatDate(activity.timestamp)}
      </div>
      <div className="w-40">
        <Link 
          href={`/entities/team-members/${activity.user.id}`}
          variant="primary"
        >
          {activity.user.name}
        </Link>
      </div>
      <div className="w-24 text-gray-700">
        {activity.action}
      </div>
      <div className="flex-1">
        <Link 
          href={`/entities/${activity.entity_type}s/${activity.entity_id}`}
          variant="primary"
        >
          {activity.entity_type}: {activity.entity_name}
        </Link>
      </div>
      <div className="w-60 text-sm text-gray-500 truncate">
        {activity.details ? JSON.stringify(activity.details).substring(0, 30) + '...' : 'N/A'}
      </div>
    </div>
  );

  return (
    <div className="space-y-6" data-testid={testId}>
      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Organization Activity</h2>
        <div className="flex items-center space-x-4">
          <Select
            data-testid="time-period-selector"
            value={timePeriod}
            onChange={handleTimePeriodChange}
            className="w-40"
            options={timePeriodOptions}
          />
          <Select
            data-testid="activity-type-selector"
            value={activityType}
            onChange={handleActivityTypeChange}
            className="w-48"
            options={activityTypeOptions}
          />
          <Button
            data-testid="refresh-activity-button"
            variant="outline"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Activity Summary */}
      <Grid cols={3} gap={4}>
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-primary-600">
              {activityState?.data ? (activityState.data as ActivityData).active_users : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Active Department</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {activityState?.data && (activityState.data as ActivityData).most_active_department ? (
              <>
                <div className="text-xl font-semibold text-primary-600">
                  <Link 
                    href={`/entities/departments/${(activityState.data as ActivityData).most_active_department.id}`}
                    variant="primary"
                  >
                    {(activityState.data as ActivityData).most_active_department.name}
                  </Link>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {(activityState.data as ActivityData).most_active_department.activity_count} activities
                </div>
              </>
            ) : (
              <div className="text-gray-500">N/A</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Active Team</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {activityState?.data && (activityState.data as ActivityData).most_active_team ? (
              <>
                <div className="text-xl font-semibold text-primary-600">
                  <Link 
                    href={`/entities/teams/${(activityState.data as ActivityData).most_active_team.id}`}
                    variant="primary"
                  >
                    {(activityState.data as ActivityData).most_active_team.name}
                  </Link>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {(activityState.data as ActivityData).most_active_team.activity_count} activities
                </div>
              </>
            ) : (
              <div className="text-gray-500">N/A</div>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Activity Log */}
      <Card data-testid="activity-log">
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center font-medium text-gray-700 border-b pb-2">
            <div className="w-40">Time</div>
            <div className="w-40">User</div>
            <div className="w-24">Action</div>
            <div className="flex-1">Entity</div>
            <div className="w-60">Details</div>
          </div>
          
          <PaginatedList
            data={activityState?.data ? (activityState.data as ActivityData).activities : []}
            totalPages={totalPages}
            currentPage={page}
            isLoading={!!activityState?.loading}
            error={activityState?.error || null}
            fetchPage={fetchPage}
            renderItem={renderActivityItem}
            emptyMessage="No activity records found"
            errorMessage="Failed to load activity data"
            keyExtractor={(item) => item.id}
            className="mt-2"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationActivity; 