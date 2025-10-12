import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SegmentedControlItem {
  value: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface SegmentedControlProps {
  items: SegmentedControlItem[];
  value: string;
  onChange: (value: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ items, value, onChange }) => {
  return (
    <div className="sticky top-14 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100 shadow-sm">
      <div className="px-4 py-2">
        <div className="flex gap-1 bg-gray-100 rounded-full p-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = value === item.value;
            
            return (
              <button
                key={item.value}
                onClick={() => onChange(item.value)}
                className={cn(
                  "flex-1 h-9 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="truncate">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={cn(
                    "absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center",
                    isActive ? "bg-white text-primary" : "bg-red-500 text-white"
                  )}>
                    {item.count > 9 ? '9+' : item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SegmentedControl;
