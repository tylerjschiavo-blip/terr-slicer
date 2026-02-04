import { z } from 'zod';

/**
 * Zod schema for Account data validation
 * 
 * Validates uploaded Account CSV data at runtime to ensure:
 * - Account_ID is a non-empty string
 * - Account_Name is a non-empty string
 * - Original_Rep is a non-empty string
 * - ARR is a positive number
 * - Num_Employees is a positive integer
 * - Location is a non-empty string
 * - Risk_Score is optional, must be 0-100 if provided
 */
export const accountSchema = z.object({
  Account_ID: z
    .string({
      message: 'Account_ID must be a non-empty string',
    })
    .min(1, { message: 'Account_ID cannot be empty' }),
  
  Account_Name: z
    .string({
      message: 'Account_Name must be a non-empty string',
    })
    .min(1, { message: 'Account_Name cannot be empty' }),
  
  Original_Rep: z
    .string({
      message: 'Original_Rep must be a non-empty string',
    })
    .min(1, { message: 'Original_Rep cannot be empty' }),
  
  ARR: z
    .number({
      message: 'ARR must be a number',
    })
    .positive({ message: 'ARR must be a positive number' }),
  
  Num_Employees: z
    .number({
      message: 'Num_Employees must be a number',
    })
    .int({ message: 'Num_Employees must be an integer' })
    .positive({ message: 'Num_Employees must be a positive integer' }),
  
  Location: z
    .string({
      message: 'Location must be a non-empty string',
    })
    .min(1, { message: 'Location cannot be empty' }),
  
  Risk_Score: z
    .number({
      message: 'Risk_Score must be a number',
    })
    .min(0, { message: 'Risk_Score must be at least 0' })
    .max(100, { message: 'Risk_Score must be at most 100' })
    .nullable()
    .optional(),
});

/**
 * TypeScript type inferred from the Zod schema
 * This should match the Account interface in types/index.ts
 */
export type AccountSchemaType = z.infer<typeof accountSchema>;

/**
 * Validates a single Account object
 * @param data - Raw data to validate
 * @returns Validation result with parsed data or error details
 */
export function validateAccount(data: unknown) {
  return accountSchema.safeParse(data);
}

/**
 * Validates an array of Account objects
 * @param data - Array of raw data to validate
 * @returns Validation results for all items
 */
export function validateAccounts(data: unknown[]) {
  const results = data.map((item, index) => {
    const result = accountSchema.safeParse(item);
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
