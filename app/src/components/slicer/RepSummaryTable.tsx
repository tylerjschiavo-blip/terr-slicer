/**
 * Rep Summary Table Component
 * Displays per-rep metrics in a sortable table
 * 
 * Task: AE-28 - Implement rep summary table
 * 
 * Columns: Rep, ARR, Accounts, Avg Deal, Geo Match %, Preserve %
 * Sortable by all columns
 * Grouped by segment (Enterprise first, then Mid-Market)
 */

import { useMemo, useState } from 'react';
import { useAllocationStore } from '@/store/allocationStore';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatting';
import type { Rep, Account, AllocationResult } from '@/types';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface RepMetrics {
  rep: Rep;
  arr: number;
  accountCount: number;
  avgDeal: number;
  geoMatchPercent: number;
  preservePercent: number;
}

type SortColumn = 'rep' | 'arr' | 'accounts' | 'avgDeal' | 'geoMatch' | 'preserve';
type SortDirection = 'asc' | 'desc';

/**
 * Calculate metrics for each rep
 */
function calculateRepMetrics(
  reps: Rep[],
  accounts: Account[],
  allocationResults: AllocationResult[]
): RepMetrics[] {
  return reps.map((rep) => {
    // Find all accounts assigned to this rep
    const repAllocations = allocationResults.filter(
      (result) => result.assignedRep === rep.Rep_Name
    );
    
    // Get full account objects for assigned accounts
    const assignedAccounts = repAllocations.map((result) =>
      accounts.find((acc) => acc.Account_ID === result.accountId)
    ).filter((acc): acc is Account => acc !== undefined);

    // Calculate metrics
    const arr = assignedAccounts.reduce((sum, acc) => sum + acc.ARR, 0);
    const accountCount = assignedAccounts.length;
    const avgDeal = accountCount > 0 ? arr / accountCount : 0;

    // Calculate Geo Match %: (accounts with geo match / total accounts) * 100
    const geoMatchCount = assignedAccounts.filter(
      (acc) => acc.Location.toLowerCase() === rep.Location.toLowerCase()
    ).length;
    const geoMatchPercent = accountCount > 0 ? (geoMatchCount / accountCount) * 100 : 0;

    // Calculate Preserve %: (accounts with Original_Rep match / total accounts) * 100
    const preserveCount = assignedAccounts.filter(
      (acc) => acc.Original_Rep === rep.Rep_Name
    ).length;
    const preservePercent = accountCount > 0 ? (preserveCount / accountCount) * 100 : 0;

    return {
      rep,
      arr,
      accountCount,
      avgDeal,
      geoMatchPercent,
      preservePercent,
    };
  });
}

/**
 * Sort rep metrics by column
 */
function sortRepMetrics(
  metrics: RepMetrics[],
  sortColumn: SortColumn,
  sortDirection: SortDirection
): RepMetrics[] {
  const sorted = [...metrics].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortColumn) {
      case 'rep':
        aValue = a.rep.Rep_Name;
        bValue = b.rep.Rep_Name;
        break;
      case 'arr':
        aValue = a.arr;
        bValue = b.arr;
        break;
      case 'accounts':
        aValue = a.accountCount;
        bValue = b.accountCount;
        break;
      case 'avgDeal':
        aValue = a.avgDeal;
        bValue = b.avgDeal;
        break;
      case 'geoMatch':
        aValue = a.geoMatchPercent;
        bValue = b.geoMatchPercent;
        break;
      case 'preserve':
        aValue = a.preservePercent;
        bValue = b.preservePercent;
        break;
      default:
        aValue = 0;
        bValue = 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  return sorted;
}

function RepSummaryTable() {
  const { reps, accounts, results } = useAllocationStore();
  const [sortColumn, setSortColumn] = useState<SortColumn>('rep');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Calculate metrics for all reps
  const repMetrics = useMemo(() => {
    const metrics = calculateRepMetrics(reps, accounts, results);
    
    // Group by segment: Enterprise first, then Mid Market
    const enterpriseMetrics = metrics.filter((m) => m.rep.Segment === 'Enterprise');
    const midMarketMetrics = metrics.filter((m) => m.rep.Segment === 'Mid Market');
    
    // Sort each segment
    const sortedEnterprise = sortRepMetrics(enterpriseMetrics, sortColumn, sortDirection);
    const sortedMidMarket = sortRepMetrics(midMarketMetrics, sortColumn, sortDirection);
    
    // Return Enterprise reps first, then Mid Market reps
    return [...sortedEnterprise, ...sortedMidMarket];
  }, [reps, accounts, results, sortColumn, sortDirection]);

  // Handle column header click for sorting
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with ascending direction
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Render sort indicator
  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return null;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="inline-block w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="inline-block w-4 h-4 ml-1" />
    );
  };

  return (
    <div className="mb-8">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">
        Rep Summary ({repMetrics.length})
      </h2>
      
      {results.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Rep</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">ARR</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Accounts</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Avg Deal</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Geo Match %</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Preserve %</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No allocation results yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Enable horizontal scroll on mobile, ensure minimum table width */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="text-left px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('rep')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSort('rep');
                    }
                  }}
                  aria-label="Sort by Rep"
                >
                  Rep {renderSortIcon('rep')}
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">
                  Location
                </th>
                <th
                  className="text-right px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('arr')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSort('arr');
                    }
                  }}
                  aria-label="Sort by ARR"
                >
                  ARR {renderSortIcon('arr')}
                </th>
                <th
                  className="text-right px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('accounts')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSort('accounts');
                    }
                  }}
                  aria-label="Sort by Accounts"
                >
                  Accounts {renderSortIcon('accounts')}
                </th>
                <th
                  className="text-right px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('avgDeal')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSort('avgDeal');
                    }
                  }}
                  aria-label="Sort by Average Deal"
                >
                  Avg Deal {renderSortIcon('avgDeal')}
                </th>
                <th
                  className="text-right px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('geoMatch')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSort('geoMatch');
                    }
                  }}
                  aria-label="Sort by Geo Match Percentage"
                >
                  Geo Match % {renderSortIcon('geoMatch')}
                </th>
                <th
                  className="text-right px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('preserve')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSort('preserve');
                    }
                  }}
                  aria-label="Sort by Preserve Percentage"
                >
                  Preserve % {renderSortIcon('preserve')}
                </th>
              </tr>
            </thead>
            <tbody>
              {repMetrics.map((metric, index) => (
                <tr
                  key={metric.rep.Rep_Name}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-3 text-gray-900">
                    {metric.rep.Rep_Name}
                    <span className="ml-2 text-xs text-gray-500">
                      ({metric.rep.Segment === 'Enterprise' ? 'E' : 'MM'})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {metric.rep.Location}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium">
                    {formatCurrency(metric.arr)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {metric.accountCount}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {metric.accountCount > 0 ? formatCurrency(metric.avgDeal) : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {metric.accountCount > 0 ? formatPercentage(metric.geoMatchPercent) : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {metric.accountCount > 0 ? formatPercentage(metric.preservePercent) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}

export default RepSummaryTable;
