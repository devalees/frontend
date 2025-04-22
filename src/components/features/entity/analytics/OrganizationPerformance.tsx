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
interface OrganizationPerformanceProps {
  organizationId: string;
}

// Define types for filter options
type TimePeriod = 'last_week' | 'last_month' | 'last_quarter' | 'last_year' | 'all_time';
type MetricType = 'all' | 'productivity' | 'efficiency' | 'quality' | 'innovation';

// Define performance data type
interface PerformanceData {
  overall_score: number;
  productivity_score: number;
  efficiency_score: number;
  quality_score: number;
  innovation_score: number;
  department_performance: {
    id: string;
    name: string;
    overall_score: number;
  }[];
  team_performance: {
    id: string;
    name: string;
    overall_score: number;
  }[];
  historical_data: {
    period: string;
    overall_score: number;
    productivity_score: number;
    efficiency_score: number;
    quality_score: number;
    innovation_score: number;
  }[];
}

/**
 * Organization Performance Component
 * 
 * Displays performance metrics and comparisons for an organization
 */
const OrganizationPerformance: React.FC<OrganizationPerformanceProps> = ({ organizationId }) => {
  // Get organization performance data 
  const { getOrganizationPerformance } = useEntity();
  
  // Component state
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('last_quarter');
  const [metricType, setMetricType] = useState<MetricType>('all');

  // Get performance state
  const performanceState = getOrganizationPerformance(organizationId, {
    time_period: timePeriod,
    metric_type: metricType
  });

  // Handle refresh button click
  const handleRefresh = () => {
    getOrganizationPerformance(organizationId, {
      time_period: timePeriod,
      metric_type: metricType
    });
  };

  // Handle time period change
  const handleTimePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimePeriod = e.target.value as TimePeriod;
    setTimePeriod(newTimePeriod);
    getOrganizationPerformance(organizationId, {
      time_period: newTimePeriod,
      metric_type: metricType
    });
  };

  // Handle metric type change
  const handleMetricTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMetricType = e.target.value as MetricType;
    setMetricType(newMetricType);
    getOrganizationPerformance(organizationId, {
      time_period: timePeriod,
      metric_type: newMetricType
    });
  };

  // Format score values as percentages
  const formatScore = (score: number) => {
    return `${Math.round(score)}%`;
  };

  // Time period options for the select
  const timePeriodOptions: SelectOption[] = [
    { value: 'last_week', label: 'Last Week' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'all_time', label: 'All Time' }
  ];

  // Metric type options for the select
  const metricTypeOptions: SelectOption[] = [
    { value: 'all', label: 'All Metrics' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'efficiency', label: 'Efficiency' },
    { value: 'quality', label: 'Quality' },
    { value: 'innovation', label: 'Innovation' }
  ];

  // Loading state
  if (performanceState && performanceState.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner data-testid="loading-spinner" size="large" />
      </div>
    );
  }

  // Error state
  if (performanceState && performanceState.error) {
    return (
      <Card className="mb-6 bg-red-50">
        <CardContent className="p-6">
          <div className="text-red-600 font-medium">
            {performanceState.error.message || 'Failed to load performance data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!performanceState || !performanceState.data) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-gray-500">No performance data available</div>
        </CardContent>
      </Card>
    );
  }

  const performanceData = performanceState.data as PerformanceData;

  // Determine color class based on score
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6" data-testid="organization-performance">
      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Organization Performance</h2>
        <div className="flex items-center space-x-4">
          <Select
            data-testid="time-period-selector"
            value={timePeriod}
            onChange={handleTimePeriodChange}
            className="w-40"
            options={timePeriodOptions}
          />
          <Select
            data-testid="metric-type-selector"
            value={metricType}
            onChange={handleMetricTypeChange}
            className="w-48"
            options={metricTypeOptions}
          />
          <Button
            data-testid="refresh-performance-button"
            variant="outline"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className={`text-6xl font-bold ${getScoreColorClass(performanceData.overall_score)}`}>
            {formatScore(performanceData.overall_score)}
          </div>
          <div className="w-2/3 mx-auto bg-gray-200 rounded-full h-4 mt-8">
            <div 
              className="bg-primary-600 h-4 rounded-full" 
              style={{ width: `${performanceData.overall_score}%` }}
            ></div>
          </div>
          <div className="mt-6">
            <NavButton
              href={`/entities/organizations/${organizationId}/performance/details`}
              variant="outline"
              size="small"
            >
              View Detailed Report
            </NavButton>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Grid cols={4} gap={4}>
        <Card>
          <CardHeader>
            <CardTitle>Productivity</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-3xl font-bold ${getScoreColorClass(performanceData.productivity_score)}`}>
              {formatScore(performanceData.productivity_score)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${performanceData.productivity_score}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-3xl font-bold ${getScoreColorClass(performanceData.efficiency_score)}`}>
              {formatScore(performanceData.efficiency_score)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${performanceData.efficiency_score}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-3xl font-bold ${getScoreColorClass(performanceData.quality_score)}`}>
              {formatScore(performanceData.quality_score)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${performanceData.quality_score}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Innovation</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-3xl font-bold ${getScoreColorClass(performanceData.innovation_score)}`}>
              {formatScore(performanceData.innovation_score)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${performanceData.innovation_score}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Department Performance */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Department Performance</CardTitle>
          <Link 
            href={`/entities/organizations/${organizationId}/departments`}
            variant="primary"
            size="small"
          >
            View All Departments
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" data-testid="department-performance">
            {performanceData.department_performance.map(department => (
              <div key={department.id} className="flex items-center space-x-4">
                <div className="w-1/4 font-medium truncate">
                  <Link 
                    href={`/entities/departments/${department.id}`}
                    variant="primary"
                  >
                    {department.name}
                  </Link>
                </div>
                <div className="w-3/4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary-600 h-2.5 rounded-full" 
                        style={{ width: `${department.overall_score}%` }}
                      ></div>
                    </div>
                    <div className={`ml-4 font-medium ${getScoreColorClass(department.overall_score)}`}>
                      {formatScore(department.overall_score)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Team Performance</CardTitle>
          <Link 
            href={`/entities/organizations/${organizationId}/teams`}
            variant="primary"
            size="small"
          >
            View All Teams
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" data-testid="team-performance">
            {performanceData.team_performance.map(team => (
              <div key={team.id} className="flex items-center space-x-4">
                <div className="w-1/4 font-medium truncate">
                  <Link 
                    href={`/entities/teams/${team.id}`}
                    variant="primary"
                  >
                    {team.name}
                  </Link>
                </div>
                <div className="w-3/4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary-600 h-2.5 rounded-full" 
                        style={{ width: `${team.overall_score}%` }}
                      ></div>
                    </div>
                    <div className={`ml-4 font-medium ${getScoreColorClass(team.overall_score)}`}>
                      {formatScore(team.overall_score)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Performance Trends</CardTitle>
          <NavButton
            href={`/entities/organizations/${organizationId}/performance/trends`}
            variant="outline"
            size="small"
          >
            View Detailed Trends
          </NavButton>
        </CardHeader>
        <CardContent>
          <div data-testid="performance-chart" className="h-80 w-full">
            {/* Here we would render a chart component with the historical data */}
            <div className="flex justify-center items-center h-full bg-gray-50 rounded-md">
              <p className="text-gray-500">
                Performance trends visualization would be rendered here using chart library
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationPerformance; 