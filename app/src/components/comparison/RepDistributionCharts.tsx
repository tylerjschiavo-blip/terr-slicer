/**
 * Rep Distribution Charts - Before vs After
 * Shows 3 charts: ARR, Account Count, and High Risk ARR
 * Comparing Original_Rep (before) to Assigned_Rep (after)
 */

import { useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { useAllocationStore } from '@/store/allocationStore';

interface RepComparisonData {
  repName: string;
  segment: 'Enterprise' | 'Mid Market';
  // ARR split
  beforeNormalARR: number;
  beforeHighRiskARR: number;
  afterNormalARR: number;
  afterHighRiskARR: number;
  // Account count split
  beforeNormalAccounts: number;
  beforeHighRiskAccounts: number;
  afterNormalAccounts: number;
  afterHighRiskAccounts: number;
}

function RepDistributionCharts() {
  const reps = useAllocationStore((state) => state.reps);
  const accounts = useAllocationStore((state) => state.accounts);
  const results = useAllocationStore((state) => state.results);
  const hasRiskScore = useAllocationStore((state) => state.hasRiskScore);
  const highRiskThreshold = useAllocationStore((state) => state.highRiskThreshold);

  // Calculate before/after metrics for each rep
  const comparisonData = useMemo(() => {
    if (reps.length === 0 || accounts.length === 0 || results.length === 0) {
      return [];
    }

    // Build account map for fast lookup
    const accountMap = new Map(accounts.map(acc => [acc.Account_ID, acc]));

    // Initialize rep data structures
    const repDataMap = new Map<string, RepComparisonData>();
    reps.forEach(rep => {
      repDataMap.set(rep.Rep_Name, {
        repName: rep.Rep_Name,
        segment: rep.Segment,
        beforeNormalARR: 0,
        beforeHighRiskARR: 0,
        afterNormalARR: 0,
        afterHighRiskARR: 0,
        beforeNormalAccounts: 0,
        beforeHighRiskAccounts: 0,
        afterNormalAccounts: 0,
        afterHighRiskAccounts: 0,
      });
    });

    // Calculate "Before" metrics (Original_Rep assignments)
    accounts.forEach(account => {
      const repData = repDataMap.get(account.Original_Rep);
      if (repData) {
        const isHighRisk = hasRiskScore && account.Risk_Score !== null && account.Risk_Score >= highRiskThreshold;
        
        if (isHighRisk) {
          repData.beforeHighRiskARR += account.ARR;
          repData.beforeHighRiskAccounts += 1;
        } else {
          repData.beforeNormalARR += account.ARR;
          repData.beforeNormalAccounts += 1;
        }
      }
    });

    // Calculate "After" metrics (Assigned_Rep from results)
    results.forEach(result => {
      const account = accountMap.get(result.accountId);
      if (!account) return;

      const repData = repDataMap.get(result.assignedRep);
      if (repData) {
        const isHighRisk = hasRiskScore && account.Risk_Score !== null && account.Risk_Score >= highRiskThreshold;
        
        if (isHighRisk) {
          repData.afterHighRiskARR += account.ARR;
          repData.afterHighRiskAccounts += 1;
        } else {
          repData.afterNormalARR += account.ARR;
          repData.afterNormalAccounts += 1;
        }
      }
    });

    // Convert to array and sort by segment first (Enterprise, then Mid Market), then by rep name
    const data = Array.from(repDataMap.values());
    data.sort((a, b) => {
      // Sort by segment first (Enterprise before Mid Market)
      if (a.segment !== b.segment) {
        return a.segment === 'Enterprise' ? -1 : 1;
      }
      // Then sort by rep name alphabetically within segment
      return a.repName.localeCompare(b.repName);
    });

    return data;
  }, [reps, accounts, results, hasRiskScore, highRiskThreshold]);

  // Calculate where Mid Market segment starts for visual separator
  const midMarketStartIndex = useMemo(() => {
    return comparisonData.findIndex(d => d.segment === 'Mid Market');
  }, [comparisonData]);

  // Format currency for display
  const formatCurrency = useCallback((value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  }, []);

  // Custom tooltip for ARR - showing percentages
  const ARRTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as RepComparisonData;
      if (!data) return null;

      const beforeTotal = data.beforeNormalARR + data.beforeHighRiskARR;
      const afterTotal = data.afterNormalARR + data.afterHighRiskARR;
      
      const beforeNormalPct = beforeTotal > 0 ? (data.beforeNormalARR / beforeTotal) * 100 : 0;
      const beforeHighRiskPct = beforeTotal > 0 ? (data.beforeHighRiskARR / beforeTotal) * 100 : 0;
      const afterNormalPct = afterTotal > 0 ? (data.afterNormalARR / afterTotal) * 100 : 0;
      const afterHighRiskPct = afterTotal > 0 ? (data.afterHighRiskARR / afterTotal) * 100 : 0;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="mb-2">
            <p className="text-xs text-gray-600 mb-1">Before ARR:</p>
            <p className="text-xs text-gray-500 ml-2">Normal: {beforeNormalPct.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 ml-2">High Risk: {beforeHighRiskPct.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">After ARR:</p>
            <p className="text-xs text-gray-500 ml-2">Normal: {afterNormalPct.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 ml-2">High Risk: {afterHighRiskPct.toFixed(1)}%</p>
          </div>
        </div>
      );
    }
    return null;
  }, []);

  // Custom tooltip for Accounts - showing percentages
  const AccountsTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as RepComparisonData;
      if (!data) return null;

      const beforeTotal = data.beforeNormalAccounts + data.beforeHighRiskAccounts;
      const afterTotal = data.afterNormalAccounts + data.afterHighRiskAccounts;

      const beforeNormalPct = beforeTotal > 0 ? (data.beforeNormalAccounts / beforeTotal) * 100 : 0;
      const beforeHighRiskPct = beforeTotal > 0 ? (data.beforeHighRiskAccounts / beforeTotal) * 100 : 0;
      const afterNormalPct = afterTotal > 0 ? (data.afterNormalAccounts / afterTotal) * 100 : 0;
      const afterHighRiskPct = afterTotal > 0 ? (data.afterHighRiskAccounts / afterTotal) * 100 : 0;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="mb-2">
            <p className="text-xs text-gray-600 mb-1">Before Accounts:</p>
            <p className="text-xs text-gray-500 ml-2">Normal: {beforeNormalPct.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 ml-2">High Risk: {beforeHighRiskPct.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">After Accounts:</p>
            <p className="text-xs text-gray-500 ml-2">Normal: {afterNormalPct.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 ml-2">High Risk: {afterHighRiskPct.toFixed(1)}%</p>
          </div>
        </div>
      );
    }
    return null;
  }, []);


  // Wrap text for long labels
  const CustomTick = ({ x, y, payload }: any) => {
    const words = payload.value.split(' ');
    const maxCharsPerLine = 15;
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word: string) => {
      if ((currentLine + ' ' + word).length > maxCharsPerLine && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      }
    });
    if (currentLine) {
      lines.push(currentLine);
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#6b7280" fontSize={12}>
          {lines.map((line, index) => (
            <tspan x={0} dy={index === 0 ? 0 : 14} key={index}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  // Show empty state if no data
  if (comparisonData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">No allocation data available. Upload data and run allocation to view distribution comparison.</p>
      </div>
    );
  }

  // Custom legend with diagonal split colors
  const CustomLegend = () => {
    return (
      <div className="flex justify-center gap-6 pt-3">
        {/* Before Legend Item */}
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14">
            {/* Bottom-left triangle (blue/normal) */}
            <polygon points="0,0 0,14 14,14" fill="#93c5fd" />
            {/* Top-right triangle (red/high-risk) */}
            <polygon points="0,0 14,0 14,14" fill="#fca5a5" />
          </svg>
          <span className="text-xs text-gray-700">Before</span>
        </div>
        {/* After Legend Item */}
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14">
            {/* Bottom-left triangle (blue/normal) */}
            <polygon points="0,0 0,14 14,14" fill="#3b82f6" />
            {/* Top-right triangle (red/high-risk) */}
            <polygon points="0,0 14,0 14,14" fill="#ef4444" />
          </svg>
          <span className="text-xs text-gray-700">After</span>
        </div>
      </div>
    );
  };

  // Custom rendering for segment separator line
  const SegmentSeparator = ({ viewBox }: any) => {
    if (midMarketStartIndex <= 0) return null;
    
    const { x, y, width, height } = viewBox;
    const xPos = x + (width / comparisonData.length) * midMarketStartIndex;
    
    return (
      <g>
        <line
          x1={xPos}
          y1={y}
          x2={xPos}
          y2={y + height}
          stroke="#d1d5db"
          strokeWidth={2}
          strokeDasharray="5,5"
        />
      </g>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8">
      {/* Single Legend at Top */}
      <CustomLegend />
      
      <div className="space-y-4 mt-4">
        {/* ARR Chart - Stacked */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-3">ARR</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={comparisonData}
              margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="repName" 
                stroke="#6b7280" 
                tick={{ fontSize: 11 }}
                interval={0}
                height={30}
              />
              <YAxis 
                tickFormatter={formatCurrency} 
                stroke="#6b7280" 
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<ARRTooltip />} />
              {/* Before - Stacked */}
              <Bar 
                dataKey="beforeNormalARR" 
                stackId="before"
                fill="#93c5fd" 
                name="Before" 
              />
              <Bar 
                dataKey="beforeHighRiskARR" 
                stackId="before"
                fill="#fca5a5" 
                name="Before (High Risk)" 
                radius={[4, 4, 0, 0]}
              >
                <LabelList 
                  dataKey={((data: RepComparisonData) => data.beforeNormalARR + data.beforeHighRiskARR) as any}
                  position="top" 
                  formatter={formatCurrency as any}
                  style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} 
                />
              </Bar>
              {/* After - Stacked */}
              <Bar 
                dataKey="afterNormalARR" 
                stackId="after"
                fill="#3b82f6" 
                name="After" 
              />
              <Bar 
                dataKey="afterHighRiskARR" 
                stackId="after"
                fill="#ef4444" 
                name="After (High Risk)" 
                radius={[4, 4, 0, 0]}
              >
                <LabelList 
                  dataKey={((data: RepComparisonData) => data.afterNormalARR + data.afterHighRiskARR) as any}
                  position="top" 
                  formatter={formatCurrency as any}
                  style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Account Count Chart - Stacked */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-3">Accounts</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={comparisonData}
              margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="repName" 
                stroke="#6b7280" 
                tick={{ fontSize: 11 }}
                interval={0}
                height={30}
              />
              <YAxis 
                stroke="#6b7280" 
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<AccountsTooltip />} />
              {/* Before - Stacked */}
              <Bar 
                dataKey="beforeNormalAccounts" 
                stackId="before"
                fill="#93c5fd" 
                name="Before" 
              />
              <Bar 
                dataKey="beforeHighRiskAccounts" 
                stackId="before"
                fill="#fca5a5" 
                name="Before (High Risk)" 
                radius={[4, 4, 0, 0]}
              >
                <LabelList 
                  dataKey={((data: RepComparisonData) => data.beforeNormalAccounts + data.beforeHighRiskAccounts) as any}
                  position="top" 
                  style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} 
                />
              </Bar>
              {/* After - Stacked */}
              <Bar 
                dataKey="afterNormalAccounts" 
                stackId="after"
                fill="#3b82f6" 
                name="After" 
              />
              <Bar 
                dataKey="afterHighRiskAccounts" 
                stackId="after"
                fill="#ef4444" 
                name="After (High Risk)" 
                radius={[4, 4, 0, 0]}
              >
                <LabelList 
                  dataKey={((data: RepComparisonData) => data.afterNormalAccounts + data.afterHighRiskAccounts) as any}
                  position="top" 
                  style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default RepDistributionCharts;
