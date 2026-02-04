/**
 * BlendedScoreInfo component with tooltip
 * Displays Blended Score explanation with detailed tooltip
 */

import React from 'react';
import { Tooltip, InfoIcon } from './ui/Tooltip';
import { TOOLTIP_CONTENT } from '../lib/tooltipContent';

/**
 * Blended Score heading with tooltip
 * Use this in tables or charts showing blended scores
 */
export const BlendedScoreHeading: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-medium text-slate-700">Blended Score</span>
      <Tooltip content={TOOLTIP_CONTENT.blendedScore.full} side="top">
        <InfoIcon />
      </Tooltip>
    </div>
  );
};

/**
 * Blended Score card with detailed explanation
 */
export const BlendedScoreCard: React.FC<{
  score: number;
  repName: string;
}> = ({ score, repName }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-slate-600">Blended Score</h4>
          <Tooltip content={TOOLTIP_CONTENT.blendedScore.full} side="right">
            <InfoIcon />
          </Tooltip>
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">
        {score.toFixed(2)}
      </div>
      <p className="text-xs text-slate-500">{repName}</p>
    </div>
  );
};

/**
 * Inline blended score with hover tooltip
 */
export const BlendedScoreInline: React.FC<{ score: number }> = ({ score }) => {
  return (
    <Tooltip content={TOOLTIP_CONTENT.blendedScore.what} side="top">
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium cursor-help">
        <span>Blended:</span>
        <span className="font-bold">{score.toFixed(1)}</span>
        <InfoIcon className="w-3 h-3" />
      </span>
    </Tooltip>
  );
};

export default BlendedScoreHeading;
