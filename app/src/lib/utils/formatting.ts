/**
 * Shared formatting utilities for Territory Slicer
 * 
 * Centralized formatting functions to ensure consistency across the application.
 */

/**
 * Format currency values for display
 * 
 * Examples: $62M, $1.5M, $850K, $45.2K
 * 
 * @param value - Numeric value to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `$${millions.toFixed(millions >= 10 ? 0 : 1)}M`;
  } else if (value >= 1_000) {
    const thousands = value / 1_000;
    return `$${thousands.toFixed(thousands >= 10 ? 0 : 1)}K`;
  } else {
    return `$${Math.round(value)}`;
  }
}

/**
 * Format currency values in short form (always with decimal)
 * 
 * Examples: $1.5M, $850.0K
 * 
 * @param value - Numeric value to format
 * @returns Formatted currency string
 */
export function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  } else {
    return `$${Math.round(value)}`;
  }
}

/**
 * Format fairness score for display (rounded to integer)
 * 
 * @param score - Fairness score 0-100, or null
 * @returns Formatted score string or "N/A"
 */
export function formatScore(score: number | null): string {
  if (score === null) {
    return 'N/A';
  }
  return Math.round(score).toString();
}

/**
 * Format decimal score to fixed decimal places
 * 
 * @param value - Numeric value
 * @param decimals - Number of decimal places (default: 3)
 * @returns Formatted score string
 */
export function formatDecimalScore(value: number, decimals: number = 3): string {
  return value.toFixed(decimals);
}

/**
 * Format ratio with specified decimal places
 * 
 * @param value - Numeric ratio
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted ratio string
 */
export function formatRatio(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format comparison ratio with "x" suffix
 * 
 * Examples: "2.5x", "1.12x"
 * 
 * @param value - Numeric ratio
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted comparison ratio string
 */
export function formatComparisonRatio(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}x`;
}

/**
 * Format percentage value
 * 
 * Examples: "95.5%", "12.3%"
 * 
 * @param value - Numeric percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format bonus value (2 decimal places)
 * 
 * @param value - Numeric bonus value
 * @returns Formatted bonus string
 */
export function formatBonus(value: number): string {
  return value.toFixed(2);
}

/**
 * Format range for display
 * 
 * @param range - Min/max range object or null
 * @param options - Formatting options
 * @returns Formatted range string
 */
export function formatRange(
  range: { min: number; max: number } | null,
  options: {
    isPercentage?: boolean;
    isCurrency?: boolean;
    decimals?: number;
  } = {}
): string {
  if (range === null) {
    return '';
  }
  
  const { isPercentage = false, isCurrency = false, decimals = 1 } = options;
  
  if (isCurrency) {
    return `${formatCurrencyShort(range.min)}-${formatCurrencyShort(range.max)}`;
  } else if (isPercentage) {
    return `${range.min.toFixed(decimals)}%-${range.max.toFixed(decimals)}%`;
  } else {
    return `${Math.round(range.min)}-${Math.round(range.max)}`;
  }
}

/**
 * Get color CSS classes for fairness score display
 * 
 * @param colorName - Color name from getFairnessColor()
 * @returns Object with badge and bar CSS classes
 */
export function getColorClasses(colorName: string): { badge: string; bar: string } {
  switch (colorName) {
    case 'dark-green':
      return { 
        badge: 'bg-green-700 text-white', 
        bar: 'bg-green-700' 
      };
    case 'light-green':
      return { 
        badge: 'bg-green-500 text-white', 
        bar: 'bg-green-500' 
      };
    case 'yellow':
      return { 
        badge: 'bg-yellow-400 text-gray-900', 
        bar: 'bg-yellow-400' 
      };
    case 'orange':
      return { 
        badge: 'bg-orange-500 text-white', 
        bar: 'bg-orange-500' 
      };
    case 'red':
      return { 
        badge: 'bg-red-600 text-white', 
        bar: 'bg-red-600' 
      };
    case 'gray':
    default:
      return { 
        badge: 'bg-gray-400 text-white', 
        bar: 'bg-gray-400' 
      };
  }
}
