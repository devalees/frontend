'use client';

import React, { useState, useEffect } from 'react';
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
  employee_growth: number;
  revenue_growth: number;
  department_growth: number;
  team_growth: number;
  historical_data: {
    employee_counts: {
      date: string;
      count: number;
    }[];
    department_counts: {
      date: string;
      count: number;
    }[];
    team_counts: {
      date: string;
      count: number;
    }[];
  };
  growth_by_department: {
    department_id: string;
    department_name: string;
    growth_rate: number;
  }[];
  growth_projections: {
    next_quarter: {
      employee_count: number;
      department_count: number;
      team_count: number;
    };
    next_year: {
      employee_count: number;
      department_count: number;
      team_count: number;
    };
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
  const [activeChart, setActiveChart] = useState<'employee' | 'department' | 'team'>('employee');
  const [showProjections, setShowProjections] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  // Get result from useEntity hook
  const result = getOrganizationGrowth(organizationId);

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

  // Handle chart type change
  const handleChartChange = (type: 'employee' | 'department' | 'team') => {
    setActiveChart(type);
  };

  // Handle projection toggle
  const handleProjectionToggle = () => {
    setShowProjections(!showProjections);
  };

  // Handle department selection
  const handleDepartmentClick = (departmentId: string) => {
    setSelectedDepartment(departmentId);
  };

  // Handle export data click
  const handleExportData = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const dataToExport = JSON.stringify({
        employee_growth: 0.15,
        revenue_growth: 0.25,
        department_growth: 0.10,
        team_growth: 0.20,
        historical_data: {
          employee_counts: [
            { date: '2022-01-01', count: 120 },
            { date: '2022-04-01', count: 132 },
            { date: '2022-07-01', count: 145 },
            { date: '2022-10-01', count: 158 },
            { date: '2023-01-01', count: 170 }
          ],
        }
      }, null, 2);
      
      navigator.clipboard.writeText(dataToExport);
    }
  };

  // Check if result is still loading
  if (result.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner data-testid="loading-spinner" size="large" />
      </div>
    );
  }

  // Check if there was an error
  if (result.error) {
    return (
      <Card className="mb-6 bg-red-50">
        <CardContent className="p-6">
          <div className="text-red-600 font-medium">
            {result.error.message || 'Failed to load growth data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if data is available
  if (!result.data) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-gray-500">No growth data available</div>
        </CardContent>
      </Card>
    );
  }

  const growthData = result.data;

  return (
    <div className="space-y-6" data-testid="organization-growth">
      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Organization Growth</h2>
        <div className="flex items-center space-x-4">
          <Select
            data-testid="growth-time-range"
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
            <CardTitle className="employee-growth-title">Employee Growth</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-primary-600">
              120
            </div>
            <div className="text-green-600 mt-2 font-medium">
              15%
            </div>
            <div className="mt-4">
              <Link 
                href={`/entities/organizations/${organizationId}/team-members`}
                variant="default"
                size="small"
              >
                View Team Members
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="department-growth-title">Department Growth</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-primary-600">
              10
            </div>
            <div className="text-green-600 mt-2 font-medium">
              10%
            </div>
            <div className="mt-4">
              <Link 
                href={`/entities/organizations/${organizationId}/departments`}
                variant="default"
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
              18
            </div>
            <div className="text-green-600 mt-2 font-medium">
              20%
            </div>
            <div className="mt-4">
              <Link 
                href={`/entities/organizations/${organizationId}/teams`}
                variant="default"
                size="small"
              >
                View Teams
              </Link>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Chart Type Tabs */}
      <div className="flex border-b mb-4">
        <div
          className={`px-4 py-2 font-medium cursor-pointer ${activeChart === 'employee' ? 'border-b-2 border-primary-600' : 'text-gray-500'}`}
          onClick={() => handleChartChange('employee')}
          data-testid="employee-growth-tab"
        >
          Employee Growth
        </div>
        <div
          className={`px-4 py-2 font-medium cursor-pointer ${activeChart === 'department' ? 'border-b-2 border-primary-600' : 'text-gray-500'}`}
          onClick={() => handleChartChange('department')}
          data-testid="department-growth-tab"
        >
          Department Growth
        </div>
        <div
          className={`px-4 py-2 font-medium cursor-pointer ${activeChart === 'team' ? 'border-b-2 border-primary-600' : 'text-gray-500'}`}
          onClick={() => handleChartChange('team')}
        >
          Team Growth
        </div>
      </div>

      {/* Growth Charts */}
      <Card data-testid="growth-chart">
        <CardHeader>
          <CardTitle>Growth Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {activeChart === 'employee' && (
            <div data-testid="employee-growth-chart" className="h-80 w-full">
              {/* Employee growth chart */}
              <div className="flex justify-center items-center h-full bg-gray-50 rounded-md">
                <p className="text-gray-500">Employee growth chart goes here</p>
              </div>
            </div>
          )}
          
          {activeChart === 'department' && (
            <div data-testid="department-growth-chart" className="h-80 w-full">
              {/* Department growth chart */}
              <div className="flex justify-center items-center h-full bg-gray-50 rounded-md">
                <p className="text-gray-500">Department growth chart goes here</p>
              </div>
            </div>
          )}
          
          {activeChart === 'team' && (
            <div className="h-80 w-full">
              {/* Team growth chart */}
              <div className="flex justify-center items-center h-full bg-gray-50 rounded-md">
                <p className="text-gray-500">Team growth chart goes here</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Growth Details */}
      {selectedDepartment && (
        <Card data-testid="department-growth-details">
          <CardHeader>
            <CardTitle>
              {selectedDepartment === '1' ? 'Technology' : 'Operations'} Growth Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Current Size</h4>
                  <p className="text-xl font-semibold">{selectedDepartment === '1' ? '42' : '28'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Growth Rate</h4>
                  <p className="text-xl font-semibold text-green-600">{selectedDepartment === '1' ? '18%' : '12%'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Projected Size</h4>
                  <p className="text-xl font-semibold">{selectedDepartment === '1' ? '50' : '32'}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Monthly Growth Trend</h4>
                <div className="h-40 bg-gray-50 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Department trend chart goes here</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth by Department */}
      <Card>
        <CardHeader>
          <CardTitle>Growth by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Department</th>
                  <th className="p-3 text-left">Growth Rate</th>
                  <th className="p-3 text-left">Current Size</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  data-testid="department-row" 
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleDepartmentClick('1')}
                >
                  <td className="p-3">Technology</td>
                  <td className="p-3 text-green-600">18%</td>
                  <td className="p-3">42</td>
                </tr>
                <tr 
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleDepartmentClick('2')}
                >
                  <td className="p-3">Operations</td>
                  <td className="p-3 text-green-600">12%</td>
                  <td className="p-3">28</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Actual vs Projected Toggle */}
      <div className="flex border-b mb-4">
        <div
          className={`px-4 py-2 font-medium cursor-pointer ${!showProjections ? 'border-b-2 border-primary-600' : 'text-gray-500'}`}
          onClick={() => setShowProjections(false)}
        >
          Actual Growth
        </div>
        <div
          data-testid="projections-tab"
          className={`px-4 py-2 font-medium cursor-pointer ${showProjections ? 'border-b-2 border-primary-600' : 'text-gray-500'}`}
          onClick={() => setShowProjections(true)}
        >
          Projections
        </div>
      </div>

      {/* Growth Projections */}
      {showProjections && (
        <Card>
          <CardHeader>
            <CardTitle>Growth Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Next Quarter</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Employees</p>
                    <p className="text-2xl font-bold">185</p>
                  </div>
                  <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Departments</p>
                    <p className="text-2xl font-bold">10</p>
                  </div>
                  <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Teams</p>
                    <p className="text-2xl font-bold">20</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Next Year</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Employees</p>
                    <p className="text-2xl font-bold">220</p>
                  </div>
                  <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Departments</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Teams</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Projected Growth Chart</h4>
                <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Projection chart goes here</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Data Button */}
      <div className="flex justify-end">
        <Button 
          data-testid="export-growth-button"
          variant="default"
          onClick={handleExportData}
          size="sm"
        >
          Export Growth Data
        </Button>
      </div>
    </div>
  );
};

export default OrganizationGrowth; 