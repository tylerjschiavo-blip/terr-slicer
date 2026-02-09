/**
 * Optimization Caps Component
 *
 * OPTIMIZATION subsection: toggles and cap values for Enterprise and Mid Market
 * ARR max/min ratio. When a cap is on, the optimizer returns the most fair weight
 * combination whose segment max/min ratio is ≤ the cap.
 */

import { useState, useEffect } from 'react';
import { useAllocationStore } from '@/store/allocationStore';
import { cn } from '@/lib/utils';

const CAP_MIN = 1.0;
const CAP_STEP = 0.1;

export function OptimizationCaps() {
  const enterpriseCapEnabled = useAllocationStore((state) => state.enterpriseCapEnabled);
  const enterpriseCapValue = useAllocationStore((state) => state.enterpriseCapValue);
  const midMarketCapEnabled = useAllocationStore((state) => state.midMarketCapEnabled);
  const midMarketCapValue = useAllocationStore((state) => state.midMarketCapValue);
  const updateConfig = useAllocationStore((state) => state.updateConfig);

  const [entInput, setEntInput] = useState(enterpriseCapValue.toString());
  const [mmInput, setMmInput] = useState(midMarketCapValue.toString());

  useEffect(() => {
    setEntInput(enterpriseCapValue.toString());
  }, [enterpriseCapValue]);
  useEffect(() => {
    setMmInput(midMarketCapValue.toString());
  }, [midMarketCapValue]);

  const parseCap = (v: string): number => {
    const n = parseFloat(v);
    if (Number.isNaN(n) || n < CAP_MIN) return CAP_MIN;
    return n;
  };

  const handleEntBlur = () => {
    const val = parseCap(entInput);
    updateConfig({ enterpriseCapValue: val });
    setEntInput(val.toString());
  };
  const handleMmBlur = () => {
    const val = parseCap(mmInput);
    updateConfig({ midMarketCapValue: val });
    setMmInput(val.toString());
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={enterpriseCapEnabled}
            onChange={(e) => updateConfig({ enterpriseCapEnabled: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Cap Enterprise Max/Min Ratio</span>
        </label>
        {enterpriseCapEnabled && (
          <div className="pl-6">
            <input
              type="number"
              min={CAP_MIN}
              step={CAP_STEP}
              value={entInput}
              onChange={(e) => setEntInput(e.target.value)}
              onBlur={handleEntBlur}
              onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
              className={cn(
                'w-20 px-2 py-1.5 text-center text-sm border border-gray-300 rounded',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              )}
              aria-label="Enterprise max/min cap"
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={midMarketCapEnabled}
            onChange={(e) => updateConfig({ midMarketCapEnabled: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Cap Mid Market Max/Min Ratio</span>
        </label>
        {midMarketCapEnabled && (
          <div className="pl-6">
            <input
              type="number"
              min={CAP_MIN}
              step={CAP_STEP}
              value={mmInput}
              onChange={(e) => setMmInput(e.target.value)}
              onBlur={handleMmBlur}
              onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
              className={cn(
                'w-20 px-2 py-1.5 text-center text-sm border border-gray-300 rounded',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              )}
              aria-label="Mid Market max/min cap"
            />
          </div>
        )}
      </div>
    </div>
  );
}
