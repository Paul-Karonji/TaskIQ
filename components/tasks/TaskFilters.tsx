'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Tag as TagIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskFilters as TaskFiltersType } from '@/types';
import { Priority, Status } from '@prisma/client';
import { PRIORITY_LABELS, STATUS_LABELS } from '@/types';
import { debounce } from '@/lib/utils';
import { useTags } from '@/lib/hooks/useTags';

interface TaskFiltersProps {
  userId: string;
  onFiltersChange: (filters: TaskFiltersType) => void;
  initialFilters?: TaskFiltersType;
  isSearchPage?: boolean; // Flag to indicate if we're on the search page
}

export function TaskFilters({ userId, onFiltersChange, initialFilters, isSearchPage = false }: TaskFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [status, setStatus] = useState<Status | 'ALL'>(initialFilters?.status || 'ALL');
  const [priority, setPriority] = useState<Priority | 'ALL'>(initialFilters?.priority || 'ALL');
  const [tagId, setTagId] = useState<string | undefined>(initialFilters?.tagId);

  // Fetch tags for filtering
  const { data: tags = [] } = useTags(userId);

  // Debounced search handler - redirects to search page if not already there
  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      console.log('Filters updated:', { search, status, priority, tagId });
      // If user is searching and NOT on search page, redirect to search page
      if (search && !isSearchPage) {
        const params = new URLSearchParams();
        params.set('q', search);
        if (status !== 'ALL') params.set('status', status);
        if (priority !== 'ALL') params.set('priority', priority);
        if (tagId) params.set('categoryId', tagId);
        router.push(`/search?${params.toString()}`);
      } else {
        // Otherwise, update filters normally (on search page or when no search)
        onFiltersChange({
          search: search || undefined,
          status: status !== 'ALL' ? status : undefined,
          priority: priority !== 'ALL' ? priority : undefined,
          tagId: tagId || undefined,
        });
      }
    }, 300);

    debouncedUpdate();
  }, [search, status, priority, tagId, onFiltersChange, isSearchPage, router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as Status | 'ALL');
  };

  const handlePriorityChange = (value: string) => {
    setPriority(value as Priority | 'ALL');
  };

  const handleTagChange = (value: string) => {
    setTagId(value === 'ALL' ? undefined : value);
  };

  const hasActiveFilters = search || status !== 'ALL' || priority !== 'ALL' || !!tagId;

  const handleClearFilters = () => {
    setSearch('');
    setStatus('ALL');
    setPriority('ALL');
    setTagId(undefined);
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-card dark:shadow-card-dark transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="ml-auto text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="sr-only">
            Search tasks
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              id="search"
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Status
          </label>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger id="status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value={Status.PENDING}>{STATUS_LABELS.PENDING}</SelectItem>
              <SelectItem value={Status.COMPLETED}>{STATUS_LABELS.COMPLETED}</SelectItem>
              <SelectItem value={Status.ARCHIVED}>{STATUS_LABELS.ARCHIVED}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Priority
          </label>
          <Select value={priority} onValueChange={handlePriorityChange}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value={Priority.HIGH}>{PRIORITY_LABELS.HIGH}</SelectItem>
              <SelectItem value={Priority.MEDIUM}>{PRIORITY_LABELS.MEDIUM}</SelectItem>
              <SelectItem value={Priority.LOW}>{PRIORITY_LABELS.LOW}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tag Filter */}
        <div>
          <label htmlFor="tag" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Tag
          </label>
          <Select value={tagId || 'ALL'} onValueChange={handleTagChange}>
            <SelectTrigger id="tag">
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {search && (
              <span className="inline-flex items-center gap-1">
                Searching for &quot;<strong>{search}</strong>&quot;
              </span>
            )}
            {status !== 'ALL' && (
              <span className="inline-flex items-center gap-1">
                {search && ' • '}
                Status: <strong>{STATUS_LABELS[status as Status]}</strong>
              </span>
            )}
            {priority !== 'ALL' && (
              <span className="inline-flex items-center gap-1">
                {(search || status !== 'ALL') && ' • '}
                Priority: <strong>{PRIORITY_LABELS[priority as Priority]}</strong>
              </span>
            )}
            {tagId && (
              <span className="inline-flex items-center gap-1">
                {(search || status !== 'ALL' || priority !== 'ALL') && ' • '}
                Tag: <strong>{tags.find((t) => t.id === tagId)?.name || 'Unknown'}</strong>
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
