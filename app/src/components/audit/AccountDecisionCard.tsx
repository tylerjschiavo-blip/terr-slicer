import type { AuditStep } from '@/types';
import { formatSegmentReason } from '@/lib/allocation/auditTrail';
import { formatCurrency } from '@/lib/utils/formatting';

/**
 * Format employee count with comma separator
 * Examples: 1,234 or 50
 */
function formatEmployees(value: number): string {
  return value.toLocaleString('en-US');
}

interface AccountDecisionCardProps {
  /** Audit step containing account and decision information */
  step: AuditStep;
  /** Employee count threshold used for segmentation */
  threshold: number;
}

/**
 * AccountDecisionCard Component
 * 
 * Displays account information and segment decision for a single audit step.
 * Shows account name, ARR, employee count, segment badge, and reasoning.
 * 
 * @example
 * ```tsx
 * <AccountDecisionCard step={auditStep} threshold={2750} />
 * ```
 */
export function AccountDecisionCard({ step, threshold }: AccountDecisionCardProps) {
  const { account, segment } = step;
  const reasoning = formatSegmentReason(account, segment, threshold);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
      {/* Section Title */}
      <h3 className="text-sm font-medium text-gray-700 mb-3">This Account</h3>

      {/* Account Information */}
      <div className="space-y-3">
        {/* Account Name */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{account.Account_Name}</h4>
        </div>

        {/* ARR and Employees */}
        <div className="flex items-center gap-4 text-sm">
          <div className="text-gray-900 font-medium">
            {formatCurrency(account.ARR)} ARR
          </div>
          <div className="text-gray-600">
            {formatEmployees(account.Num_Employees)} employees
          </div>
        </div>

        {/* Segment Badge and Reasoning */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
              segment === 'Enterprise'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {segment}
          </span>
          <span className="text-sm text-gray-600">
            → {reasoning}
          </span>
        </div>
      </div>
    </div>
  );
}
