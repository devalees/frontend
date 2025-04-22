'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import OrganizationAnalytics from '@/components/features/entity/analytics/OrganizationAnalytics';
import Link from '@/components/ui/Link';

/**
 * Organization Analytics Page
 */
const OrganizationAnalyticsPage = () => {
  const params = useParams();
  const organizationId = params.id as string;

  const breadcrumbItems = [
    { label: 'Organizations', href: '/entities/organizations' },
    { label: 'Organization Details', href: `/entities/organizations/${organizationId}` },
    { label: 'Analytics', href: `/entities/organizations/${organizationId}/analytics` }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      
      <OrganizationAnalytics organizationId={organizationId} />
    </div>
  );
};

export default OrganizationAnalyticsPage; 