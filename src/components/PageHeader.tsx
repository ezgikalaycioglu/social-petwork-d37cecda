import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader = ({ title, subtitle, icon, actions, className }: PageHeaderProps) => {
  return (
    <div className={cn("bg-white border-b border-border", className)}>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {icon && (
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                <p className="text-muted-foreground mt-1">{subtitle}</p>
              </div>
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;