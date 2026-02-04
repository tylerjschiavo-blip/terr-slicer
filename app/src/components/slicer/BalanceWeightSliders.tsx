/**
 * Balance Weight Sliders Component
 * 
 * Two active sliders (ARR, Account) that auto-adjust each other.
 * Risk is always disabled and backfills to make 100%.
 * When Risk_Score is missing, Risk is locked to 0% and weight is redistributed to ARR/Account.
 * 
 * Logic:
 * - When ARR changes: Account adjusts if needed, Risk = 100 - ARR - Account (or 0 if Risk_Score missing)
 * - When Account changes: ARR adjusts if needed, Risk = 100 - ARR - Account (or 0 if Risk_Score missing)
 * - Risk slider is always disabled (non-interactive)
 * - If Risk_Score missing: Risk weight locked to 0%, ARR and Account split the 100%
 * 
 * Task: AE-22, AE-44
 */

import { Slider } from '@/components/ui/slider';
import { useAllocationStore } from '@/store/allocationStore';
import { cn } from '@/lib/utils';

export function BalanceWeightSliders() {
  const arrWeight = useAllocationStore((state) => state.arrWeight);
  const accountWeight = useAllocationStore((state) => state.accountWeight);
  const riskWeight = useAllocationStore((state) => state.riskWeight);
  const hasRiskScore = useAllocationStore((state) => state.hasRiskScore);
  const updateConfig = useAllocationStore((state) => state.updateConfig);

  /**
   * Handle slider change with automatic backfill logic
   * - ARR or Account slider changes
   * - The other slider adjusts if sum would exceed 100
   * - Risk always backfills to 100 (or locked to 0 if Risk_Score missing)
   */
  const handleWeightChange = (
    changedSlider: 'arr' | 'account',
    newValue: number
  ) => {
    // Ensure newValue is within bounds
    newValue = Math.max(0, Math.min(100, newValue));

    let newArr = arrWeight;
    let newAccount = accountWeight;
    let newRisk = 0;

    // If Risk_Score is missing, lock Risk to 0% and redistribute ARR/Account
    if (!hasRiskScore) {
      if (changedSlider === 'arr') {
        newArr = newValue;
        newAccount = 100 - newArr;
      } else if (changedSlider === 'account') {
        newAccount = newValue;
        newArr = 100 - newAccount;
      }
      newRisk = 0;
    } else {
      // Normal behavior: Risk backfills to 100%
      // Set the changed slider to its new value
      if (changedSlider === 'arr') {
        newArr = newValue;
        // If ARR + Account > 100, reduce Account
        if (newArr + accountWeight > 100) {
          newAccount = 100 - newArr;
        } else {
          newAccount = accountWeight;
        }
      } else if (changedSlider === 'account') {
        newAccount = newValue;
        // If Account + ARR > 100, reduce ARR
        if (newAccount + arrWeight > 100) {
          newArr = 100 - newAccount;
        } else {
          newArr = arrWeight;
        }
      }

      // Risk always backfills to 100
      newRisk = 100 - newArr - newAccount;

      // Ensure Risk doesn't go negative (shouldn't happen, but safety check)
      if (newRisk < 0) {
        newRisk = 0;
        // Recalculate to maintain 100%
        if (changedSlider === 'arr') {
          newAccount = 100 - newArr;
        } else {
          newArr = 100 - newAccount;
        }
      }
    }

    // Update store (triggers allocation recalculation)
    updateConfig({
      arrWeight: newArr,
      accountWeight: newAccount,
      riskWeight: newRisk,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="arr-weight-slider"
            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            ARR
          </label>
          <span className="text-xs font-semibold text-muted-foreground">
            {arrWeight}%
          </span>
        </div>
        <Slider
          id="arr-weight-slider"
          value={[arrWeight]}
          onValueChange={(values) => handleWeightChange('arr', values[0])}
          min={0}
          max={100}
          step={1}
          className="w-full"
          aria-label="ARR slider"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="account-weight-slider"
            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Accounts
          </label>
          <span className="text-xs font-semibold text-muted-foreground">
            {accountWeight}%
          </span>
        </div>
        <Slider
          id="account-weight-slider"
          value={[accountWeight]}
          onValueChange={(values) => handleWeightChange('account', values[0])}
          min={0}
          max={100}
          step={1}
          className="w-full"
          aria-label="Accounts slider"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="risk-weight-slider"
            className="text-xs font-medium leading-none text-muted-foreground opacity-70"
          >
            Risk
            <span className="ml-1.5 text-[10px]">
              {hasRiskScore ? '(Auto)' : '(Disabled)'}
            </span>
          </label>
          <span className="text-xs font-semibold text-muted-foreground">
            {riskWeight}%
          </span>
        </div>
        <Slider
          id="risk-weight-slider"
          value={[riskWeight]}
          onValueChange={() => {}} // No-op, slider is disabled
          min={0}
          max={100}
          step={1}
          className="w-full"
          disabled={true}
          aria-label={hasRiskScore ? "Risk slider (auto-calculated)" : "Risk slider (disabled - Risk_Score not found)"}
          aria-disabled={true}
        />
      </div>

      <div className="pt-2 border-t">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Total</span>
          <span className="font-bold">
            {arrWeight + accountWeight + riskWeight}%
          </span>
        </div>
      </div>
    </div>
  );
}
