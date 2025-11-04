'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tag, Trash2, Edit2 } from 'lucide-react';
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
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/lib/hooks/useTags';
import { createTagSchema, type CreateTagInput } from '@/lib/validations/tag';

interface TagManagerProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TagManager({ userId, open, onOpenChange }: TagManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: tags = [], isLoading } = useTags(userId);
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateTagInput>({
    resolver: zodResolver(createTagSchema),
    defaultValues: {
      name: '',
      color: '#3B82F6',
    },
  });

  const color = watch('color');

  const onSubmit = async (data: CreateTagInput) => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data });
      setEditingId(null);
    } else {
      await createMutation.mutateAsync(data);
    }
    reset({ name: '', color: '#3B82F6' });
  };

  const handleEdit = (tag: any) => {
    setEditingId(tag.id);
    setValue('name', tag.name);
    setValue('color', tag.color);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this tag? It will be removed from all tasks.')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    reset({ name: '', color: '#3B82F6' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Create and manage your task tags
          </DialogDescription>
        </DialogHeader>

        {/* Create/Edit Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border-b pb-4">
          <div>
            <Label htmlFor="name">Tag Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Urgent, Important, Review"
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
              {editingId ? 'Update' : 'Create'} Tag
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        {/* Tags List */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-700">Your Tags</h3>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : tags.length === 0 ? (
            <p className="text-sm text-gray-500">No tags yet. Create one above.</p>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5" style={{ color: tag.color }} />
                    <div>
                      <p className="font-medium">{tag.name}</p>
                      {tag._count && (
                        <p className="text-xs text-gray-500">
                          {tag._count.tasks} task{tag._count.tasks !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(tag)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(tag.id)}
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
