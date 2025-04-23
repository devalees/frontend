'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { ArrowLeft, Activity, BarChart3, LineChart, PieChart } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

// Analytics components
import OrganizationAnalytics from '@/components/features/entity/analytics/OrganizationAnalytics';
import OrganizationActivity from '@/components/features/entity/analytics/OrganizationActivity';
import OrganizationPerformance from '@/components/features/entity/analytics/OrganizationPerformance';
import OrganizationGrowth from '@/components/features/entity/analytics/OrganizationGrowth';

// Store and hooks
import { useEntityStore } from '@/store/slices/entitySlice';

/**
 * Organization Analytics Page
 * Displays comprehensive analytics for an organization with tabs for different views
 */
const OrganizationAnalyticsPage = () => {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');

  // Get organization name for page title
  const { getOrganization } = useEntityStore();
  const [organization, setOrganization] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch organization details for the breadcrumb and title
  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      try {
        setIsLoading(true);
        const org = await getOrganization(organizationId);
        setOrganization(org);
      } catch (error) {
        console.error('Failed to load organization details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationDetails();
  }, [organizationId, getOrganization]);

  // Breadcrumb items for navigation
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Entities', href: '/entities' },
    { label: 'Organizations', href: '/entities/organizations' },
    { 
      label: organization?.name || 'Organization', 
      href: `/entities/organizations/${organizationId}` 
    },
    { label: 'Analytics', href: `/entities/organizations/${organizationId}/analytics` }
  ];

  // Analytics tabs configuration
  const analyticsTabs = [
    { id: 'overview', label: 'Overview', icon: <PieChart className="h-4 w-4 mr-2" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="h-4 w-4 mr-2" /> },
    { id: 'performance', label: 'Performance', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    { id: 'growth', label: 'Growth', icon: <LineChart className="h-4 w-4 mr-2" /> }
  ];

  return (
    <div className="container mx-auto py-6 px-4" data-testid="organization-analytics-page">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-4">
            <NavButton variant="outline" size="icon" href={`/entities/organizations/${organizationId}`}>
              <ArrowLeft className="h-4 w-4" />
            </NavButton>
            <h1 className="text-2xl font-bold" data-testid="page-title">
              {isLoading ? (
                <Spinner size="small" className="mr-2" data-testid="title-loading-spinner" />
              ) : (
                organization?.name || 'Organization'
              )}{' '}
              Analytics
            </h1>
          </div>
          
          {!isLoading && (
            <div className="flex gap-2">
              <NavButton 
                href={`/entities/organizations/${organizationId}/edit`}
                variant="outline"
              >
                Edit Organization
              </NavButton>
              <NavButton 
                href={`/entities/organizations/${organizationId}/departments`}
                variant="outline"
              >
                View Departments
              </NavButton>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <Spinner size="large" data-testid="loading-spinner" />
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            {analyticsTabs.map(tab => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id}
                data-testid={`${tab.id}-tab`}
                className="flex items-center justify-center"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <OrganizationAnalytics organizationId={organizationId} />
          </TabsContent>

          <TabsContent value="activity">
            <OrganizationActivity organizationId={organizationId} />
          </TabsContent>

          <TabsContent value="performance">
            <OrganizationPerformance organizationId={organizationId} />
          </TabsContent>

          <TabsContent value="growth">
            <OrganizationGrowth organizationId={organizationId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default OrganizationAnalyticsPage; 