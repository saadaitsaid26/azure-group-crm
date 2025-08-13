# Radix UI Select Empty String Fix

## Problem
The console was showing multiple errors:
```
Uncaught Error: A <Select.Item /> must have a value prop that is not an empty string. 
This is because the Select value can be set to an empty string to clear the selection and show the placeholder.
```

## Root Cause
Radix UI's `<Select.Item />` component does not allow empty strings (`""`) as values. This is a design decision to prevent ambiguity, as empty strings could be confused with the "cleared" state of a select.

## Solution
Replaced all empty string (`""`) values in `SelectItem` components with a meaningful placeholder value `"none"` or `"all"` depending on the context.

## Files Modified

### 1. Activities.tsx (Filter Dropdowns)
- **Changed:** State initialization from `""` to `"all"`
- **Changed:** SelectItem values from `""` to `"all"` for filter options
- **Updated:** API call to convert `"all"` back to `undefined` when filtering

### 2. AddActivityDialog.tsx
- **Changed:** SelectItem values from `""` to `"none"` for lead, contact, organization
- **Changed:** Default Select values from `|| ""` to `|| "none"`
- **Updated:** Submit handler to convert `"none"` to `undefined` before API call

### 3. EditActivityDialog.tsx
- **Changed:** SelectItem values from `""` to `"none"`
- **Changed:** Default Select values from `|| ""` to `|| "none"`
- **Changed:** Form reset to use `"none"` instead of `""`
- **Updated:** Submit handler to convert `"none"` to `null` before API call

### 4. AddLeadDialog.tsx
- **Changed:** SelectItem values from `""` to `"none"` for organization, contact
- **Changed:** Default Select values from `|| ""` to `|| "none"`
- **Updated:** Submit handler to convert `"none"` to `undefined` before API call

### 5. EditLeadDialog.tsx
- **Changed:** SelectItem values from `""` to `"none"`
- **Changed:** Default Select values from `|| ""` to `|| "none"`
- **Changed:** Form reset to use `"none"` instead of `""`
- **Updated:** Submit handler to convert `"none"` to `null` before API call

### 6. EditContactDialog.tsx
- **Changed:** SelectItem value from `""` to `"none"` for organization
- **Changed:** Default Select value from `|| ""` to `|| "none"`
- **Changed:** Form reset to use `"none"` instead of `""`
- **Updated:** Submit handler to convert `"none"` to `null` before API call

## Pattern Used

### For Filter Dropdowns (Activities.tsx)
```tsx
// State
const [typeFilter, setTypeFilter] = useState<string>("all");

// Select Component
<SelectItem value="all">All Types</SelectItem>

// API Call
type: typeFilter === "all" ? undefined : typeFilter || undefined
```

### For Optional Reference Fields (Forms)
```tsx
// Default value
value={watch("organization") || "none"}

// Select Item
<SelectItem value="none">None</SelectItem>

// Submit handler
organization: data.organization === "none" ? null : data.organization || null
```

## Testing
- ✅ No more console errors about empty string values
- ✅ Filter dropdowns work correctly
- ✅ Form submissions handle "None" selections properly
- ✅ Optional fields are correctly set to null/undefined when "None" is selected

## Benefits
1. **Compliant with Radix UI**: Follows the library's design patterns
2. **Clear Intent**: `"none"` and `"all"` are more explicit than empty strings
3. **No Breaking Changes**: API calls still receive null/undefined for empty values
4. **Better UX**: Users see clear "None" or "All" labels instead of empty values
