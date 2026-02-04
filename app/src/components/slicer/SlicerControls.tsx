/**
 * Slicer Controls Component
 * Contains threshold, weights, preferences, optimize button, and export button
 * 
 * Individual controls will be implemented in tasks AE-21, AE-22, AE-23, AE-30, AE-42
 */
import { OptimizeWeightsButton } from './OptimizeWeightsButton';
import ThresholdSlider from './ThresholdSlider';
import { BalanceWeightSliders } from './BalanceWeightSliders';
import { PreferenceSliders } from './PreferenceSliders';
import { ExportButton } from '@/components/common/ExportButton';
import { useAllocationStore } from '@/store/allocationStore';

function SlicerControls() {
  const reps = useAllocationStore((state) => state.reps);
  const accounts = useAllocationStore((state) => state.accounts);
  const clearData = useAllocationStore((state) => state.clearData);
  
  const hasData = reps.length > 0 || accounts.length > 0;
  const fileName = hasData ? 'data.xlsx' : null;

  const handleClearData = () => {
    if (confirm('Clear all uploaded data? This will reset the entire application.')) {
      clearData();
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-2">
        {fileName ? (
          <div className="flex items-center justify-between min-h-[44px] px-2">
            <span className="text-xs text-gray-700 truncate flex-1">{fileName}</span>
            <button
              onClick={handleClearData}
              className="ml-2 p-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Clear data"
              aria-label="Clear data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-8 text-gray-500 text-xs">
            📁 Upload Data
          </div>
        )}
      </div>

      <div className="border-t border-gray-300 pt-4">
        <h2 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Controls
        </h2>
      </div>

      {/* Threshold Slider - Task AE-21 */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <ThresholdSlider />
      </div>

      <div className="border-t border-gray-300 pt-4">
        <h3 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide">
          Preferences
        </h3>
      </div>

      {/* Preference Sliders - Task AE-23 */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <PreferenceSliders />
      </div>

      <div className="border-t border-gray-300 pt-4">
        <h3 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide">
          Balance Weights
        </h3>
      </div>

      {/* Balance Weight Sliders - Task AE-22 */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <BalanceWeightSliders />
      </div>

      <div className="border-t border-gray-300 pt-4"></div>

      {/* Optimize Weights Button - Task AE-30 */}
      <OptimizeWeightsButton />

      <div className="border-t border-gray-300 pt-4"></div>

      {/* Export CSV Button - Task AE-42 */}
      <ExportButton />
    </div>
  );
}

export default SlicerControls;
