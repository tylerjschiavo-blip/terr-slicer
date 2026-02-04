/**
 * LoadingSpinner Component
 * 
 * Reusable loading spinner component based on shadcn/ui principles.
 * Follows the UI Design System for consistent styling.
 * 
 * Task: AE-47 - Loading states and optimistic updates
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'default' | 'primary' | 'white';
  /** Optional text to display next to spinner */
  text?: string;
  /** Additional CSS classes */
  className?: string;
  /** ARIA label for screen readers */
  'aria-label'?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const colorClasses = {
  default: 'text-gray-600',
  primary: 'text-blue-600',
  white: 'text-white',
};

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  text,
  className,
  'aria-label': ariaLabel = 'Loading',
}: LoadingSpinnerProps) {
  const spinner = (
    <svg
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[variant],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label={ariaLabel}
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
      <span className="sr-only">{ariaLabel}</span>
    </svg>
  );

  if (text) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {spinner}
        <span className={cn('text-sm', colorClasses[variant])}>{text}</span>
      </div>
    );
  }

  return spinner;
}
