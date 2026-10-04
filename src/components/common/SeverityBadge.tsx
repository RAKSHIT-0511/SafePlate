import React from 'react';
import { AllergenSeverity } from '../../safety/types';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface SeverityBadgeProps {
  severity: AllergenSeverity;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  label,
  showIcon = true,
  className = '',
}) => {
  switch (severity) {
    case 'LIFE_THREATENING':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-container text-error border border-error/30 ${className}`}
        >
          {showIcon && <ShieldAlert className="w-3.5 h-3.5 shrink-0" />}
          <span>{label ? `${label} (Life-Threatening)` : 'Life-Threatening'}</span>
        </span>
      );
    case 'AVOID':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary-fixed/50 text-secondary border border-secondary/30 ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
          <span>{label ? `${label} (Avoid)` : 'Avoid'}</span>
        </span>
      );
    case 'TRACE_OK':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
          <span>{label ? `${label} (Trace OK)` : 'Trace OK'}</span>
        </span>
      );
  }
};
