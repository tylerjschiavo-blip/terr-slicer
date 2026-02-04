/**
 * OptimizeWeights button component with tooltip
 * Triggers weight optimization with explanatory tooltip
 */

import React from 'react';
import { Tooltip, InfoIcon } from './ui/Tooltip';
import { TOOLTIP_CONTENT } from '../lib/tooltipContent';

interface OptimizeWeightsProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Optimize Weights button with tooltip
 * Shows full explanation of optimization feature
 */
export const OptimizeWeights: React.FC<OptimizeWeightsProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading ? 'Optimizing...' : 'Optimize Weights'}
      </button>
      <Tooltip content={TOOLTIP_CONTENT.optimizeWeights.full} side="right">
        <InfoIcon className="w-5 h-5" />
      </Tooltip>
    </div>
  );
};

/**
 * Alternative: Optimize button with inline tooltip trigger
 */
export const OptimizeWeightsCompact: React.FC<OptimizeWeightsProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
}) => {
  return (
    <Tooltip content={TOOLTIP_CONTENT.optimizeWeights.full} side="top">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⟳</span>
            Optimizing...
          </>
        ) : (
          <>
            <span>⚡</span>
            Optimize Weights
          </>
        )}
      </button>
    </Tooltip>
  );
};

export default OptimizeWeights;
