/**
 * Account Assignments Table Component
 * Displays all accounts with assigned rep, segment, location, ARR, employees, risk
 * 
 * Task: AE-29 - Build account assignments table
 * 
 * Features:
 * - Sortable columns
 * - Filterable by segment (with filtered rep list), rep, high risk toggle
 * - Formatted numbers (ARR as currency, Employees with K suffix, Risk as integer)
 * - Pagination for large datasets (>100 rows)
 * - Real-time updates when allocation changes
 */

import { useState, useMemo } from 'react';
import { useAllocationStore } from '@/store/allocationStore';
import { formatCurrency } from '@/lib/utils/formatting';
import type { Account } from '@/types';

// ============================================================================
// Types
// ============================================================================

type SortColumn = 'accountId' | 'accountName' | 'segment' | 'assignedRep' | 'arr' | 'employees' | 'riskScore';
type SortDirection = 'asc' | 'desc';

interface AccountWithAssignment extends Account {
  assignedRep: string;
  segment: 'Enterprise' | 'Mid Market';
}

/**
 * Format employee count with K suffix
 * Examples: 53K, 2.5K, 450
 */
function formatEmployees(value: number): string {
  if (value >= 1_000) {
    const thousands = value / 1_000;
    // Remove trailing .0 for whole numbers
    const formatted = thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1);
    return `${formatted}K`;
  } else {
    return value.toString();
  }
}

// ============================================================================
// Component
// ============================================================================

function AccountAssignmentsTable() {
  const { accounts, results, hasRiskScore, highRiskThreshold } = useAllocationStore();

  // Component state
  const [sortColumn, setSortColumn] = useState<SortColumn>('accountId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterSegment, setFilterSegment] = useState<string>('all');
  const [filterRep, setFilterRep] = useState<string>('all');
  const [filterHighRisk, setFilterHighRisk] = useState<boolean>(false);

  // Join accounts with allocation results
  const accountsWithAssignments: AccountWithAssignment[] = useMemo(() => {
    if (results.length === 0) return [];

    // Create a map of accountId -> AllocationResult for fast lookup
    const resultsMap = new Map(results.map(r => [r.accountId, r]));

    return accounts.map(account => {
      const result = resultsMap.get(account.Account_ID);
      return {
        ...account,
        assignedRep: result?.assignedRep || 'Unassigned',
        segment: result?.segment || 'Mid Market',
      };
    });
  }, [accounts, results]);

  // Get unique reps for filter dropdown (filtered by selected segment)
  const uniqueReps = useMemo(() => {
    const filteredBySegment = filterSegment === 'all' 
      ? accountsWithAssignments 
      : accountsWithAssignments.filter(a => a.segment === filterSegment);
    
    const reps = new Set(filteredBySegment.map(a => a.assignedRep));
    return Array.from(reps).sort();
  }, [accountsWithAssignments, filterSegment]);

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return accountsWithAssignments.filter(account => {
      // Segment filter
      if (filterSegment !== 'all' && account.segment !== filterSegment) {
        return false;
      }

      // Rep filter
      if (filterRep !== 'all' && account.assignedRep !== filterRep) {
        return false;
      }

      // High Risk toggle filter
      if (filterHighRisk && account.Risk_Score !== null) {
        if (account.Risk_Score < highRiskThreshold) return false;
      }

      return true;
    });
  }, [accountsWithAssignments, filterSegment, filterRep, filterHighRisk, highRiskThreshold]);

  // Sort accounts
  const sortedAccounts = useMemo(() => {
    const sorted = [...filteredAccounts];
    
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'accountId':
          aValue = a.Account_ID;
          bValue = b.Account_ID;
          break;
        case 'accountName':
          aValue = a.Account_Name;
          bValue = b.Account_Name;
          break;
        case 'segment':
          aValue = a.segment;
          bValue = b.segment;
          break;
        case 'assignedRep':
          aValue = a.assignedRep;
          bValue = b.assignedRep;
          break;
        case 'arr':
          aValue = a.ARR;
          bValue = b.ARR;
          break;
        case 'employees':
          aValue = a.Num_Employees;
          bValue = b.Num_Employees;
          break;
        case 'riskScore':
          aValue = a.Risk_Score ?? -1; // Put nulls at the end
          bValue = b.Risk_Score ?? -1;
          break;
        default:
          return 0;
      }

      // Compare values
      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      }
    });

    return sorted;
  }, [filteredAccounts, sortColumn, sortDirection]);

  // Handle column sort
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilterSegment('all');
    setFilterRep('all');
    setFilterHighRisk(false);
  };
  
  // Reset rep filter when segment changes
  const handleSegmentChange = (value: string) => {
    setFilterSegment(value);
    setFilterRep('all'); // Reset rep filter when segment changes
  };

  // Sort indicator
  const SortIndicator = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return (
      <span className="ml-1 text-xs">
        {sortDirection === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <div className="mb-8">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">
        Account Assignments ({accountsWithAssignments.length})
      </h2>
      
      <div className="space-y-4">
          {/* Filters */}
          {accountsWithAssignments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              {/* Responsive filter grid: Stack on mobile, 2 cols on tablet, 4 cols on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                {/* Segment filter */}
                <div>
                  <label htmlFor="filter-segment" className="block text-sm font-medium text-gray-700 mb-1">
                    Segment
                  </label>
                  <select
                    id="filter-segment"
                    value={filterSegment}
                    onChange={(e) => handleSegmentChange(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  >
                    <option value="all">All Segments</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Mid Market">Mid Market</option>
                  </select>
                </div>

                {/* Rep filter */}
                <div>
                  <label htmlFor="filter-rep" className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Rep
                  </label>
                  <select
                    id="filter-rep"
                    value={filterRep}
                    onChange={(e) => setFilterRep(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  >
                    <option value="all">All Reps</option>
                    {uniqueReps.map(rep => (
                      <option key={rep} value={rep}>{rep}</option>
                    ))}
                  </select>
                </div>

                {/* High Risk toggle (only show if risk scores available) */}
                {hasRiskScore && (
                  <div>
                    <label htmlFor="filter-high-risk" className="block text-sm font-medium text-gray-700 mb-1">
                      High Risk (≥{highRiskThreshold})
                    </label>
                    <label className="flex items-center min-h-[44px] px-3 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50">
                      <input
                        id="filter-high-risk"
                        type="checkbox"
                        checked={filterHighRisk}
                        onChange={(e) => setFilterHighRisk(e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Show only
                      </span>
                    </label>
                  </div>
                )}

                {/* Reset button */}
                <div className="flex items-end">
                  <button
                    onClick={handleResetFilters}
                    className="w-full sm:w-auto px-4 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors min-h-[44px]"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* Filter summary */}
              <div className="text-xs text-gray-500">
                Showing {sortedAccounts.length} of {accountsWithAssignments.length} accounts
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {/* Enable horizontal scroll on mobile, ensure minimum table width */}
            <div className="overflow-x-auto max-h-[675px] overflow-y-auto">
              <table className="w-full text-sm min-w-[1000px]">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th
                      onClick={() => handleSort('accountId')}
                      className="text-left px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      Account ID <SortIndicator column="accountId" />
                    </th>
                    <th
                      onClick={() => handleSort('accountName')}
                      className="text-left px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      Account Name <SortIndicator column="accountName" />
                    </th>
                    <th
                      onClick={() => handleSort('segment')}
                      className="text-left px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      Segment <SortIndicator column="segment" />
                    </th>
                    <th
                      onClick={() => handleSort('assignedRep')}
                      className="text-left px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      Assigned Rep <SortIndicator column="assignedRep" />
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">
                      Location
                    </th>
                    <th
                      onClick={() => handleSort('arr')}
                      className="text-right px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      ARR <SortIndicator column="arr" />
                    </th>
                    <th
                      onClick={() => handleSort('employees')}
                      className="text-right px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      Employees <SortIndicator column="employees" />
                    </th>
                    {hasRiskScore && (
                      <th
                        onClick={() => handleSort('riskScore')}
                        className="text-right px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        Risk Score <SortIndicator column="riskScore" />
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedAccounts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={hasRiskScore ? 8 : 7}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        {accountsWithAssignments.length === 0
                          ? 'No allocation results yet'
                          : 'No accounts match the selected filters'}
                      </td>
                    </tr>
                  ) : (
                    sortedAccounts.map((account) => (
                      <tr
                        key={account.Account_ID}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-900">
                          {account.Account_ID}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {account.Account_Name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                              account.segment === 'Enterprise'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {account.segment}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {account.assignedRep}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {account.Location}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900 font-medium">
                          {formatCurrency(account.ARR)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {formatEmployees(account.Num_Employees)}
                        </td>
                        {hasRiskScore && (
                          <td className="px-4 py-3 text-right text-gray-900">
                            {account.Risk_Score !== null
                              ? account.Risk_Score.toFixed(0)
                              : 'N/A'}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  );
}

export default AccountAssignmentsTable;
