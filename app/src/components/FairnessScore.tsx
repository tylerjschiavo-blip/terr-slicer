/**
 * FairnessScore component with tooltips
 * Displays fairness metrics with explanatory tooltips
 */

import React from 'react';
import { Tooltip, InfoIcon } from './ui/Tooltip';
import { TOOLTIP_CONTENT } from '../lib/tooltipContent';

interface FairnessScoreProps {
  label: string;
  score: number;
  tooltipType: 'custom' | 'balanced' | 'cv' | 'segment' | 'average';
  color?: string;
}

/**
 * Individual fairness score display with tooltip
 */
export const FairnessScore: React.FC<FairnessScoreProps> = ({
  label,
  score,
  tooltipType,
  color = 'text-slate-900',
}) => {
  return (
    <div className="flex flex-col p-4 bg-white rounded-lg shadow">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <Tooltip content={TOOLTIP_CONTENT.fairness[tooltipType]}>
          <InfoIcon />
        </Tooltip>
      </div>
      <div className={`text-3xl font-bold ${color}`}>
        {score.toFixed(1)}
      </div>
    </div>
  );
};

/**
 * FairnessScore panel showing all fairness metrics
 * Example usage with all tooltip types
 */
export const FairnessScorePanel: React.FC<{
  customScore: number;
  balancedScore: number;
  cvPercent: number;
  segmentScore: number;
  averageScore: number;
}> = ({ customScore, balancedScore, cvPercent, segmentScore, averageScore }) => {
  return (
    <div className="grid grid-cols-5 gap-4">
      <FairnessScore
        label="Custom Fairness"
        score={customScore}
        tooltipType="custom"
        color="text-blue-600"
      />
      <FairnessScore
        label="Balanced Fairness"
        score={balancedScore}
        tooltipType="balanced"
        color="text-green-600"
      />
      <FairnessScore
        label="CV%"
        score={cvPercent}
        tooltipType="cv"
        color="text-purple-600"
      />
      <FairnessScore
        label="Segment Fairness"
        score={segmentScore}
        tooltipType="segment"
        color="text-orange-600"
      />
      <FairnessScore
        label="Average Fairness"
        score={averageScore}
        tooltipType="average"
        color="text-slate-900"
      />
    </div>
  );
};

export default FairnessScore;
