/**
 * Account Distribution Comparison Chart
 * Shows before/after account count distribution across all reps
 * 
 * Task: AE-33 - Build before/after account distribution charts
 * Wave 5: Territory Comparison
 * 
 * Features:
 * - Clustered column chart (Before vs After)
 * - Before: Original_Rep assignments from accounts data
 * - After: Assigned_Rep from allocation results
 * - Tooltip shows rep name, before count, after count, and delta
 * - Integer formatting for account counts
 */

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAllocationStore } from '@/store/allocationStore';

interface RepComparisonData {
  repName: string;
  before: number;
  after: number;
  delta: number;
}

function AccountDistributionChart() {
  const reps = useAllocationStore((state) => state.reps);
  const accounts = useAllocationStore((state) => state.accounts);
  const results = useAllocationStore((state) => state.results);

  // Calculate before/after account counts per rep
  const comparisonData = useMemo(() => {
    if (reps.length === 0 || accounts.length === 0 || results.length === 0) {
      return [];
    }

    // Initialize map with all reps (ensure we show all reps, even those with 0 accounts)
    const repMap = new Map<string, RepComparisonData>();
    reps.forEach(rep => {
      repMap.set(rep.Rep_Name, {
        repName: rep.Rep_Name,
        before: 0,
        after: 0,
        delta: 0,
      });
    });

    // Count "Before" accounts (Original_Rep)
    accounts.forEach(account => {
      const repData = repMap.get(account.Original_Rep);
      if (repData) {
        repData.before += 1;
      }
    });

    // Count "After" accounts (Assigned_Rep from results)
    results.forEach(result => {
      const repData = repMap.get(result.assignedRep);
      if (repData) {
        repData.after += 1;
      }
    });

    // Calculate delta and convert to array
    const data = Array.from(repMap.values()).map(rep => ({
      ...rep,
      delta: rep.after - rep.before,
    }));

    // Sort by rep name for consistent display
    data.sort((a, b) => a.repName.localeCompare(b.repName));

    return data;
  }, [reps, accounts, results]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (!data) return null;

      const deltaText = data.delta > 0 ? `+${data.delta}` : data.delta.toString();
      const deltaColor = data.delta > 0 ? '#16a34a' : data.delta < 0 ? '#dc2626' : '#6b7280';

      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Before: {data.before}
          </p>
          <p className="text-sm" style={{ color: '#475569' }}>
            After: {data.after}
          </p>
          <p className="text-sm font-semibold mt-1 pt-1 border-t border-gray-200" style={{ color: deltaColor }}>
            Delta: {deltaText}
          </p>
        </div>
      );
    }
    return null;
  };

  // Show empty state if no data
  if (comparisonData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">No allocation data available. Upload data and run allocation to view account distribution comparison.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8">
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
            stroke="#6b7280" 
            tick={{ fontSize: 12 }}
            label={{ value: 'Account Count', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
          <Bar 
            dataKey="before" 
            fill="#94a3b8" 
            name="Before (Original)" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="after" 
            fill="#475569" 
            name="After (New Allocation)" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AccountDistributionChart;
