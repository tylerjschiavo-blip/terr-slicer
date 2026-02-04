/**
 * PreferenceSliders component with tooltips
 * Controls for Geo Match and Preserve Existing Assignment preferences
 */

import React from 'react';
import { Tooltip, InfoIcon } from './ui/Tooltip';
import { TOOLTIP_CONTENT } from '../lib/tooltipContent';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  tooltipContent: string;
}

/**
 * Slider with label and tooltip
 */
const SliderWithTooltip: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 0.1,
  step = 0.01,
  tooltipContent,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <Tooltip content={tooltipContent} side="right">
            <InfoIcon />
          </Tooltip>
        </div>
        <span className="text-sm font-semibold text-slate-900">
          {(value * 100).toFixed(0)}%
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
};

/**
 * PreferenceSliders component with Geo Match and Preserve controls
 */
export const PreferenceSliders: React.FC<{
  geoMatchValue: number;
  preserveValue: number;
  onGeoMatchChange: (value: number) => void;
  onPreserveChange: (value: number) => void;
}> = ({ geoMatchValue, preserveValue, onGeoMatchChange, onPreserveChange }) => {
  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold text-slate-900">Preferences</h3>
      
      {/* Geo Match Preference with Tooltip */}
      <SliderWithTooltip
        label="Geo Match Preference"
        value={geoMatchValue}
        onChange={onGeoMatchChange}
        tooltipContent={TOOLTIP_CONTENT.geoMatch.full}
      />
      
      {/* Preserve Existing Assignment with Tooltip */}
      <SliderWithTooltip
        label="Preserve Existing Assignment"
        value={preserveValue}
        onChange={onPreserveChange}
        tooltipContent={TOOLTIP_CONTENT.preserve.full}
      />
    </div>
  );
};

export default PreferenceSliders;
