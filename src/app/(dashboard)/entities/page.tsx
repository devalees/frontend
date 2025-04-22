'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Building, Users, UserPlus, Settings } from 'lucide-react';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';

const EntitiesPage = () => {
  const router = useRouter();

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/' },
    { label: 'Entities' }
  ];

  const entitySections = [
    {
      title: 'Organizations',
      description: 'Manage organizations and their settings',
      icon: <Building className="h-8 w-8 text-primary-600" />,
      path: '/entities/organizations',
    },
    {
      title: 'Departments',
      description: 'Manage departments within organizations',
      icon: <Building className="h-8 w-8 text-primary-600" />,
      path: '/entities/departments',
    },
    {
      title: 'Teams',
      description: 'Manage teams within departments',
      icon: <Users className="h-8 w-8 text-primary-600" />,
      path: '/entities/teams',
    },
    {
      title: 'Team Members',
      description: 'Manage team members and their roles',
      icon: <UserPlus className="h-8 w-8 text-primary-600" />,
      path: '/entities/team-members',
    },
    {
      title: 'Organization Settings',
      description: 'Configure organization-wide settings',
      icon: <Settings className="h-8 w-8 text-primary-600" />,
      path: '/entities/organization-settings',
    },
  ];

  const navigateToSection = (path: string) => {
    router.push(path);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-2" />
        <h1 className="text-2xl font-bold">Entity Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage organizations, departments, teams, and members
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entitySections.map((section, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                {section.icon}
                <CardTitle>{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base text-gray-500">
                {section.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => navigateToSection(section.path)}
                data-testid={`navigate-to-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                Manage {section.title}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EntitiesPage; 