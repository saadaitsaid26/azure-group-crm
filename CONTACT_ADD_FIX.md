# Contact Add Dialog Fix

## Problem Analysis

Based on the console logs, there were two issues:

### 1. **Main Issue: No API Call** ❌ CRITICAL
The `AddContactDialog` component was logging "Create contact:" to the console but **not actually calling the API** to create the contact. The component had a placeholder comment `// API call will be here` but never implemented the actual API call.

**Evidence from console:**
```
AddContactDialog.tsx:43 Create contact: {first_name: 'saad', last_name: 'ait said', email: 'admin@azuregroup.ma', phone: '+212555795624', organization: null, …}
```

The contact data was being logged but not sent to the backend.

### 2. **Secondary Issue: aria-hidden Warning** ⚠️ ACCESSIBILITY
The browser was showing an accessibility warning about `aria-hidden` being set on a dialog ancestor while a Select button had focus. This is a timing issue during dialog animation but doesn't prevent functionality.

## Solution Implemented

### Fixed AddContactDialog.tsx

**Changes made:**

1. **Imported `useCreateContact` hook** from the contacts API:
   ```tsx
   import { useCreateContact } from "@/api/contacts";
   ```

2. **Replaced local loading state** with the mutation hook:
   ```tsx
   // Before:
   const [loading, setLoading] = useState(false);
   
   // After:
   const createContactMutation = useCreateContact();
   ```

3. **Implemented actual API call** in the `onSubmit` function:
   ```tsx
   const onSubmit = async (data: ContactFormData) => {
     try {
       await createContactMutation.mutateAsync(data);
       toast({ title: "Success", description: "Contact created successfully" });
       reset();
       onSuccess();
       onOpenChange(false);
     } catch (error: any) {
       console.error("Failed to create contact:", error);
       const errorMessage = error?.message || "Failed to create contact";
       toast({ title: "Error", description: errorMessage, variant: "destructive" });
     }
   };
   ```

4. **Updated loading states** to use the mutation's `isPending` property:
   ```tsx
   <Button type="button" variant="outline" disabled={createContactMutation.isPending}>
     Cancel
   </Button>
   <Button type="submit" disabled={createContactMutation.isPending}>
     {createContactMutation.isPending ? "Creating..." : "Create Contact"}
   </Button>
   ```

5. **Removed unused imports**:
   - Removed `useState` since we're using the mutation's loading state

## How It Works Now

1. User fills out the contact form
2. User clicks "Create Contact" button
3. Form validation runs (via react-hook-form + zod schema)
4. If valid, `onSubmit` is called
5. **`createContactMutation.mutateAsync(data)` sends POST request to `/contacts/` API endpoint**
6. On success:
   - Shows success toast notification
   - Invalidates/refetches contacts list (via React Query)
   - Resets form
   - Calls `onSuccess()` callback to refresh parent component
   - Closes the dialog
7. On error:
   - Shows error toast with error message
   - Keeps dialog open for user to fix issues

## Testing

To verify the fix works:

1. Open the Contacts page
2. Click "Add Contact" button
3. Fill in the required fields:
   - First Name *
   - Last Name *
   - Email *
   - (Optional: Phone, Company, Role, Status, Notes)
4. Click "Create Contact"
5. Verify:
   - ✅ Contact appears in the contacts list
   - ✅ Success toast notification appears
   - ✅ Dialog closes
   - ✅ Form resets
   - ✅ Backend database has the new contact

## API Integration

The contact is now properly created using:
- **API Hook**: `useCreateContact()` from `src/api/contacts.ts`
- **API Endpoint**: `POST /contacts/`
- **Request Body**: ContactFormData (validated against Zod schema)
- **Response**: Contact object with generated ID
- **Cache Invalidation**: React Query automatically refetches contacts list

## Notes on aria-hidden Warning

The aria-hidden accessibility warning is a known issue with Radix UI Dialog animations when Select components inside get focus during the opening animation. The dialog component already has aggressive mitigation code to remove aria-hidden attributes, but the warning may still appear briefly during the animation. This doesn't affect functionality - it's purely an accessibility concern during the animation transition.

The warning can be safely ignored or further mitigated by:
- Adding a small delay before allowing Select interaction
- Using `onOpenAutoFocus` to prevent early focus
- Switching to a different Select implementation

However, since it doesn't prevent the contact from being added, it's a lower priority accessibility improvement.

---

**Status**: ✅ Fixed - Contacts can now be successfully created
**Date**: October 14, 2025
