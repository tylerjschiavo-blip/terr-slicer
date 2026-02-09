/**
 * Optimize Weights Modal Component
 * 
 * Displays optimization results with current and recommended weights.
 * 
 * Task: AE-30
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAllocationStore } from '@/store/allocationStore';
import type { OptimizationResult } from '@/lib/allocation/optimizer';

interface OptimizeWeightsModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Current weights and score */
  currentWeights: {
    arrWeight: number;
    accountWeight: number;
    riskWeight: number;
    balancedScore: number;
  };
  /** Recommended weights and score from optimization */
  recommendedWeights: OptimizationResult;
}

export function OptimizeWeightsModal({
  isOpen,
  onClose,
  currentWeights,
  recommendedWeights,
}: OptimizeWeightsModalProps) {
  const updateConfig = useAllocationStore((state) => state.updateConfig);

  /**
   * Apply recommended weights to sliders
   */
  const handleApply = () => {
    updateConfig({
      arrWeight: recommendedWeights.arrWeight,
      accountWeight: recommendedWeights.accountWeight,
      riskWeight: recommendedWeights.riskWeight,
    });
    onClose();
  };

  /**
   * Calculate improvement delta
   */
  const improvement = recommendedWeights.balancedScore - currentWeights.balancedScore;
  const improvementText = improvement > 0
    ? `+${improvement.toFixed(1)} points`
    : improvement < 0
    ? `${improvement.toFixed(1)} points`
    : 'No improvement';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Optimize Weights Results</DialogTitle>
          <DialogDescription>
            Recommended weight configuration for maximum Balanced fairness at current threshold.
            {!recommendedWeights.constraintsMet && (
              <span className="block mt-2 text-amber-700 text-sm">
                No weight combination met your Optimization caps; showing the best overall result.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Weights */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Current Weights
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">ARR Weight:</span>
                <span className="font-semibold">{currentWeights.arrWeight}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Account Weight:</span>
                <span className="font-semibold">{currentWeights.accountWeight}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Risk Weight:</span>
                <span className="font-semibold">{currentWeights.riskWeight}%</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Balanced Score:</span>
                  <span className="font-bold text-blue-600">
                    {currentWeights.balancedScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Weights */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Recommended Weights
            </h3>
            <div className="bg-green-50 rounded-lg p-4 space-y-2 border border-green-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">ARR Weight:</span>
                <span className="font-semibold">{recommendedWeights.arrWeight}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Account Weight:</span>
                <span className="font-semibold">{recommendedWeights.accountWeight}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Risk Weight:</span>
                <span className="font-semibold">{recommendedWeights.riskWeight}%</span>
              </div>
              <div className="border-t border-green-200 pt-2 mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Balanced Score:</span>
                  <span className="font-bold text-green-600">
                    {recommendedWeights.balancedScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Improvement Delta */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Improvement:</span>
              <span
                className={`text-lg font-bold ${
                  improvement > 0
                    ? 'text-green-600'
                    : improvement < 0
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {improvementText}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
