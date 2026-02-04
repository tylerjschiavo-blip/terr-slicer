/**
 * SensitivityChart component with axis tooltips
 * Shows fairness and balance changes across different thresholds
 */

import React from 'react';
import { Tooltip, InfoIcon } from './ui/Tooltip';
import { TOOLTIP_CONTENT } from '../lib/tooltipContent';

interface SensitivityChartProps {
  data: Array<{
    threshold: number;
    customScore: number;
    balancedScore: number;
    dealSizeRatio: number;
  }>;
}

/**
 * SensitivityChart with axis tooltips
 * Shows chart with explanatory tooltips on all axes
 */
export const SensitivityChart: React.FC<SensitivityChartProps> = ({ data: _data }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Chart Header with Tooltip */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Sensitivity Analysis
        </h3>
        <Tooltip content={TOOLTIP_CONTENT.sensitivityChart.short} side="right">
          <InfoIcon className="w-5 h-5" />
        </Tooltip>
      </div>

      {/* Chart Container */}
      <div className="relative" style={{ height: '400px' }}>
        {/* Left Y-Axis Label with Tooltip */}
        <div className="absolute -left-12 top-0 h-full flex items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 -rotate-90 whitespace-nowrap">
              Fairness Scores (Custom & Balanced)
            </span>
            <Tooltip
              content={TOOLTIP_CONTENT.sensitivityChart.axes}
              side="right"
            >
              <InfoIcon className="-rotate-90" />
            </Tooltip>
          </div>
        </div>

        {/* Right Y-Axis Label with Tooltip */}
        <div className="absolute -right-12 top-0 h-full flex items-center">
          <div className="flex items-center gap-2">
            <Tooltip
              content={TOOLTIP_CONTENT.sensitivityChart.axes}
              side="left"
            >
              <InfoIcon className="rotate-90" />
            </Tooltip>
            <span className="text-sm font-medium text-slate-700 rotate-90 whitespace-nowrap">
              Deal Size Ratio (Enterprise/Mid-Market)
            </span>
          </div>
        </div>

        {/* Chart Area - Placeholder */}
        <div className="w-full h-full border border-slate-200 rounded flex items-center justify-center bg-slate-50">
          <p className="text-slate-500 text-sm">
            Chart visualization will be rendered here
          </p>
        </div>

        {/* X-Axis Label with Tooltip */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-sm font-medium text-slate-700">
            Employee Count Threshold
          </span>
          <Tooltip
            content={TOOLTIP_CONTENT.sensitivityChart.axes}
            side="top"
          >
            <InfoIcon />
          </Tooltip>
        </div>
      </div>

      {/* Chart Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Custom Fairness</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Balanced Fairness</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>Deal Size Ratio</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Alternative: Compact chart with tooltips on hover
 */
export const SensitivityChartCompact: React.FC<SensitivityChartProps> = ({
  data: _data,
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <Tooltip content={TOOLTIP_CONTENT.sensitivityChart.axes}>
        <div className="cursor-help">
          <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
            Sensitivity Analysis
            <InfoIcon />
          </h3>
          <div className="w-full h-64 border border-slate-200 rounded flex items-center justify-center bg-slate-50">
            <p className="text-slate-500 text-xs">
              Hover for axis explanations
            </p>
          </div>
        </div>
      </Tooltip>
    </div>
  );
};

export default SensitivityChart;
