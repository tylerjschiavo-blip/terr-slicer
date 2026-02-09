/**
 * Optimize Weights Button Component
 * 
 * Triggers weight optimization and displays results in a modal.
 * 
 * Task: AE-30
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { OptimizeWeightsModal } from './OptimizeWeightsModal';
import { useAllocationStore } from '@/store/allocationStore';
import { optimizeWeights, type OptimizationResult } from '@/lib/allocation/optimizer';

export function OptimizeWeightsButton() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [optimizationResult, setOptimizationResult] = React.useState<OptimizationResult | null>(null);

  // Get store values
  const accounts = useAllocationStore((state) => state.accounts);
  const reps = useAllocationStore((state) => state.reps);
  const threshold = useAllocationStore((state) => state.threshold);
  const arrWeight = useAllocationStore((state) => state.arrWeight);
  const accountWeight = useAllocationStore((state) => state.accountWeight);
  const riskWeight = useAllocationStore((state) => state.riskWeight);
  const geoMatchBonus = useAllocationStore((state) => state.geoMatchBonus);
  const preserveBonus = useAllocationStore((state) => state.preserveBonus);
  const highRiskThreshold = useAllocationStore((state) => state.highRiskThreshold);
  const fairnessMetrics = useAllocationStore((state) => state.fairnessMetrics);
  const enterpriseCapEnabled = useAllocationStore((state) => state.enterpriseCapEnabled);
  const enterpriseCapValue = useAllocationStore((state) => state.enterpriseCapValue);
  const midMarketCapEnabled = useAllocationStore((state) => state.midMarketCapEnabled);
  const midMarketCapValue = useAllocationStore((state) => state.midMarketCapValue);

  // Check if data is available
  const hasData = accounts.length > 0 && reps.length > 0;

  /**
   * Handle optimize button click
   * Runs the optimizer and displays results in modal
   */
  const handleOptimize = async () => {
    if (!hasData) return;

    setIsLoading(true);

    // Run optimization in a timeout to allow UI to update with loading state
    setTimeout(() => {
      try {
        const enterpriseCap = enterpriseCapEnabled ? enterpriseCapValue : null;
        const midMarketCap = midMarketCapEnabled ? midMarketCapValue : null;
        const result = optimizeWeights(
          accounts,
          reps,
          threshold,
          geoMatchBonus,
          preserveBonus,
          highRiskThreshold,
          enterpriseCap,
          midMarketCap
        );

        setOptimizationResult(result);
        setIsOpen(true);
      } catch (error) {
        console.error('Optimization failed:', error);
        // TODO: Show error toast/banner
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  /**
   * Get current Balanced score from fairness metrics
   */
  const currentBalancedScore = fairnessMetrics.balancedComposite ?? 0;

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleOptimize}
          disabled={!hasData || isLoading}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" variant="white" text="Optimizing..." />
          ) : (
            'Optimize Weights'
          )}
        </Button>
      </div>

      {/* Results Modal */}
      {optimizationResult && (
        <OptimizeWeightsModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          currentWeights={{
            arrWeight,
            accountWeight,
            riskWeight,
            balancedScore: currentBalancedScore,
          }}
          recommendedWeights={optimizationResult}
        />
      )}
    </>
  );
}
