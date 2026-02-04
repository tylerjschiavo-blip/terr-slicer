/**
 * PreferenceSliders Component (AE-23)
 * 
 * Three sliders for allocation preferences:
 * 1. Geo Match bonus (0.00-0.10)
 * 2. Rep Preservation bonus (0.00-0.10)
 * 3. High-Risk Threshold (0-100)
 * 
 * Integrates directly with Zustand store to trigger allocation recalculation.
 */

import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import { useAllocationStore } from '@/store/allocationStore';

export const PreferenceSliders: React.FC = () => {
  const geoMatchBonus = useAllocationStore((state) => state.geoMatchBonus);
  const preserveBonus = useAllocationStore((state) => state.preserveBonus);
  const highRiskThreshold = useAllocationStore((state) => state.highRiskThreshold);
  const updateConfig = useAllocationStore((state) => state.updateConfig);

  const handleGeoMatchChange = (value: number[]) => {
    updateConfig({ geoMatchBonus: value[0] });
  };

  const handlePreserveChange = (value: number[]) => {
    updateConfig({ preserveBonus: value[0] });
  };

  const handleHighRiskThresholdChange = (value: number[]) => {
    updateConfig({ highRiskThreshold: value[0] });
  };

  return (
    <div className="space-y-4">
      {/* Geo Match Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="geo-match-slider"
              className="text-xs font-medium text-foreground"
            >
              Geo Match Bonus
            </label>
          </div>
          <span className="text-xs font-semibold text-foreground">
            {geoMatchBonus.toFixed(2)}
          </span>
        </div>
        <Slider
          id="geo-match-slider"
          min={0}
          max={0.1}
          step={0.01}
          value={[geoMatchBonus]}
          onValueChange={handleGeoMatchChange}
          className="w-full"
          aria-label="Geo Match Bonus"
        />
        <p className="text-[10px] text-muted-foreground">
          Range: 0.00–0.10
        </p>
      </div>

      {/* Preserve Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="preserve-slider"
              className="text-xs font-medium text-foreground"
            >
              Rep Preservation Bonus
            </label>
          </div>
          <span className="text-xs font-semibold text-foreground">
            {preserveBonus.toFixed(2)}
          </span>
        </div>
        <Slider
          id="preserve-slider"
          min={0}
          max={0.1}
          step={0.01}
          value={[preserveBonus]}
          onValueChange={handlePreserveChange}
          className="w-full"
          aria-label="Rep Preservation Bonus"
        />
        <p className="text-[10px] text-muted-foreground">
          Range: 0.00–0.10
        </p>
      </div>

      {/* High-Risk Threshold Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="high-risk-threshold-slider"
            className="text-xs font-medium text-foreground"
          >
            High-Risk Threshold
          </label>
          <span className="text-xs font-semibold text-foreground">
            {highRiskThreshold}
          </span>
        </div>
        <Slider
          id="high-risk-threshold-slider"
          min={0}
          max={100}
          step={5}
          value={[highRiskThreshold]}
          onValueChange={handleHighRiskThresholdChange}
          className="w-full"
          aria-label="High-Risk Threshold"
        />
        <p className="text-[10px] text-muted-foreground">
          Range: 0–100
        </p>
      </div>
    </div>
  );
};
