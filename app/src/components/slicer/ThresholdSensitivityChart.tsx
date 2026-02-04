/**
 * Threshold Sensitivity Chart Component
 * Line chart showing Balanced and Custom fairness across thresholds with Deal Size Ratio
 * 
 * Task: AE-27 - Dual Y-axis sensitivity chart
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useAllocationStore } from '../../store/allocationStore';

interface TooltipPayloadItem {
  value?: number;
  name?: string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number;
  arrWeight: number;
  accountWeight: number;
  riskWeight: number;
}

/**
 * Custom tooltip component for sensitivity chart
 */
function SensitivityTooltip({ active, payload, label, arrWeight, accountWeight, riskWeight }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm">
      <p className="font-semibold text-gray-900 mb-2">
        Threshold: {label?.toLocaleString()} employees
      </p>
      
      <div className="space-y-1 mb-2">
        <p className="text-blue-600">
          Balanced Fairness: {payload[0]?.value?.toFixed(1)}
        </p>
        <p className="text-green-600">
          Custom Fairness: {payload[1]?.value?.toFixed(1)}
        </p>
        <p className="text-orange-600">
          Avg. Deal Size Ratio: {payload[2]?.value ? `${payload[2].value.toFixed(1)}x` : 'N/A'}
        </p>
      </div>

      <div className="border-t border-gray-200 pt-2 mt-2 text-xs text-gray-600">
        <p className="font-medium mb-1">Current Weight Splits:</p>
        <p>ARR: {arrWeight}% | Account: {accountWeight}% | Risk: {riskWeight}%</p>
      </div>
    </div>
  );
}

function ThresholdSensitivityChart() {
  const { sensitivityData, threshold: currentThreshold, arrWeight, accountWeight, riskWeight } = useAllocationStore();

  // If no sensitivity data, show empty state
  if (!sensitivityData || sensitivityData.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Threshold Sensitivity</h2>
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="h-64 flex items-center justify-center text-gray-400">
            No sensitivity data available. Upload data to view analysis.
          </div>
        </div>
      </div>
    );
  }

  // Parse Deal Size Ratio from string format "2.5:1" to number for charting
  const chartData = sensitivityData.map((point) => {
    const ratioValue = point.dealSizeRatio === 'N/A' 
      ? null 
      : parseFloat(point.dealSizeRatio.split(':')[0]);
    
    return {
      threshold: point.threshold,
      balancedFairness: point.balancedFairness,
      customFairness: point.customFairness,
      dealSizeRatio: ratioValue,
      dealSizeRatioLabel: point.dealSizeRatio, // Keep original string for tooltip
    };
  });

  // Calculate Y-axis domain for Deal Size Ratio
  const validRatios = chartData
    .map(d => d.dealSizeRatio)
    .filter((r): r is number => r !== null);
  
  const minRatio = validRatios.length > 0 ? Math.floor(Math.min(...validRatios)) : 0;
  const maxRatio = validRatios.length > 0 ? Math.ceil(Math.max(...validRatios)) : 5;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Threshold Sensitivity</h2>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            
            {/* X-axis: Threshold (employee count) */}
            <XAxis
              dataKey="threshold"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              label={{ value: 'Threshold (Employees)', position: 'insideBottom', offset: -5, style: { fontSize: 11, textAnchor: 'middle' } }}
              stroke="#6b7280"
              tick={{ fontSize: 11 }}
            />
            
            {/* Left Y-axis: Fairness (0-100) */}
            <YAxis
              yAxisId="fairness"
              domain={[0, 100]}
              label={{ value: 'Fairness Score', angle: -90, position: 'insideLeft', style: { fontSize: 11, textAnchor: 'middle' } }}
              stroke="#6b7280"
              tick={{ fontSize: 11 }}
            />
            
            {/* Right Y-axis: Deal Size Ratio */}
            <YAxis
              yAxisId="ratio"
              orientation="right"
              domain={[minRatio, maxRatio]}
              label={{ value: 'Avg. Deal Size Ratio (E/MM)', angle: 90, position: 'insideRight', style: { fontSize: 11, textAnchor: 'middle' } }}
              stroke="#6b7280"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `${value.toFixed(1)}x`}
            />
            
            {/* Custom tooltip */}
            <Tooltip content={<SensitivityTooltip arrWeight={arrWeight} accountWeight={accountWeight} riskWeight={riskWeight} />} />
            
            {/* Legend */}
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
              iconType="line"
            />
            
            {/* Current threshold indicator (vertical line) */}
            <ReferenceLine
              x={currentThreshold}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              yAxisId="fairness"
              label={{
                value: 'Current',
                position: 'top',
                fill: '#ef4444',
                fontSize: 11,
              }}
            />
            
            {/* Balanced Fairness line (33/33/33 scoring) */}
            <Line
              yAxisId="fairness"
              type="monotone"
              dataKey="balancedFairness"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Balanced Fairness"
              dot={false}
              activeDot={{ r: 5 }}
            />
            
            {/* Custom Fairness line (user's weight scoring) */}
            <Line
              yAxisId="fairness"
              type="monotone"
              dataKey="customFairness"
              stroke="#10b981"
              strokeWidth={2}
              name="Custom Fairness"
              dot={false}
              activeDot={{ r: 5 }}
            />
            
            {/* Deal Size Ratio line (secondary Y-axis) */}
            <Line
              yAxisId="ratio"
              type="monotone"
              dataKey="dealSizeRatio"
              stroke="#f97316"
              strokeWidth={2}
              name="Avg. Deal Size Ratio"
              dot={false}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ThresholdSensitivityChart;
