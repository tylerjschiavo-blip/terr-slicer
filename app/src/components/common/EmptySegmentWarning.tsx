/**
 * Empty Segment Warning Component
 * Displays a warning banner when a segment has zero accounts
 * 
 * Task: AE-43 - Implement empty segment handling
 * Updated: AE-45 - Refactored to use AlertBanner component
 * 
 * Shows:
 * - Clear message: "No [Enterprise/Mid-Market] accounts at this threshold."
 * - Yellow warning style following design system
 * - Used in segment cards when accountCount = 0
 */

import { AlertBanner, AlertBannerDescription } from './AlertBanner';

interface EmptySegmentWarningProps {
  segment: 'Enterprise' | 'Mid Market';
}

/**
 * Warning banner for empty segments
 * 
 * @param segment - The segment name (Enterprise or Mid Market)
 */
export function EmptySegmentWarning({ segment }: EmptySegmentWarningProps) {
  return (
    <AlertBanner variant="warning" className="mt-2">
      <AlertBannerDescription>
        No {segment} accounts at this threshold.
      </AlertBannerDescription>
    </AlertBanner>
  );
}

export default EmptySegmentWarning;
