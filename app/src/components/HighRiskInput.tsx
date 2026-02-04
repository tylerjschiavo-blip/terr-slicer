/**
 * HighRiskInput component with tooltip
 * Input control for High-Risk threshold with explanatory tooltip
 */

import React from 'react';
import { Tooltip, InfoIcon } from './ui/Tooltip';
import { TOOLTIP_CONTENT } from '../lib/tooltipContent';

interface HighRiskInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

/**
 * High-Risk Threshold input with tooltip
 * Shows threshold control with full explanation
 */
export const HighRiskInput: React.FC<HighRiskInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  disabled = false,
}) => {
  return (
    <div className="space-y-2 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">
            High-Risk Threshold
          </label>
          <Tooltip content={TOOLTIP_CONTENT.highRisk.full} side="right">
            <InfoIcon />
          </Tooltip>
        </div>
        <span className="text-sm font-semibold text-slate-900">{value}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      
      <div className="flex justify-between text-xs text-slate-500">
        <span>Low Risk (0)</span>
        <span>High Risk (100)</span>
      </div>
      
      {disabled && (
        <p className="text-xs text-amber-600 mt-2">
          ⚠️ No risk_score data available. Risk features are disabled.
        </p>
      )}
    </div>
  );
};

/**
 * Compact version with number input
 */
export const HighRiskInputCompact: React.FC<HighRiskInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
        High-Risk Threshold
      </label>
      <Tooltip content={TOOLTIP_CONTENT.highRisk.full} side="top">
        <InfoIcon />
      </Tooltip>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        disabled={disabled}
        className="w-20 px-2 py-1 border border-slate-300 rounded text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
      />
    </div>
  );
};

export default HighRiskInput;
