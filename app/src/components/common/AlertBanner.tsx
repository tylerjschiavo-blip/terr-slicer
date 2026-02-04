/**
 * AlertBanner Component
 * 
 * Reusable banner component for warnings, informational messages, and errors.
 * 
 * Task: AE-45 - Add warning and info banners
 * 
 * Features:
 * - Variants: warning (yellow), info (blue), error (red)
 * - Optional dismissible with close button
 * - Accessible (ARIA labels, keyboard navigation)
 * - Icon support for each variant
 * - Follows design system patterns
 * 
 * Usage:
 * ```tsx
 * <AlertBanner variant="warning" dismissible onDismiss={() => {}}>
 *   <AlertBannerTitle>Warning Title</AlertBannerTitle>
 *   <AlertBannerDescription>Warning description</AlertBannerDescription>
 * </AlertBanner>
 * ```
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertBannerVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm',
  {
    variants: {
      variant: {
        error:
          'border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600',
        warning:
          'border-yellow-200 bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-600',
        info:
          'border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

export interface AlertBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertBannerVariants> {
  dismissible?: boolean;
  onDismiss?: () => void;
}

const AlertBanner = React.forwardRef<HTMLDivElement, AlertBannerProps>(
  ({ className, variant, dismissible, onDismiss, children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);

    const handleDismiss = () => {
      setIsVisible(false);
      onDismiss?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleDismiss();
      }
    };

    if (!isVisible) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        className={cn(alertBannerVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {variant === 'error' && (
              <svg
                className="w-5 h-5 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {variant === 'warning' && (
              <svg
                className="w-5 h-5 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {variant === 'info' && (
              <svg
                className="w-5 h-5 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <div className="flex-1 ml-3">{children}</div>
          {dismissible && (
            <div className="flex-shrink-0 ml-4">
              <button
                type="button"
                onClick={handleDismiss}
                onKeyDown={handleKeyDown}
                className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent hover:opacity-70 transition-opacity"
                aria-label="Dismiss alert"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);
AlertBanner.displayName = 'AlertBanner';

const AlertBannerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-sm font-medium mb-1', className)}
    {...props}
  />
));
AlertBannerTitle.displayName = 'AlertBannerTitle';

const AlertBannerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertBannerDescription.displayName = 'AlertBannerDescription';

export { AlertBanner, AlertBannerTitle, AlertBannerDescription };
