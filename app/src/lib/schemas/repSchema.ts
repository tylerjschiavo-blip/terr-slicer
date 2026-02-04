import { z } from 'zod';

/**
 * Zod schema for Rep data validation
 * 
 * Validates uploaded Rep CSV data at runtime to ensure:
 * - Rep_Name is a non-empty string
 * - Segment accepts 'Enterprise' or 'Mid Market' (case-insensitive)
 *   and preserves the full name
 * - Location is a non-empty string
 */
export const repSchema = z.object({
  Rep_Name: z
    .string({
      message: 'Rep_Name must be a non-empty string',
    })
    .min(1, { message: 'Rep_Name cannot be empty' }),
  
  Segment: z
    .string()
    .transform((val) => val.trim())
    .refine(
      (val) => {
        const normalized = val.toLowerCase();
        return ['enterprise', 'mid market'].includes(normalized);
      },
      { message: 'Segment must be "Enterprise" or "Mid Market"' }
    )
    .transform((val) => {
      const normalized = val.toLowerCase();
      if (normalized === 'enterprise') return 'Enterprise';
      if (normalized === 'mid market') return 'Mid Market';
      return val;
    }) as z.ZodType<'Enterprise' | 'Mid Market'>,
  
  Location: z
    .string({
      message: 'Location must be a non-empty string',
    })
    .min(1, { message: 'Location cannot be empty' }),
});

/**
 * TypeScript type inferred from the Zod schema
 * This should match the Rep interface in types/index.ts
 */
export type RepSchemaType = z.infer<typeof repSchema>;

/**
 * Validates a single Rep object
 * @param data - Raw data to validate
 * @returns Validation result with parsed data or error details
 */
export function validateRep(data: unknown) {
  return repSchema.safeParse(data);
}

/**
 * Validates an array of Rep objects
 * @param data - Array of raw data to validate
 * @returns Validation results for all items
 */
export function validateReps(data: unknown[]) {
  const results = data.map((item, index) => {
    const result = repSchema.safeParse(item);
    return {
      index,
      success: result.success,
      data: result.success ? result.data : null,
      error: result.success ? null : result.error,
    };
  });
  
  return {
    validItems: results.filter((r) => r.success).map((r) => r.data),
    errors: results
      .filter((r) => !r.success)
      .map((r) => ({
        row: r.index + 1, // +1 for human-readable row numbers (accounting for header)
        issues: r.error?.issues || [],
      })),
  };
}
