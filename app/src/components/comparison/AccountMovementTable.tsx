/**
 * Account Movement Table Component
 * Displays accounts that changed reps (Original_Rep ≠ Assigned_Rep)
 * 
 * Task: AE-35 - Create account movement table with filtering
 * 
 * Features:
 * - Sortable columns
 * - Filterable by segment, from rep, to rep
 * - Formatted numbers (ARR as currency)
 * - Real-time updates when allocation changes
 */

import { useState, useMemo } from 'react';
import { useAllocationStore } from '@/store/allocationStore';
import { formatCurrency } from '@/lib/utils/formatting';
import type { Account } from '@/types';

// ============================================================================
// Types
// ============================================================================

type SortColumn = 'accountId' | 'accountName' | 'location' | 'employees' | 'fromRep' | 'fromSegment' | 'toRep' | 'toSegment' | 'arr';
type SortDirection = 'asc' | 'desc';

interface AccountMovement extends Account {
  assignedRep: string;
  toSegment: 'Enterprise' | 'Mid Market';
  fromSegment: 'Enterprise' | 'Mid Market' | 'Unknown';
}

/**
 * Format employee count with comma separator
 * Examples: 1,234 or 50
 */
function formatEmployees(value: number): string {
  return value.toLocaleString('en-US');
}

// ============================================================================
// Component
// ============================================================================

function AccountMovementTable() {
  const { accounts, results, reps } = useAllocationStore();

  // Component state
  const [sortColumn, setSortColumn] = useState<SortColumn>('accountName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterSegment, setFilterSegment] = useState<string>('all');
  const [filterFromRep, setFilterFromRep] = useState<string>('all');
  const [filterToRep, setFilterToRep] = useState<string>('all');

  // Join accounts with allocation results and filter for movements only
  const accountMovements: AccountMovement[] = useMemo(() => {
    if (results.length === 0) return [];

    // Create a map of accountId -> AllocationResult for fast lookup
    const resultsMap = new Map(results.map(r => [r.accountId, r]));
    
    // Create a map of rep name -> segment for fast lookup
    const repSegmentMap = new Map(reps.map(r => [r.Rep_Name, r.Segment]));

    return accounts
      .map(account => {
        const result = resultsMap.get(account.Account_ID);
        const fromSegment = repSegmentMap.get(account.Original_Rep) || 'Unknown';
        
        return {
          ...account,
          assignedRep: result?.assignedRep || 'Unassigned',
          toSegment: result?.segment || 'Mid Market',
          fromSegment: fromSegment as 'Enterprise' | 'Mid Market' | 'Unknown',
        };
      })
      .filter(account => account.Original_Rep !== account.assignedRep); // Only show movements
  }, [accounts, results, reps]);

  // Get unique from reps for filter dropdown (filtered by selected segment)
  const uniqueFromReps = useMemo(() => {
    const filteredBySegment = filterSegment === 'all' 
      ? accountMovements 
      : accountMovements.filter(a => a.toSegment === filterSegment);
    
    const reps = new Set(filteredBySegment.map(a => a.Original_Rep));
    return Array.from(reps).sort();
  }, [accountMovements, filterSegment]);

  // Get unique to reps for filter dropdown (filtered by selected segment)
  const uniqueToReps = useMemo(() => {
    const filteredBySegment = filterSegment === 'all' 
      ? accountMovements 
      : accountMovements.filter(a => a.toSegment === filterSegment);
    
    const reps = new Set(filteredBySegment.map(a => a.assignedRep));
    return Array.from(reps).sort();
  }, [accountMovements, filterSegment]);

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return accountMovements.filter(account => {
      // Segment filter
      if (filterSegment !== 'all' && account.toSegment !== filterSegment) {
        return false;
      }

      // From Rep filter
      if (filterFromRep !== 'all' && account.Original_Rep !== filterFromRep) {
        return false;
      }

      // To Rep filter
      if (filterToRep !== 'all' && account.assignedRep !== filterToRep) {
        return false;
      }

      return true;
    });
  }, [accountMovements, filterSegment, filterFromRep, filterToRep]);

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
        case 'location':
          aValue = a.Location || '';
          bValue = b.Location || '';
          break;
        case 'employees':
          aValue = a.Num_Employees;
          bValue = b.Num_Employees;
          break;
        case 'fromRep':
          aValue = a.Original_Rep;
          bValue = b.Original_Rep;
          break;
        case 'fromSegment':
          aValue = a.fromSegment;
          bValue = b.fromSegment;
          break;
        case 'toRep':
          aValue = a.assignedRep;
          bValue = b.assignedRep;
          break;
        case 'toSegment':
          aValue = a.toSegment;
          bValue = b.toSegment;
          break;
        case 'arr':
          aValue = a.ARR;
          bValue = b.ARR;
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
    setFilterFromRep('all');
    setFilterToRep('all');
  };
  
  // Reset rep filters when segment changes
  const handleSegmentChange = (value: string) => {
    setFilterSegment(value);
    setFilterFromRep('all'); // Reset from rep filter when segment changes
    setFilterToRep('all'); // Reset to rep filter when segment changes
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
        Account Movements ({accountMovements.length})
      </h2>
      
      <div className="space-y-4">
          {/* Filters */}
          {accountMovements.length > 0 && (
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

                {/* From Rep filter */}
                <div>
                  <label htmlFor="filter-from-rep" className="block text-sm font-medium text-gray-700 mb-1">
                    From Rep
                  </label>
                  <select
                    id="filter-from-rep"
                    value={filterFromRep}
                    onChange={(e) => setFilterFromRep(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  >
                    <option value="all">All Reps</option>
                    {uniqueFromReps.map(rep => (
                      <option key={rep} value={rep}>{rep}</option>
                    ))}
                  </select>
                </div>

                {/* To Rep filter */}
                <div>
                  <label htmlFor="filter-to-rep" className="block text-sm font-medium text-gray-700 mb-1">
                    To Rep
                  </label>
                  <select
                    id="filter-to-rep"
                    value={filterToRep}
                    onChange={(e) => setFilterToRep(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  >
                    <option value="all">All Reps</option>
                    {uniqueToReps.map(rep => (
                      <option key={rep} value={rep}>{rep}</option>
                    ))}
                  </select>
                </div>

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
                Showing {sortedAccounts.length} of {accountMovements.length} movements
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {/* Enable horizontal scroll on mobile, ensure minimum table width */}
            <div className="overflow-x-auto max-h-[675px] overflow-y-auto">
              <table className="w-full text-sm min-w-[1200px]">
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
                      onClick={() => handleSort('location')}
                      className="text-left px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      Location <SortIndicator column="location" />
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
                      Total Employees <SortIndicator column="employees" />
                    </th>
                    <th
                      onClick={() => handleSort('fromRep')}
                      className="text-left px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      From Rep <SortIndicator column="fromRep" />
                    </th>
                    <th
                      onClick={() => handleSort('fromSegment')}
                      className="text-left px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      Segment - From Rep <SortIndicator column="fromSegment" />
                    </th>
                    <th
                      onClick={() => handleSort('toRep')}
                      className="text-left px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      To Rep <SortIndicator column="toRep" />
                    </th>
                    <th
                      onClick={() => handleSort('toSegment')}
                      className="text-left px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      Segment - To Rep <SortIndicator column="toSegment" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedAccounts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        {accountMovements.length === 0
                          ? 'No account movements detected'
                          : 'No movements match the selected filters'}
                      </td>
                    </tr>
                  ) : (
                    sortedAccounts.map((account) => (
                      <tr
                        key={account.Account_ID}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {account.Account_ID}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {account.Account_Name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {account.Location || '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900 font-medium">
                          {formatCurrency(account.ARR)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {formatEmployees(account.Num_Employees)}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {account.Original_Rep}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                              account.fromSegment === 'Enterprise'
                                ? 'bg-blue-100 text-blue-800'
                                : account.fromSegment === 'Mid Market'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {account.fromSegment}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {account.assignedRep}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                              account.toSegment === 'Enterprise'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {account.toSegment}
                          </span>
                        </td>
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

export default AccountMovementTable;
