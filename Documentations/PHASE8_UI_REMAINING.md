# Phase 8 UI Integration - Remaining Tasks

## Overview
Phase 8 backend is complete (11/11 tests passing). Users admin UI is complete. 
Remaining: Wire the other 3 admin pages (Pipelines, Sources, Types).

## ✅ Completed: Users Admin
- `src/pages/admin/Users.tsx` - Fully integrated
- `src/components/forms/AddUserDialog.tsx` - Created
- `src/components/forms/EditUserDialog.tsx` - Created
- Features: Search, filter by role/status, live stats, full CRUD

## 🔜 Task 1: Pipelines Admin Page

### File to Update
- `src/pages/admin/Pipelines.tsx`

### Hooks to Use
- `usePipelineStages()` - List pipeline stages with filters
- `usePipelineStageStats()` - Get stats (total, active)
- `useCreatePipelineStage()` - Create new stage
- `useUpdatePipelineStage()` - Update existing stage
- `useDeletePipelineStage()` - Delete stage

### Components to Create
- `src/components/forms/AddPipelineStageDialog.tsx`
- `src/components/forms/EditPipelineStageDialog.tsx`

### Form Fields
```typescript
{
  name: string;           // required
  description?: string;   // optional
  sort_order: number;     // required, for ordering stages
  color?: string;         // optional, hex color (e.g., #3B82F6)
  is_active: boolean;     // toggle
}
```

### Unique Features
- **Color Picker**: Add input for hex color (could use type="color" or custom picker)
- **Sort Order**: Number input (future enhancement: drag & drop reordering)

### Stats to Display
- Total Stages
- Active Stages

### Similar to Users
- Search functionality
- Active/Inactive filter
- Table with Edit/Delete actions
- Loading states
- Error handling with toasts

---

## 🔜 Task 2: Sources Admin Page

### File to Update
- `src/pages/admin/Sources.tsx`

### Hooks to Use
- `useLeadSources()` - List lead sources with filters
- `useLeadSourceStats()` - Get stats (total, active)
- `useCreateLeadSource()` - Create new source
- `useUpdateLeadSource()` - Update existing source
- `useDeleteLeadSource()` - Delete source

### Components to Create
- `src/components/forms/AddLeadSourceDialog.tsx`
- `src/components/forms/EditLeadSourceDialog.tsx`

### Form Fields
```typescript
{
  name: string;           // required
  description?: string;   // optional
  is_active: boolean;     // toggle
}
```

### Stats to Display
- Total Sources
- Active Sources

### Notes
- Simpler than Pipelines (no color, no sort_order)
- Same pattern as Users admin
- Search + Active/Inactive filter

---

## 🔜 Task 3: Types Admin Page

### File to Update
- `src/pages/admin/Types.tsx`

### Hooks to Use

#### Activity Types
- `useActivityTypes()` - List activity types with filters
- `useActivityTypeStats()` - Get stats (total, active)
- `useCreateActivityType()` - Create new type
- `useUpdateActivityType()` - Update existing type
- `useDeleteActivityType()` - Delete type

#### Contact Types
- `useContactTypes()` - List contact types with filters
- `useContactTypeStats()` - Get stats (total, active)
- `useCreateContactType()` - Create new type
- `useUpdateContactType()` - Update existing type
- `useDeleteContactType()` - Delete type

### Components to Create
- `src/components/forms/AddActivityTypeDialog.tsx`
- `src/components/forms/EditActivityTypeDialog.tsx`
- `src/components/forms/AddContactTypeDialog.tsx`
- `src/components/forms/EditContactTypeDialog.tsx`

### Form Fields

**Activity Types:**
```typescript
{
  name: string;           // required
  description?: string;   // optional
  icon?: string;          // optional, icon name (e.g., "phone", "email", "meeting")
  is_active: boolean;     // toggle
}
```

**Contact Types:**
```typescript
{
  name: string;           // required
  description?: string;   // optional
  is_active: boolean;     // toggle
}
```

### Unique Features
- **Two Separate Sections**: Split page into Activity Types and Contact Types
- **Icon Picker**: For activity types, add icon selector (could use lucide-react icon names)
- **Dual Stats**: Show stats for both activity types and contact types

### Stats to Display

**Activity Types:**
- Total Activity Types
- Active Activity Types

**Contact Types:**
- Total Contact Types
- Active Contact Types

### UI Structure
```
┌─────────────────────────────────────┐
│  Types Management                   │
│  (Heading)                          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Activity Types                     │
│  ┌─────────────────────────────┐   │
│  │ Stats: Total | Active        │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Search + Filter + Add        │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Table (Name, Icon, Active)   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Contact Types                      │
│  ┌─────────────────────────────┐   │
│  │ Stats: Total | Active        │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Search + Filter + Add        │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Table (Name, Active)         │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Implementation Priority

### Order of Implementation:
1. **Pipelines** (affects Leads pipeline stage selection)
2. **Sources** (affects Leads source selection)
3. **Types** (affects Activities and Contacts type selection)

### Rationale:
- Pipelines and Sources are used by Leads module (already implemented in Phase 5)
- Types are used by Activities and Contacts (also from Phase 5)
- All three enable dropdown selections in existing forms

---

## Code Patterns to Reuse

### From Users Admin
- Search input with debouncing
- Filter dropdowns (role → replace with is_active only for some)
- Stats cards layout
- Table with loading/empty states
- Edit/Delete action buttons
- Toast notifications
- Dialog forms with react-hook-form + Zod

### Zod Schema Pattern
```typescript
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  is_active: z.boolean(),
  // ... other fields specific to each type
});
```

### Mutation Pattern
```typescript
const create = useCreateX();
await create.mutateAsync(data);
toast({ title: "Success", description: "Created successfully" });
```

---

## Testing Checklist (Per Page)

After implementing each admin page, verify:

- [ ] TypeScript compilation (`npm run typecheck`)
- [ ] Production build (`npm run build`)
- [ ] Page loads without errors
- [ ] Stats display correct values from backend
- [ ] Search filters the list
- [ ] Status filter works (Active/Inactive)
- [ ] Add dialog creates new record
- [ ] Edit dialog updates existing record
- [ ] Delete confirmation removes record
- [ ] Loading states show during API calls
- [ ] Error toasts appear on failure
- [ ] Success toasts appear on success
- [ ] Table updates automatically after mutations

---

## Estimated Effort

- **Pipelines**: ~30 min (add color picker logic)
- **Sources**: ~20 min (simplest, no extra fields)
- **Types**: ~45 min (two separate sections + icon picker)

**Total**: ~1.5 hours to complete all three pages

---

## Phase 8 Completion Criteria

✅ Backend APIs (complete)
✅ Frontend hooks (complete)
✅ Users admin UI (complete)
🔜 Pipelines admin UI
🔜 Sources admin UI
🔜 Types admin UI

Once all three are done, Phase 8 is 100% complete!
