/**
 * Tree Component
 * 
 * A simple tree view component for displaying hierarchical data.
 */

import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TreeItemProps {
  id: string;
  label: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  expandedByDefault?: boolean;
  className?: string;
}

export const TreeItem: React.FC<TreeItemProps> = ({
  id,
  label,
  children,
  icon,
  expandedByDefault = false,
  className,
}) => {
  const [expanded, setExpanded] = useState(expandedByDefault);
  const hasChildren = !!children;

  const handleToggle = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    }
  };

  return (
    <li className={cn("relative", className)}>
      <div 
        className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded-sm"
        onClick={handleToggle}
      >
        <span className="w-5 h-5 flex items-center justify-center mr-1">
          {hasChildren && (
            expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </span>
        {icon && <span className="mr-2">{icon}</span>}
        <span className="flex-1">{label}</span>
      </div>
      {hasChildren && expanded && (
        <ul className="pl-5 border-l border-gray-200 ml-2 mt-1">
          {children}
        </ul>
      )}
    </li>
  );
};

export interface TreeProps {
  children: React.ReactNode;
  className?: string;
}

export const Tree: React.FC<TreeProps> = ({ children, className }) => {
  return (
    <ul className={cn("text-sm", className)}>
      {children}
    </ul>
  );
}; 