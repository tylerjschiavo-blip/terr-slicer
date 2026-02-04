/**
 * ARR Comparison Chart Component
 * Displays before/after ARR distribution using clustered bar chart
 * 
 * Task: AE-32
 * 
 * Features:
 * - Clustered columns showing Before (Original_Rep) and After (Assigned_Rep) ARR per rep
 * - Color coding: Before (lighter), After (darker)
 * - Tooltip shows rep name, before/after ARR, and delta
 * - Currency formatting for ARR values
 * - Legend explaining Before vs After
 */

import { useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAllocationStore } from '@/store/allocationStore';

interface RepComparisonData {
  repName: string;
  beforeARR: number;
  afterARR: number;
  delta: number;
  deltaPercent: number;
}

function ArrComparisonChart() {
  const reps = useAllocationStore((state) => state.reps);
  const accounts = useAllocationStore((state) => state.accounts);
  const results = useAllocationStore((state) => state.results);

  // Calculate before/after ARR for each rep
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
        beforeARR: 0,
        afterARR: 0,
        delta: 0,
        deltaPercent: 0,
      });
    });

    // Calculate "Before" ARR (Original_Rep assignments)
    accounts.forEach(account => {
      const repData = repDataMap.get(account.Original_Rep);
      if (repData) {
        repData.beforeARR += account.ARR;
      }
    });

    // Calculate "After" ARR (Assigned_Rep from results)
    results.forEach(result => {
      const account = accountMap.get(result.accountId);
      if (!account) return;

      const repData = repDataMap.get(result.assignedRep);
      if (repData) {
        repData.afterARR += account.ARR;
      }
    });

    // Calculate deltas
    repDataMap.forEach(repData => {
      repData.delta = repData.afterARR - repData.beforeARR;
      repData.deltaPercent = repData.beforeARR > 0 
        ? ((repData.delta / repData.beforeARR) * 100) 
        : (repData.afterARR > 0 ? 100 : 0);
    });

    // Convert to array and sort by rep name
    const data = Array.from(repDataMap.values());
    data.sort((a, b) => a.repName.localeCompare(b.repName));

    return data;
  }, [reps, accounts, results]);

  // Format currency for display
  const formatCurrency = useCallback((value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  }, []);

  // Custom tooltip with delta information
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as RepComparisonData;
      if (!data) return null;

      const deltaSign = data.delta >= 0 ? '+' : '';
      const deltaColor = data.delta >= 0 ? '#16a34a' : '#dc2626';

      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <p style={{ color: '#94a3b8' }} className="text-sm">
            Before: {formatCurrency(data.beforeARR)}
          </p>
          <p style={{ color: '#475569' }} className="text-sm">
            After: {formatCurrency(data.afterARR)}
          </p>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p style={{ color: deltaColor }} className="text-sm font-semibold">
              Delta: {deltaSign}{formatCurrency(data.delta)} ({deltaSign}{data.deltaPercent.toFixed(1)}%)
            </p>
          </div>
        </div>
      );
    }
    return null;
  }, [formatCurrency]);

  // Show empty state if no data
  if (reps.length === 0 || accounts.length === 0 || results.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ARR Comparison</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No allocation data available. Upload data and run allocation to view ARR comparison.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">ARR Comparison</h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={comparisonData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="repName" 
            stroke="#6b7280" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tickFormatter={formatCurrency} 
            stroke="#6b7280" 
            tick={{ fontSize: 12 }}
            label={{ 
              value: 'ARR', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#6b7280' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
          <Bar 
            dataKey="beforeARR" 
            fill="#94a3b8" 
            name="Before (Original)" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="afterARR" 
            fill="#475569" 
            name="After (New Allocation)" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ArrComparisonChart;
