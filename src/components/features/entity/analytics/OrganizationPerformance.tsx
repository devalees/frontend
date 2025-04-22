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
type TrendPeriod = 'weekly' | 'monthly';

// Define performance data type to match the test mock data
interface PerformanceData {
  overall_score: number;
  metrics: {
    productivity: number;
    efficiency: number;
    quality: number;
    collaboration: number;
    innovation: number;
  };
  trends: {
    weekly: {
      date: string;
      score: number;
    }[];
    monthly: {
      date: string;
      score: number;
    }[];
  };
  team_performance: {
    team_id: string;
    team_name: string;
    score: number;
  }[];
  department_performance: {
    department_id: string;
    department_name: string;
    score: number;
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
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('weekly');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

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

  // Handle team click
  const handleTeamClick = (teamId: string, teamName: string) => {
    setSelectedTeam(teamName);
  };

  // Handle department click
  const handleDepartmentClick = (departmentId: string, departmentName: string) => {
    setSelectedDepartment(departmentName);
  };

  // Handle export data
  const handleExportData = () => {
    if (performanceState && performanceState.data) {
      navigator.clipboard.writeText(JSON.stringify(performanceState.data, null, 2));
    }
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
            data-testid="performance-time-filter"
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
          <Button
            data-testid="export-performance-button"
            variant="outline"
            onClick={handleExportData}
          >
            Export Data
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
            {performanceData.overall_score}
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
            <CardTitle data-testid="productivity-metric-title">Productivity</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-3xl font-bold ${getScoreColorClass(performanceData.metrics.productivity)}`}>
              {`${performanceData.metrics.productivity}%`}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${performanceData.metrics.productivity}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle data-testid="efficiency-metric-title">Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-3xl font-bold ${getScoreColorClass(performanceData.metrics.efficiency)}`}>
              {`${performanceData.metrics.efficiency}%`}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${performanceData.metrics.efficiency}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle data-testid="quality-metric-title">Quality</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-3xl font-bold ${getScoreColorClass(performanceData.metrics.quality)}`}>
              {`${performanceData.metrics.quality}%`}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${performanceData.metrics.quality}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle data-testid="innovation-metric-title">Innovation</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-3xl font-bold ${getScoreColorClass(performanceData.metrics.innovation)}`}>
              {`${performanceData.metrics.innovation}%`}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${performanceData.metrics.innovation}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{trendPeriod === 'weekly' ? 'Weekly Trends' : 'Monthly Trends'}</CardTitle>
            <div className="flex">
              <Button 
                data-testid="weekly-trends-tab"
                variant={trendPeriod === 'weekly' ? 'default' : 'outline'} 
                size="small"
                onClick={() => setTrendPeriod('weekly')}
                className="mr-2"
              >
                Weekly
              </Button>
              <Button 
                data-testid="monthly-trends-tab"
                variant={trendPeriod === 'monthly' ? 'default' : 'outline'} 
                size="small"
                onClick={() => setTrendPeriod('monthly')}
              >
                Monthly
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div data-testid="performance-chart" className="h-64 w-full">
            {/* Chart would be rendered here */}
            <div className="flex items-end justify-between h-full py-4">
              {performanceData.trends[trendPeriod].map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-primary-600 rounded-t w-12" 
                    style={{ height: `${item.score}%` }}
                  ></div>
                  <span className="text-xs mt-2">{item.date}</span>
                  <span className="text-xs font-medium">{item.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {performanceData.team_performance.map((team) => (
              <div 
                key={team.team_id} 
                data-testid="team-row"
                className="py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleTeamClick(team.team_id, team.team_name)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{team.team_name}</span>
                  <span className={`font-bold ${getScoreColorClass(team.score)}`}>{`${team.score}%`}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-primary-600 h-1.5 rounded-full" 
                    style={{ width: `${team.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {performanceData.department_performance.map((department) => (
              <div 
                key={department.department_id} 
                data-testid="department-row"
                className="py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleDepartmentClick(department.department_id, department.department_name)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{department.department_name}</span>
                  <span className={`font-bold ${getScoreColorClass(department.score)}`}>{`${department.score}%`}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-primary-600 h-1.5 rounded-full" 
                    style={{ width: `${department.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Details Modal */}
      {selectedTeam && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          data-testid="team-details-modal"
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedTeam} Performance Details</h3>
              <Button variant="ghost" size="small" onClick={() => setSelectedTeam(null)}>Close</Button>
            </div>
            <div className="space-y-4">
              {/* Team details would go here */}
              <p>Detailed performance metrics for {selectedTeam} team.</p>
            </div>
          </div>
        </div>
      )}

      {/* Department Details Modal */}
      {selectedDepartment && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          data-testid="department-details-modal"
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedDepartment} Performance Details</h3>
              <Button variant="ghost" size="small" onClick={() => setSelectedDepartment(null)}>Close</Button>
            </div>
            <div className="space-y-4">
              {/* Department details would go here */}
              <p>Detailed performance metrics for {selectedDepartment} department.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationPerformance; 