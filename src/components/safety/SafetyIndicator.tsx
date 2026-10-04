import React from 'react';
import { SafetyStatus } from '../../safety/types';
import { CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface SafetyIndicatorProps {
  status: SafetyStatus;
  subtext?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SafetyIndicator: React.FC<SafetyIndicatorProps> = ({
  status,
  subtext,
  size = 'md',
  className = '',
}) => {
  const configs = {
    SAFE: {
      label: 'Verified Safe',
      bgColor: 'bg-status-safe-bg',
      textColor: 'text-status-safe-text',
      borderColor: 'border-status-safe-text/30',
      icon: CheckCircle2,
    },
    CAUTION: {
      label: 'Caution / Check Label',
      bgColor: 'bg-status-caution-bg',
      textColor: 'text-status-caution-text',
      borderColor: 'border-status-caution-text/30',
      icon: AlertTriangle,
    },
    UNSAFE: {
      label: 'Contains Allergen',
      bgColor: 'bg-status-unsafe-bg',
      textColor: 'text-status-unsafe-text',
      borderColor: 'border-status-unsafe-text/30',
      icon: ShieldAlert,
    },
  }[status];

  const Icon = configs.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-2 text-sm',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border ${configs.bgColor} ${configs.textColor} ${configs.borderColor} ${sizeClasses} font-semibold shadow-sm ${className}`}>
      <Icon className={`${iconSizes} shrink-0`} />
      <span>{configs.label}</span>
      {subtext && <span className="opacity-75 font-normal text-[11px] ml-1">({subtext})</span>}
    </div>
  );
};
