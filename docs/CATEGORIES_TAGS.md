# Categories & Tags Management Feature

**Status**: 🟢 70% Complete
**Priority**: Medium-High
**Estimated Time**: 3-4 hours to complete

## Overview
Allow users to organize tasks using categories (single assignment) and tags (multiple assignment). Categories represent broad groupings (Work, Personal, Health), while tags are flexible labels (urgent, important, waiting-for).

---

## Current Implementation Status

### ✅ Completed (70%)

#### 1. Database Schema
**File**: `prisma/schema.prisma`

```prisma
model Category {
  id        String   @id @default(cuid())
  userId    String
  name      String
  color     String   @default("#10B981") // green-500
  createdAt DateTime @default(now())

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks Task[]

  @@unique([userId, name])
}

model Tag {
  id        String    @id @default(cuid())
  userId    String
  name      String
  color     String    @default("#3B82F6") // blue-500
  createdAt DateTime  @default(now())

  user  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks TaskTag[]

  @@unique([userId, name])
}

model TaskTag {
  taskId String
  tagId  String

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([taskId, tagId])
}
```

**Status**: Complete ✅

#### 2. API Endpoints

**File**: `app/api/categories/route.ts`
- ✅ GET: Fetch all user categories with task count
- ✅ POST: Create new category
- ❌ PATCH: Update category (missing)
- ❌ DELETE: Delete category (missing)

**File**: `app/api/tags/route.ts`
- ✅ GET: Fetch all user tags with task count
- ✅ POST: Create new tag
- ❌ PATCH: Update tag (missing)
- ❌ DELETE: Delete tag (missing)

**Status**: 50% complete (GET and POST work, UPDATE and DELETE missing)

#### 3. UI Components

**Files**:
- ✅ `components/categories/CategoryManager.tsx` - Dialog for managing categories
- ✅ `components/tags/TagManager.tsx` - Dialog for managing tags
- ✅ `components/ui/color-picker.tsx` - Color picker component
- ✅ `components/tasks/TaskCard.tsx` - Displays categories and tags

**Status**: Basic UI exists ✅

#### 4. Custom Hooks

**Files**:
- ✅ `lib/hooks/useCategories.ts` - React Query hooks for categories
- ✅ `lib/hooks/useTags.ts` - React Query hooks for tags

**Status**: Complete ✅

#### 5. Display in TaskCard

**File**: `components/tasks/TaskCard.tsx`

```tsx
{/* Category Badge */}
{task.category && (
  <Badge
    style={{
      backgroundColor: task.category.color,
      color: '#fff',
    }}
  >
    {task.category.name}
  </Badge>
)}

{/* Tags */}
{task.tags && task.tags.length > 0 && (
  <div className="flex gap-1">
    {task.tags.map((taskTag) => (
      <Badge
        key={taskTag.tag.id}
        variant="outline"
        style={{
          borderColor: taskTag.tag.color,
          color: taskTag.tag.color,
        }}
      >
        {taskTag.tag.name}
      </Badge>
    ))}
  </div>
)}
```

**Status**: Complete ✅

#### 6. Management Buttons

**File**: `components/tasks/TaskDashboard.tsx`

```tsx
<Button
  variant="outline"
  size="sm"
  onClick={() => setShowCategoryManager(true)}
>
  <Folder className="h-4 w-4 mr-2" />
  Manage Categories
</Button>

<Button
  variant="outline"
  size="sm"
  onClick={() => setShowTagManager(true)}
>
  <Tag className="h-4 w-4 mr-2" />
  Manage Tags
</Button>
```

**Status**: Complete ✅

---

## ❌ Not Implemented (30%)

### 1. Edit and Delete API Endpoints (0%)

#### Update Category Endpoint
**New file**: `app/api/categories/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

// PATCH - Update category
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Verify ownership
    const category = await prisma.category.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Update category
    const updated = await prisma.category.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[Category Update] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const category = await prisma.category.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has tasks
    const tasksCount = await prisma.task.count({
      where: { categoryId: params.id },
    });

    if (tasksCount > 0) {
      // Option 1: Prevent deletion
      return NextResponse.json(
        {
          error: `Cannot delete category with ${tasksCount} tasks. Please reassign tasks first.`,
        },
        { status: 400 }
      );

      // Option 2: Set categoryId to null for all tasks
      // await prisma.task.updateMany({
      //   where: { categoryId: params.id },
      //   data: { categoryId: null },
      // });
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('[Category Delete] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}
```

#### Update Tag Endpoint
**New file**: `app/api/tags/[id]/route.ts`

Similar structure to categories endpoint.

---

### 2. Edit and Delete UI (0%)

#### Update CategoryManager Component
**File to modify**: `components/categories/CategoryManager.tsx`

**Add Edit Functionality:**

```tsx
const [editingCategory, setEditingCategory] = useState<Category | null>(null);

const updateMutation = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: any }) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    toast.success('Category updated');
    setEditingCategory(null);
  },
});

const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to delete category');
    }
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    toast.success('Category deleted');
  },
  onError: (error: Error) => {
    toast.error(error.message);
  },
});

// UI for each category in list:
<div className="flex items-center justify-between p-3 border rounded">
  <div className="flex items-center gap-3">
    <div
      className="w-8 h-8 rounded"
      style={{ backgroundColor: category.color }}
    />
    {editingCategory?.id === category.id ? (
      <Input
        value={editingCategory.name}
        onChange={(e) =>
          setEditingCategory({ ...editingCategory, name: e.target.value })
        }
      />
    ) : (
      <span>{category.name}</span>
    )}
  </div>

  <div className="flex gap-2">
    {editingCategory?.id === category.id ? (
      <>
        <Button
          size="sm"
          onClick={() =>
            updateMutation.mutate({
              id: category.id,
              data: {
                name: editingCategory.name,
                color: editingCategory.color,
              },
            })
          }
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setEditingCategory(null)}
        >
          Cancel
        </Button>
      </>
    ) : (
      <>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setEditingCategory(category)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (confirm('Delete this category?')) {
              deleteMutation.mutate(category.id);
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </>
    )}
  </div>
</div>
```

**Add similar functionality to TagManager.**

---

### 3. Category/Tag Selection in Task Forms (0%)

#### Update QuickAddTask Component
**File to modify**: `components/tasks/QuickAddTask.tsx`

**Add Category Dropdown:**

```tsx
import { useCategories } from '@/lib/hooks/useCategories';
import { useTags } from '@/lib/hooks/useTags';

export function QuickAddTask({ onTaskCreated }: QuickAddTaskProps) {
  const { data: categories } = useCategories();
  const { data: tags } = useTags();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  return (
    <form onSubmit={handleSubmit}>
      {/* Existing fields... */}

      {/* Category Selection */}
      <div>
        <Label>Category</Label>
        <Select
          value={selectedCategoryId}
          onValueChange={setSelectedCategoryId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No Category</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tag Selection (Multi-select) */}
      <div>
        <Label>Tags</Label>
        <MultiSelect
          options={tags?.map((tag) => ({
            value: tag.id,
            label: tag.name,
            color: tag.color,
          })) || []}
          selected={selectedTagIds}
          onChange={setSelectedTagIds}
          placeholder="Select tags"
        />
      </div>

      {/* Create button */}
    </form>
  );
}
```

**Note**: Need to create a `MultiSelect` component for tag selection.

#### Create MultiSelect Component
**New file**: `components/ui/multi-select.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface MultiSelectProps {
  options: { value: string; label: string; color?: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const selectedOptions = options.filter((opt) =>
    selected.includes(opt.value)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {selected.length > 0 ? (
            <div className="flex gap-1 flex-wrap">
              {selectedOptions.map((opt) => (
                <Badge
                  key={opt.value}
                  variant="secondary"
                  style={opt.color ? { borderColor: opt.color } : {}}
                >
                  {opt.label}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(opt.value);
                    }}
                  />
                </Badge>
              ))}
            </div>
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => handleSelect(option.value)}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    selected.includes(option.value)
                      ? 'opacity-100'
                      : 'opacity-0'
                  }`}
                />
                {option.color && (
                  <div
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

---

### 4. Filter by Category/Tag (0%)

#### Update TaskFilters Component
**File to modify**: `components/tasks/TaskFilters.tsx`

**Add Category and Tag Filters:**

```tsx
export function TaskFilters({ onFiltersChange, initialFilters }: TaskFiltersProps) {
  const { data: categories } = useCategories();
  const { data: tags } = useTags();

  const [filters, setFilters] = useState(initialFilters);

  return (
    <Card>
      {/* Existing filters... */}

      {/* Category Filter */}
      <div>
        <Label>Category</Label>
        <Select
          value={filters.categoryId || 'ALL'}
          onValueChange={(value) => {
            const newFilters = {
              ...filters,
              categoryId: value === 'ALL' ? undefined : value,
            };
            setFilters(newFilters);
            onFiltersChange(newFilters);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name} ({cat._count?.tasks || 0})
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tag Filter */}
      <div>
        <Label>Tag</Label>
        <Select
          value={filters.tagId || 'ALL'}
          onValueChange={(value) => {
            const newFilters = {
              ...filters,
              tagId: value === 'ALL' ? undefined : value,
            };
            setFilters(newFilters);
            onFiltersChange(newFilters);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Tags</SelectItem>
            {tags?.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name} ({tag._count?.tasks || 0})
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
```

---

## Implementation Steps

### Phase 1: Complete CRUD API (1 hour)

1. **Create Edit/Delete Endpoints** (1 hour)
   - [ ] Create `app/api/categories/[id]/route.ts`
   - [ ] Implement PATCH endpoint
   - [ ] Implement DELETE endpoint with validation
   - [ ] Create `app/api/tags/[id]/route.ts`
   - [ ] Implement PATCH endpoint
   - [ ] Implement DELETE endpoint with validation

### Phase 2: Update Management UI (1-1.5 hours)

2. **Update CategoryManager** (0.5 hours)
   - [ ] Add edit mode state
   - [ ] Add edit button and form
   - [ ] Add delete button with confirmation
   - [ ] Connect to mutation hooks

3. **Update TagManager** (0.5 hours)
   - [ ] Same as CategoryManager

### Phase 3: Task Form Integration (1-1.5 hours)

4. **Create MultiSelect Component** (0.5 hours)
   - [ ] Create `components/ui/multi-select.tsx`
   - [ ] Implement multi-selection logic
   - [ ] Style with colors

5. **Update QuickAddTask** (0.5 hours)
   - [ ] Add category dropdown
   - [ ] Add tag multi-select
   - [ ] Update task creation mutation

6. **Update TaskFilters** (0.5 hours)
   - [ ] Add category filter
   - [ ] Add tag filter
   - [ ] Update API call to include filters

### Phase 4: Testing (0.5 hours)

7. **End-to-End Testing** (0.5 hours)
   - [ ] Create, edit, delete categories
   - [ ] Create, edit, delete tags
   - [ ] Assign category to task
   - [ ] Assign multiple tags to task
   - [ ] Filter tasks by category
   - [ ] Filter tasks by tag

---

## Testing Checklist

### Categories

- [ ] Create a new category
  - [ ] With custom name
  - [ ] With custom color
  - [ ] Duplicate name is rejected
- [ ] Edit category
  - [ ] Change name
  - [ ] Change color
- [ ] Delete category
  - [ ] With no tasks (succeeds)
  - [ ] With tasks (shows warning or reassigns)
- [ ] Assign category to task
- [ ] Filter tasks by category
- [ ] View task count per category

### Tags

- [ ] Create a new tag
  - [ ] With custom name
  - [ ] With custom color
  - [ ] Duplicate name is rejected
- [ ] Edit tag
  - [ ] Change name
  - [ ] Change color
- [ ] Delete tag
  - [ ] With no tasks (succeeds)
  - [ ] With tasks (removes associations)
- [ ] Assign multiple tags to task
- [ ] Remove tag from task
- [ ] Filter tasks by tag
- [ ] View task count per tag

---

## Known Issues / Considerations

1. **Category Deletion**: Decide whether to prevent deletion or set categoryId to null
2. **Tag Deletion**: Cascades properly with TaskTag join table
3. **Duplicate Names**: Prevented by unique constraint `@@unique([userId, name])`
4. **Color Picker**: Current implementation allows any hex color
5. **Default Colors**: Categories default to green, tags default to blue

---

## Future Enhancements

- [ ] Nested categories (subcategories)
- [ ] Category icons
- [ ] Tag groups (organize related tags)
- [ ] Predefined color palettes
- [ ] Bulk category assignment
- [ ] Bulk tag assignment
- [ ] Smart tags (auto-assign based on keywords)
- [ ] Category templates
- [ ] Export/import categories and tags
- [ ] Share categories with team members
- [ ] Tag suggestions based on task content

---

**Last Updated**: October 31, 2025
**Next Review**: When implementation begins
