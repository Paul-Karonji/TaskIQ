'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Folder, Trash2, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/color-picker';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/lib/hooks/useCategories';
import { createCategorySchema, type CreateCategoryInput } from '@/lib/validations/category';

interface CategoryManagerProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryManager({ userId, open, onOpenChange }: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useCategories(userId);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      color: '#10B981',
    },
  });

  const color = watch('color');

  const onSubmit = async (data: CreateCategoryInput) => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data });
      setEditingId(null);
    } else {
      await createMutation.mutateAsync(data);
    }
    reset({ name: '', color: '#10B981' });
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setValue('name', category.name);
    setValue('color', category.color);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category? Tasks will not be deleted.')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    reset({ name: '', color: '#10B981' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Create and manage your task categories
          </DialogDescription>
        </DialogHeader>

        {/* Create/Edit Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border-b pb-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Work, Personal, Health"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <ColorPicker
            value={color}
            onChange={(value) => setValue('color', value)}
            label="Color"
          />
          {errors.color && (
            <p className="text-sm text-red-600 mt-1">{errors.color.message}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? 'Update' : 'Create'} Category
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        {/* Categories List */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-700">Your Categories</h3>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-500">No categories yet. Create one above.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <Folder className="h-5 w-5" style={{ color: category.color }} />
                    <div>
                      <p className="font-medium">{category.name}</p>
                      {category._count && (
                        <p className="text-xs text-gray-500">
                          {category._count.tasks} task{category._count.tasks !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(category.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
