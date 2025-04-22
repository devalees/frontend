import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
            )}
            <li className="flex items-center">
              {isLast ? (
                <span className="text-gray-500 font-medium">{item.label}</span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className="text-primary-600 hover:text-primary-800 font-medium"
                >
                  {item.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs; 