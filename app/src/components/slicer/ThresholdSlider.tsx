/**
 * Threshold Slider Component
 * 
 * Task: AE-21
 * 
 * Dynamic range slider for employee-count threshold with 1K increments.
 * Controls the segmentation boundary between Enterprise and Mid Market accounts.
 */

import { useEffect, useState } from 'react';
import { useAllocationStore } from '../../store/allocationStore';
import { getThresholdRange } from '../../lib/allocation/segmentation';
import { Slider } from '../ui/slider';

function ThresholdSlider() {
  const accounts = useAllocationStore((state) => state.accounts);
  const threshold = useAllocationStore((state) => state.threshold);
  const updateConfig = useAllocationStore((state) => state.updateConfig);

  // Calculate dynamic range from account data
  const [range, setRange] = useState({ min: 0, max: 10000 });

  useEffect(() => {
    if (accounts.length > 0) {
      const thresholdRange = getThresholdRange(accounts);
      setRange(thresholdRange);
      
      // If current threshold is outside new range, adjust it
      if (threshold < thresholdRange.min || threshold > thresholdRange.max) {
        const newThreshold = Math.max(
          thresholdRange.min,
          Math.min(thresholdRange.max, threshold)
        );
        updateConfig({ threshold: newThreshold });
      }
    }
  }, [accounts, threshold, updateConfig]);

  const handleValueChange = (value: number[]) => {
    updateConfig({ threshold: value[0] });
  };

  // Format number with commas for display
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label
          htmlFor="threshold-slider"
          className="text-xs font-medium text-gray-700 text-center block"
        >
          Employee Count Threshold
        </label>
        
        <div className="space-y-2">
          {/* Current Value Display */}
          <div className="text-center">
            <span className="text-xl font-semibold text-gray-900">
              {formatNumber(threshold)}
            </span>
          </div>

          {/* Slider Component */}
          <div className="px-2">
            <Slider
              id="threshold-slider"
              min={range.min}
              max={range.max}
              step={1000}
              value={[threshold]}
              onValueChange={handleValueChange}
              aria-label="Employee count threshold for Enterprise/Mid Market segmentation"
              aria-valuemin={range.min}
              aria-valuemax={range.max}
              aria-valuenow={threshold}
              aria-valuetext={`${formatNumber(threshold)} employees`}
              className="cursor-pointer"
            />
          </div>

          {/* Min/Max Labels */}
          <div className="flex justify-between text-xs text-gray-500 px-2">
            <span>{formatNumber(range.min)}</span>
            <span>{formatNumber(range.max)}</span>
          </div>
        </div>

        {/* Helper Text */}
        <div className="text-xs text-gray-500 mt-2 text-center space-y-0.5">
          <div>Enterprise ≥ {formatNumber(threshold)} employees</div>
          <div>Mid Market &lt; {formatNumber(threshold)} employees</div>
        </div>
      </div>
    </div>
  );
}

export default ThresholdSlider;
