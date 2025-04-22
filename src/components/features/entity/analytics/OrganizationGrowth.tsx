'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Select, SelectOption } from '@/components/ui/Select';
import { Grid } from '@/components/layout/Grid';
import { Link } from '@/components/ui/Link';
import { NavButton } from '@/components/ui/NavButton';

// Import useEntity from hooks
import { useEntity } from '@/hooks/useEntity';

// Define types for the component props
interface OrganizationGrowthProps {
  organizationId: string;
}

// Define types for filter options
type TimePeriod = 'last_week' | 'last_month' | 'last_quarter' | 'last_year' | 'all_time';
type GroupBy = 'day' | 'week' | 'month' | 'quarter' | 'year';

// Define growth data type
interface GrowthData {
  employee_growth: {
    current_count: number;
    growth_rate: number;
    historical_data: {
      period: string;
      count: number;
    }[];
  };
  department_growth: {
    current_count: number;
    growth_rate: number;
    historical_data: {
      period: string;
      count: number;
    }[];
  };
  team_growth: {
    current_count: number;
    growth_rate: number;
    historical_data: {
      period: string;
      count: number;
    }[];
  };
  forecast: {
    employees_next_period: number;
    departments_next_period: number;
    teams_next_period: number;
  };
}

/**
 * Organization Growth Component
 * 
 * Displays growth metrics and trends for an organization
 */
const OrganizationGrowth: React.FC<OrganizationGrowthProps> = ({ organizationId }) => {
  // Get organization growth data 
  const { getOrganizationGrowth } = useEntity();
  
  // Component state
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('last_year');
  const [groupBy, setGroupBy] = useState<GroupBy>('month');

  // Get growth state
  const growthState = getOrganizationGrowth(organizationId, {
    time_period: timePeriod,
    group_by: groupBy
  });

  // Handle refresh button click
  const handleRefresh = () => {
    getOrganizationGrowth(organizationId, {
      time_period: timePeriod,
      group_by: groupBy
    });
  };

  // Handle time period change
  const handleTimePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimePeriod = e.target.value as TimePeriod;
    setTimePeriod(newTimePeriod);
    getOrganizationGrowth(organizationId, {
      time_period: newTimePeriod,
      group_by: groupBy
    });
  };

  // Handle group by change
  const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGroupBy = e.target.value as GroupBy;
    setGroupBy(newGroupBy);
    getOrganizationGrowth(organizationId, {
      time_period: timePeriod,
      group_by: newGroupBy
    });
  };

  // Format percentage values
  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  // Time period options for the select
  const timePeriodOptions: SelectOption[] = [
    { value: 'last_week', label: 'Last Week' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'all_time', label: 'All Time' }
  ];

  // Group by options for the select
  const groupByOptions: SelectOption[] = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'quarter', label: 'Quarterly' },
    { value: 'year', label: 'Yearly' }
  ];

  // Loading state
  if (growthState && growthState.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner data-testid="loading-spinner" size="large" />
      </div>
    );
  }

  // Error state
  if (growthState && growthState.error) {
    return (
      <Card className="mb-6 bg-red-50">
        <CardContent className="p-6">
          <div className="text-red-600 font-medium">
            {growthState.error.message || 'Failed to load growth data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!growthState || !growthState.data) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-gray-500">No growth data available</div>
        </CardContent>
      </Card>
    );
  }

  const growthData = growthState.data as GrowthData;

  return (
    <div className="space-y-6" data-testid="organization-growth">
      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Organization Growth</h2>
        <div className="flex items-center space-x-4">
          <Select
            data-testid="time-period-selector"
            value={timePeriod}
            onChange={handleTimePeriodChange}
            className="w-40"
            options={timePeriodOptions}
          />
          <Select
            data-testid="group-by-selector"
            value={groupBy}
            onChange={handleGroupByChange}
            className="w-40"
            options={groupByOptions}
          />
          <Button
            data-testid="refresh-growth-button"
            variant="outline"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Growth Summary */}
      <Grid cols={3} gap={4}>
        <Card>
          <CardHeader>
            <CardTitle>Employee Growth</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-primary-600">
              {growthData.employee_growth.current_count}
            </div>
            <div className={`mt-2 font-medium ${growthData.employee_growth.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(growthData.employee_growth.growth_rate)}
              {growthData.employee_growth.growth_rate >= 0 ? ' increase' : ' decrease'}
            </div>
            <div className="mt-4">
              <Link 
                href={`/entities/organizations/${organizationId}/team-members`}
                variant="primary"
                size="small"
              >
                View Team Members
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Growth</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-primary-600">
              {growthData.department_growth.current_count}
            </div>
            <div className={`mt-2 font-medium ${growthData.department_growth.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(growthData.department_growth.growth_rate)}
              {growthData.department_growth.growth_rate >= 0 ? ' increase' : ' decrease'}
            </div>
            <div className="mt-4">
              <Link 
                href={`/entities/organizations/${organizationId}/departments`}
                variant="primary"
                size="small"
              >
                View Departments
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Growth</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-primary-600">
              {growthData.team_growth.current_count}
            </div>
            <div className={`mt-2 font-medium ${growthData.team_growth.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(growthData.team_growth.growth_rate)}
              {growthData.team_growth.growth_rate >= 0 ? ' increase' : ' decrease'}
            </div>
            <div className="mt-4">
              <Link 
                href={`/entities/organizations/${organizationId}/teams`}
                variant="primary"
                size="small"
              >
                View Teams
              </Link>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Growth Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div data-testid="growth-chart" className="h-80 w-full">
            {/* Here we would render a chart component with the historical data */}
            <div className="flex justify-center items-center h-full bg-gray-50 rounded-md">
              <p className="text-gray-500">
                Growth trends visualization would be rendered here using chart library
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <Grid cols={3} gap={4}>
            <div className="text-center p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-2">Projected Employees</h3>
              <div className="text-3xl font-bold text-secondary-600">
                {growthData.forecast.employees_next_period}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Next {groupBy}
              </div>
            </div>

            <div className="text-center p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-2">Projected Departments</h3>
              <div className="text-3xl font-bold text-secondary-600">
                {growthData.forecast.departments_next_period}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Next {groupBy}
              </div>
            </div>

            <div className="text-center p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-2">Projected Teams</h3>
              <div className="text-3xl font-bold text-secondary-600">
                {growthData.forecast.teams_next_period}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Next {groupBy}
              </div>
            </div>
          </Grid>
          
          <div className="flex justify-center mt-8">
            <NavButton
              href={`/entities/organizations/${organizationId}/planning`}
              variant="primary"
            >
              View Growth Planning
            </NavButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationGrowth; 