'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Users, Database, UserCheck, Key, Building, FileText } from 'lucide-react';

const RBACDashboardPage = () => {
  const router = useRouter();

  const rbacSections = [
    {
      title: 'Roles',
      description: 'Manage user roles and associated permissions',
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      path: '/rbac/roles',
    },
    {
      title: 'Permissions',
      description: 'Configure granular permissions for system access',
      icon: <Key className="h-8 w-8 text-primary-600" />,
      path: '/rbac/permissions',
    },
    {
      title: 'Resources',
      description: 'Manage protectable resources in the system',
      icon: <Database className="h-8 w-8 text-primary-600" />,
      path: '/rbac/resources',
    },
    {
      title: 'User Roles',
      description: 'Assign roles to users across the system',
      icon: <Users className="h-8 w-8 text-primary-600" />,
      path: '/rbac/user-roles',
    },
    {
      title: 'Resource Accesses',
      description: 'Configure access controls for resources',
      icon: <UserCheck className="h-8 w-8 text-primary-600" />,
      path: '/rbac/resource-accesses',
    },
    {
      title: 'Organization Contexts',
      description: 'Manage organizational contexts for permissions',
      icon: <Building className="h-8 w-8 text-primary-600" />,
      path: '/rbac/organization-contexts',
    },
    {
      title: 'Audit Logs',
      description: 'View system access and change history',
      icon: <FileText className="h-8 w-8 text-primary-600" />,
      path: '/rbac/audit-logs',
    },
  ];

  const navigateToSection = (path: string) => {
    router.push(path);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">RBAC Management Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage role-based access control across the application
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rbacSections.map((section, index) => (
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

export default RBACDashboardPage; 