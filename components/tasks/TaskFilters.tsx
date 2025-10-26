'use client';

import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
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

interface TaskFiltersProps {
  onFiltersChange: (filters: TaskFiltersType) => void;
  initialFilters?: TaskFiltersType;
}

export function TaskFilters({ onFiltersChange, initialFilters }: TaskFiltersProps) {
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [status, setStatus] = useState<Status | 'ALL'>(initialFilters?.status || 'ALL');
  const [priority, setPriority] = useState<Priority | 'ALL'>(initialFilters?.priority || 'ALL');

  // Debounced search handler
  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      onFiltersChange({
        search: search || undefined,
        status: status !== 'ALL' ? status : undefined,
        priority: priority !== 'ALL' ? priority : undefined,
      });
    }, 300);

    debouncedUpdate();
  }, [search, status, priority, onFiltersChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as Status | 'ALL');
  };

  const handlePriorityChange = (value: string) => {
    setPriority(value as Priority | 'ALL');
  };

  const hasActiveFilters = search || status !== 'ALL' || priority !== 'ALL';

  const handleClearFilters = () => {
    setSearch('');
    setStatus('ALL');
    setPriority('ALL');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium"
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
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
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
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
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
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
          </p>
        </div>
      )}
    </div>
  );
}
