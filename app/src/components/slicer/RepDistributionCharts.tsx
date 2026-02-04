/**
 * Rep Distribution Charts Component
 * Displays ARR and Account distribution across Enterprise and Mid-Market reps
 * 
 * Task: AE-26
 * 
 * Features:
 * - Horizontal bar charts showing ARR and Account distribution
 * - Stacked bars: Base ARR + High-Risk ARR (when Risk_Score available)
 * - Average trend lines for each metric
 * - Separate charts for Enterprise and Mid-Market segments
 */

import { useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, LabelList } from 'recharts';
import { useAllocationStore } from '../../store/allocationStore';

interface RepData {
  repName: string;
  baseARR: number;
  highRiskARR: number;
  totalARR: number;
  accountCount: number;
  baseAccountCount: number;
  highRiskAccountCount: number;
  displayTotal: number;
  displayTotalAccounts: number;
}

function RepDistributionCharts() {
  const reps = useAllocationStore((state) => state.reps);
  const accounts = useAllocationStore((state) => state.accounts);
  const results = useAllocationStore((state) => state.results);
  const hasRiskScore = useAllocationStore((state) => state.hasRiskScore);
  const highRiskThreshold = useAllocationStore((state) => state.highRiskThreshold);

  // Calculate rep data (ARR and account counts)
  const { enterpriseData, midMarketData } = useMemo(() => {
    if (reps.length === 0 || accounts.length === 0 || results.length === 0) {
      return { enterpriseData: [], midMarketData: [] };
    }

    // Build account map for fast lookup
    const accountMap = new Map(accounts.map(acc => [acc.Account_ID, acc]));

    // Initialize rep data structures
    const repDataMap = new Map<string, RepData>();
    reps.forEach(rep => {
      repDataMap.set(rep.Rep_Name, {
        repName: rep.Rep_Name,
        baseARR: 0,
        highRiskARR: 0,
        totalARR: 0,
        accountCount: 0,
        baseAccountCount: 0,
        highRiskAccountCount: 0,
        displayTotal: 0,
        displayTotalAccounts: 0,
      });
    });

    // Aggregate data from allocation results
    results.forEach(result => {
      const account = accountMap.get(result.accountId);
      if (!account) return;

      const repData = repDataMap.get(result.assignedRep);
      if (!repData) return;

      // Increment account count
      repData.accountCount += 1;
      repData.totalARR += account.ARR;

      // Split into base and high-risk ARR/accounts
      const isHighRisk = hasRiskScore && account.Risk_Score !== null && account.Risk_Score >= highRiskThreshold;
      if (isHighRisk) {
        repData.highRiskARR += account.ARR;
        repData.highRiskAccountCount += 1;
      } else {
        repData.baseARR += account.ARR;
        repData.baseAccountCount += 1;
      }
    });

    // Separate by segment
    const enterprise: RepData[] = [];
    const midMarket: RepData[] = [];

    reps.forEach(rep => {
      const repData = repDataMap.get(rep.Rep_Name);
      if (!repData) return;

      // Set displayTotal values for label rendering
      repData.displayTotal = repData.totalARR;
      repData.displayTotalAccounts = repData.accountCount;

      if (rep.Segment === 'Enterprise') {
        enterprise.push(repData);
      } else {
        midMarket.push(repData);
      }
    });

    // Sort by total ARR descending
    enterprise.sort((a, b) => b.totalARR - a.totalARR);
    midMarket.sort((a, b) => b.totalARR - a.totalARR);

    return { enterpriseData: enterprise, midMarketData: midMarket };
  }, [reps, accounts, results, hasRiskScore, highRiskThreshold]);

  // Calculate averages for trend lines
  const enterpriseAvgARR = useMemo(() => {
    if (enterpriseData.length === 0) return 0;
    const total = enterpriseData.reduce((sum, d) => sum + d.totalARR, 0);
    return total / enterpriseData.length;
  }, [enterpriseData]);

  const enterpriseAvgAccounts = useMemo(() => {
    if (enterpriseData.length === 0) return 0;
    const total = enterpriseData.reduce((sum, d) => sum + d.accountCount, 0);
    return total / enterpriseData.length;
  }, [enterpriseData]);

  const midMarketAvgARR = useMemo(() => {
    if (midMarketData.length === 0) return 0;
    const total = midMarketData.reduce((sum, d) => sum + d.totalARR, 0);
    return total / midMarketData.length;
  }, [midMarketData]);

  const midMarketAvgAccounts = useMemo(() => {
    if (midMarketData.length === 0) return 0;
    const total = midMarketData.reduce((sum, d) => sum + d.accountCount, 0);
    return total / midMarketData.length;
  }, [midMarketData]);

  // Format currency for display
  const formatCurrency = useCallback((value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  }, []);

  // Custom tooltip formatter - shows percentages instead of gross values
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Calculate totals from payload data
      const data = payload[0]?.payload;
      if (!data) return null;

      const isARRChart = payload.some((p: any) => p.name.includes('ARR'));
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          {isARRChart ? (
            <>
              {hasRiskScore ? (
                <>
                  <p style={{ color: '#3b82f6' }} className="text-sm">
                    Base: {formatCurrency(data.baseARR)} ({((data.baseARR / data.totalARR) * 100).toFixed(1)}%)
                  </p>
                  <p style={{ color: '#ef4444' }} className="text-sm">
                    High-Risk: {formatCurrency(data.highRiskARR)} ({((data.highRiskARR / data.totalARR) * 100).toFixed(1)}%)
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1 pt-1 border-t border-gray-200">
                    Total: {formatCurrency(data.totalARR)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-900">
                  Total: {formatCurrency(data.totalARR)}
                </p>
              )}
            </>
          ) : (
            <>
              {hasRiskScore ? (
                <>
                  <p style={{ color: '#3b82f6' }} className="text-sm">
                    Base: {data.baseAccountCount} ({((data.baseAccountCount / data.accountCount) * 100).toFixed(1)}%)
                  </p>
                  <p style={{ color: '#ef4444' }} className="text-sm">
                    High-Risk: {data.highRiskAccountCount} ({((data.highRiskAccountCount / data.accountCount) * 100).toFixed(1)}%)
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1 pt-1 border-t border-gray-200">
                    Total: {data.accountCount}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-900">
                  Total: {data.accountCount}
                </p>
              )}
            </>
          )}
        </div>
      );
    }
    return null;
  }, [formatCurrency, hasRiskScore]);

  // Custom label for stacked ARR bars - shows total at top of entire stack
  const renderStackedARRLabel = useCallback((props: any) => {
    const { x, y, width, height, value, payload, viewBox } = props;
    
    if (!payload) return null;
    
    // Calculate total from baseARR + highRiskARR
    const baseARR = payload.baseARR || 0;
    const highRiskARR = payload.highRiskARR || 0;
    const total = baseARR + highRiskARR;
    
    if (total === 0) return null;
    
    // For stacked bars, we need to calculate the Y position at the top of the entire stack
    // The 'y' here is the top of the baseARR bar, so we need to account for the highRiskARR height
    const chartHeight = viewBox?.height || 0;
    const maxValue = viewBox?.maxValue || total;
    
    // Calculate the height of highRiskARR as a proportion
    const highRiskHeight = chartHeight * (highRiskARR / maxValue);
    
    // Position label at the top of the stack (top of highRiskARR)
    const labelY = y - highRiskHeight - 8;
    
    return (
      <text 
        x={x + (width / 2)} 
        y={labelY} 
        fill="#374151" 
        textAnchor="middle" 
        fontSize="11"
        fontWeight="600"
      >
        {formatCurrency(total)}
      </text>
    );
  }, [formatCurrency]);

  // Show empty state if no data
  if (reps.length === 0 || accounts.length === 0 || results.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Rep Distribution</h2>
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">No allocation data available. Upload data and run allocation to view rep distribution.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Rep Distribution</h2>
      
      {/* Side-by-side: Enterprise left, Mid-Market right */}
      {/* Mobile: stack vertically, Tablet+: side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enterprise Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Enterprise ({enterpriseData.length} reps)
          </h3>
          <div className="space-y-4">
            {/* ARR Chart */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5">
              <p className="text-xs font-medium text-gray-600 mb-3">ARR Distribution</p>
              {enterpriseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={enterpriseData}
                    margin={{ top: 25, right: 15, left: 15, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="repName" 
                      stroke="#6b7280" 
                      tick={{ fontSize: 11 }}
                      interval={0}
                      height={30}
                    />
                    <YAxis tickFormatter={formatCurrency} stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="baseARR" stackId="a" fill="#3b82f6" name="Base ARR" radius={hasRiskScore ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
                    {hasRiskScore && (
                      <Bar dataKey="highRiskARR" stackId="a" fill="#ef4444" name="High-Risk ARR" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="displayTotal" position="top" formatter={formatCurrency} style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} />
                      </Bar>
                    )}
                    {!hasRiskScore && (
                      <Bar dataKey="displayTotal" stackId="a" fill="transparent" radius={[0, 0, 0, 0]}>
                        <LabelList dataKey="displayTotal" position="top" formatter={formatCurrency} style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} />
                      </Bar>
                    )}
                    <ReferenceLine y={enterpriseAvgARR} stroke="#16a34a" strokeWidth={2} strokeDasharray="5 5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                  No Enterprise reps
                </div>
              )}
            </div>

            {/* Accounts Chart */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5">
              <p className="text-xs font-medium text-gray-600 mb-3">Account Distribution</p>
              {enterpriseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={enterpriseData}
                    margin={{ top: 25, right: 15, left: 15, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="repName" 
                      stroke="#6b7280" 
                      tick={{ fontSize: 11 }}
                      interval={0}
                      height={30}
                    />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="baseAccountCount" stackId="a" fill="#3b82f6" name="Base Accounts" radius={hasRiskScore ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
                    {hasRiskScore && (
                      <Bar dataKey="highRiskAccountCount" stackId="a" fill="#ef4444" name="High-Risk Accounts" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="displayTotalAccounts" position="top" style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} />
                      </Bar>
                    )}
                    {!hasRiskScore && (
                      <Bar dataKey="displayTotalAccounts" stackId="a" fill="transparent" radius={[0, 0, 0, 0]}>
                        <LabelList dataKey="displayTotalAccounts" position="top" style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} />
                      </Bar>
                    )}
                    <ReferenceLine y={enterpriseAvgAccounts} stroke="#16a34a" strokeWidth={2} strokeDasharray="5 5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                  No Enterprise reps
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mid Market Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Mid Market ({midMarketData.length} reps)
          </h3>
          <div className="space-y-4">
            {/* ARR Chart */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5">
              <p className="text-xs font-medium text-gray-600 mb-3">ARR Distribution</p>
              {midMarketData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={midMarketData}
                    margin={{ top: 25, right: 15, left: 15, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="repName" 
                      stroke="#6b7280" 
                      tick={{ fontSize: 11 }}
                      interval={0}
                      height={30}
                    />
                    <YAxis tickFormatter={formatCurrency} stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="baseARR" stackId="a" fill="#3b82f6" name="Base ARR" radius={hasRiskScore ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
                    {hasRiskScore && (
                      <Bar dataKey="highRiskARR" stackId="a" fill="#ef4444" name="High-Risk ARR" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="displayTotal" position="top" formatter={formatCurrency} style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} />
                      </Bar>
                    )}
                    {!hasRiskScore && (
                      <Bar dataKey="displayTotal" stackId="a" fill="transparent" radius={[0, 0, 0, 0]}>
                        <LabelList dataKey="displayTotal" position="top" formatter={formatCurrency} style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} />
                      </Bar>
                    )}
                    <ReferenceLine y={midMarketAvgARR} stroke="#16a34a" strokeWidth={2} strokeDasharray="5 5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                  No Mid-Market reps
                </div>
              )}
            </div>

            {/* Accounts Chart */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5">
              <p className="text-xs font-medium text-gray-600 mb-3">Account Distribution</p>
              {midMarketData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={midMarketData}
                    margin={{ top: 25, right: 15, left: 15, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="repName" 
                      stroke="#6b7280" 
                      tick={{ fontSize: 11 }}
                      interval={0}
                      height={30}
                    />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="baseAccountCount" stackId="a" fill="#3b82f6" name="Base Accounts" radius={hasRiskScore ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
                    {hasRiskScore && (
                      <Bar dataKey="highRiskAccountCount" stackId="a" fill="#ef4444" name="High-Risk Accounts" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="displayTotalAccounts" position="top" style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} />
                      </Bar>
                    )}
                    {!hasRiskScore && (
                      <Bar dataKey="displayTotalAccounts" stackId="a" fill="transparent" radius={[0, 0, 0, 0]}>
                        <LabelList dataKey="displayTotalAccounts" position="top" style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} />
                      </Bar>
                    )}
                    <ReferenceLine y={midMarketAvgAccounts} stroke="#16a34a" strokeWidth={2} strokeDasharray="5 5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                  No Mid-Market reps
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RepDistributionCharts;
