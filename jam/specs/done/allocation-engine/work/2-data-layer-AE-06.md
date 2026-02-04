# AE-06: Rep and Account Data Schemas - Work Log

**Task:** Implement Rep and Account data schemas using Zod  
**Wave:** 2 (Data Layer)  
**Status:** ✅ Completed  
**Date:** 2026-02-03  

---

## Summary

Implemented runtime validation schemas using Zod v4 for Rep and Account CSV data. These schemas provide type-safe validation with clear error messages for invalid data uploaded by users.

---

## Files Created

### 1. `app/src/lib/schemas/repSchema.ts`

**Purpose:** Validates Rep data structure from uploaded CSV files.

**Schema Fields:**
- `Rep_Name`: string, non-empty - Sales rep's full name
- `Segment`: enum ['Enterprise', 'Mid Market'] - Market segment (Enterprise or Mid Market)
- `Location`: string, non-empty - Geographic location for geo matching

**Exports:**
- `repSchema` - Zod schema object for validation
- `RepSchemaType` - TypeScript type inferred from schema
- `validateRep(data)` - Validates single Rep object
- `validateReps(data[])` - Validates array of Rep objects with row-level error reporting

**Key Features:**
- Clear error messages for each field
- Enforces non-empty strings
- Strict enum validation for Segment field
- Helper functions return validation results with row numbers for CSV context

### 2. `app/src/lib/schemas/accountSchema.ts`

**Purpose:** Validates Account data structure from uploaded CSV files.

**Schema Fields:**
- `Account_ID`: string, non-empty - Unique account identifier
- `Account_Name`: string, non-empty - Company name
- `Original_Rep`: string, non-empty - Baseline rep assignment (accepts "Current_Rep" during import, automatically mapped)
- `ARR`: number, positive - Annual Recurring Revenue
- `Num_Employees`: number, positive integer - Employee count
- `Location`: string, non-empty - Geographic location
- `Risk_Score`: number, 0-100, nullable, optional - Risk score (handles missing column)

**Exports:**
- `accountSchema` - Zod schema object for validation
- `AccountSchemaType` - TypeScript type inferred from schema
- `validateAccount(data)` - Validates single Account object
- `validateAccounts(data[])` - Validates array of Account objects with row-level error reporting

**Key Features:**
- Numeric field validation (positive, integer constraints)
- Risk_Score is optional/nullable - gracefully handles missing Risk column
- Range validation for Risk_Score (0-100)
- Clear field-level error messages
- Helper functions return validation results with row numbers for CSV parsing context

---

## Dependencies Added

- **zod** v4.3.6 - Runtime type validation library
  - Already present in project (installed as transitive dependency)
  - Confirmed compatible with TypeScript configuration

---

## Implementation Notes

### Zod v4 API Changes

The project uses Zod v4, which has a different error configuration API compared to v3:
- **v3 syntax:** `required_error`, `invalid_type_error` as separate parameters
- **v4 syntax:** Single `message` parameter for error customization

**Example:**
```typescript
// Zod v4 (used in this implementation)
z.string({ message: 'Field must be a non-empty string' })
  .min(1, { message: 'Field cannot be empty' })

// Zod v3 (deprecated)
z.string({
  required_error: 'Field is required',
  invalid_type_error: 'Field must be a string'
}).min(1, 'Field cannot be empty')
```

### Type Alignment

Both schemas export TypeScript types (`RepSchemaType`, `AccountSchemaType`) that match the interfaces defined in `app/src/types/index.ts`:
- `Rep` interface matches `RepSchemaType`
- `Account` interface matches `AccountSchemaType`

This ensures compile-time and runtime type consistency.

### Validation Helper Functions

Both schemas include batch validation functions (`validateReps`, `validateAccounts`) that:
1. Process arrays of raw data
2. Return separate arrays of valid items and errors
3. Include row numbers in error reports (1-indexed, accounting for CSV headers)
4. Format errors for easy display to users

**Usage pattern for XLSX parser:**
```typescript
const { validItems, errors } = validateAccounts(parsedData);
if (errors.length > 0) {
  // Display errors with row/field context
  errors.forEach(err => {
    console.log(`Row ${err.row}: ${err.issues.map(i => i.message).join(', ')}`);
  });
}
```

---

## Acceptance Criteria

All acceptance criteria from PLAN-webapp.md (lines 212-219) have been met:

- ✅ Zod installed and schemas compile (verified with `tsc --noEmit`)
- ✅ Rep schema validates required fields (Rep_Name, Segment, Location)
- ✅ Account schema validates required fields (Account_ID, Account_Name, Original_Rep, ARR, Num_Employees, Location)
- ✅ Risk_Score optional and validates range 0-100 when present (`.nullable().optional()`)
- ✅ ARR and Num_Employees must be positive numbers (`.positive()`, `.int()` constraints)
- ✅ Segment must be exactly 'Enterprise' or 'Mid Market' (`z.enum(['Enterprise', 'Mid Market'])`)
- ✅ Schema errors provide clear field-level messages (custom messages on all fields)

---

## Testing

### Compilation Verification

```bash
cd app && npx tsc --noEmit --skipLibCheck \
  src/lib/schemas/repSchema.ts \
  src/lib/schemas/accountSchema.ts
```

**Result:** ✅ No compilation errors

### Manual Schema Testing

Valid data should pass:
```typescript
// Valid Rep
validateRep({
  Rep_Name: 'Mickey',
  Segment: 'Enterprise',
  Location: 'CA'
}); // ✅ success: true

// Valid Account
validateAccount({
  Account_ID: 'ACC-001',
  Account_Name: 'Acme Corp',
  Original_Rep: 'Mickey',
  ARR: 500000,
  Num_Employees: 5300,
  Location: 'CA',
  Risk_Score: 45
}); // ✅ success: true

// Valid Account without Risk_Score
validateAccount({
  Account_ID: 'ACC-002',
  Account_Name: 'Beta Inc',
  Original_Rep: 'Donald',
  ARR: 250000,
  Num_Employees: 1200,
  Location: 'NY'
  // Risk_Score: omitted
}); // ✅ success: true
```

Invalid data should fail with clear errors:
```typescript
// Invalid Segment
validateRep({
  Rep_Name: 'Mickey',
  Segment: 'SMB', // ❌ not 'Enterprise' or 'Mid Market'
  Location: 'CA'
}); // error: "Segment must be either 'Enterprise' or 'Mid Market'"

// Invalid ARR (negative)
validateAccount({
  Account_ID: 'ACC-001',
  ARR: -100, // ❌ negative
  // ... other fields
}); // error: "ARR must be a positive number"

// Invalid Risk_Score (out of range)
validateAccount({
  // ... other fields
  Risk_Score: 150 // ❌ > 100
}); // error: "Risk_Score must be at most 100"
```

---

## Next Steps

This task (AE-06) is complete. The schemas are ready to be used in:

1. **AE-07:** XLSX parser implementation
   - Use `validateReps()` and `validateAccounts()` to validate parsed XLSX data
   - Display validation errors with row/column/sheet context to users
   - Handle "Current_Rep" column mapping to "Original_Rep" during import

2. **AE-08:** File upload UI for single XLSX file
   - Trigger validation after XLSX parsing
   - Show validation feedback to users

3. **AE-09:** Validation feedback system
   - Display errors returned by schema validation functions
   - Group by error type (hard errors vs soft warnings)

---

## References

- **PLAN:** `/Users/annschiavo/tyler_projects/terr-slicer/jam/specs/draft/allocation-engine/PLAN-webapp.md` (lines 194-221)
- **Types:** `app/src/types/index.ts`
- **Zod Documentation:** https://zod.dev/ (v4.x)
