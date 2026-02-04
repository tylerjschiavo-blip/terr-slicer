/**
 * Missing Risk Banner Component
 * 
 * Displays info banner when Risk_Score column not found in uploaded data.
 * Shows on upload page and slicer page.
 * 
 * Task: AE-44 - Build missing risk_score degradation
 * Updated: AE-45 - Refactored to use AlertBanner component
 */

import { useAllocationStore } from '@/store/allocationStore';
import { AlertBanner, AlertBannerTitle, AlertBannerDescription } from './AlertBanner';

export function MissingRiskBanner() {
  const hasRiskScore = useAllocationStore((state) => state.hasRiskScore);

  // Only display if Risk_Score is missing
  if (hasRiskScore) {
    return null;
  }

  return (
    <AlertBanner variant="info">
      <AlertBannerTitle>Risk_Score Column Not Found</AlertBannerTitle>
      <AlertBannerDescription>
        Risk_Score column not found. Risk dimension disabled. Tool remains functional for ARR and Account balancing.
      </AlertBannerDescription>
    </AlertBanner>
  );
}
