import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'safe' | 'caution' | 'danger';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  size = 'md',
}) => {
  const baseClasses = 'inline-flex items-center gap-1 font-medium rounded-full';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  const variantClasses = {
    default: 'bg-surface-container text-on-surface-variant',
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary-fixed/50 text-on-secondary-fixed',
    safe: 'bg-status-safe-bg text-status-safe-text border border-status-safe-text/20',
    caution: 'bg-status-caution-bg text-status-caution-text border border-status-caution-text/20',
    danger: 'bg-status-unsafe-bg text-status-unsafe-text border border-status-unsafe-text/20',
  }[variant];

  return <span className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}>{children}</span>;
};
