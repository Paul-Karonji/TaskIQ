'use client';

import { useState } from 'react';
import { useTodayTasks, useToggleTaskComplete } from '@/lib/hooks/useTasks';
import { PomodoroTimer } from './PomodoroTimer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, Loader2, CalendarCheck, Target } from 'lucide-react';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/types';
import { format } from 'date-fns';

interface FocusModeViewProps {
  userId: string;
}

export function FocusModeView({ userId }: FocusModeViewProps) {
  const { data, isLoading } = useTodayTasks(userId);
  const toggleComplete = useToggleTaskComplete();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-200">Loading your tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  const tasks = data?.tasks || [];
  const pendingTasks = tasks.filter((task) => task.status === 'PENDING');

  if (pendingTasks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <CalendarCheck className="h-12 w-12 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">All Done!</h2>
            <p className="text-gray-200 text-lg mb-6">
              You have no pending tasks for today. Great work!
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentTask = pendingTasks[currentIndex];

  const handleComplete = async () => {
    try {
      await toggleComplete.mutateAsync({
        id: currentTask.id,
        completed: true,
      });

      // Move to next task if available
      if (currentIndex < pendingTasks.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // All tasks completed, show success
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(Math.min(pendingTasks.length - 1, currentIndex + 1));
  };

  const priorityColor = PRIORITY_COLORS[currentTask.priority];
  const priorityLabel = PRIORITY_LABELS[currentTask.priority];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 px-4 py-2 rounded-full mb-4">
            <Target className="h-5 w-5 text-blue-400" />
            <span className="text-blue-400 font-medium">Focus Mode</span>
          </div>
          <p className="text-gray-200">
            Task {currentIndex + 1} of {pendingTasks.length}
          </p>
        </div>

        {/* Current task card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 md:p-10 shadow-2xl border border-gray-700">
          {/* Priority badge */}
          <div className="flex items-center justify-between mb-6">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${priorityColor}20`,
                color: priorityColor,
              }}
            >
              {priorityLabel}
            </span>

            {/* Due time */}
            {currentTask.dueTime && (
              <span className="text-gray-200 text-sm">
                Due at {currentTask.dueTime}
              </span>
            )}
          </div>

          {/* Task title */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {currentTask.title}
          </h2>

          {/* Task description */}
          {currentTask.description && (
            <p className="text-gray-100 text-lg mb-6 leading-relaxed">
              {currentTask.description}
            </p>
          )}

          {/* Category */}
          {currentTask.category && (
            <div className="flex items-center gap-2 mb-6">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: currentTask.category.color }}
              />
              <span className="text-gray-200 text-sm">
                {currentTask.category.name}
              </span>
            </div>
          )}

          {/* Estimated time */}
          {currentTask.estimatedTime && (
            <p className="text-gray-200 text-sm mb-8">
              Estimated time: {currentTask.estimatedTime} minutes
            </p>
          )}

          {/* Pomodoro Timer */}
          <div className="flex justify-center my-8 py-4 border-y border-gray-700">
            <PomodoroTimer onComplete={handleComplete} />
          </div>

          {/* Task navigation and completion */}
          <div className="flex items-center justify-between gap-4 pt-6">
            {/* Previous button */}
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="bg-gray-700/50 border-gray-600 hover:bg-gray-700 disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Previous</span>
            </Button>

            {/* Complete button */}
            <Button
              onClick={handleComplete}
              disabled={toggleComplete.isPending}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold px-8 py-6 text-lg shadow-lg"
            >
              {toggleComplete.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Complete Task
                </>
              )}
            </Button>

            {/* Next button */}
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === pendingTasks.length - 1}
              className="bg-gray-700/50 border-gray-600 hover:bg-gray-700 disabled:opacity-30"
            >
              <span className="hidden md:inline">Next</span>
              <ChevronRight className="h-5 w-5 md:ml-2" />
            </Button>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {pendingTasks.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-blue-500'
                    : 'w-2 bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to task ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 text-center text-gray-300 text-sm">
          <p>💡 Tip: Use the Pomodoro timer to stay focused. Take breaks between tasks!</p>
        </div>
      </div>
    </div>
  );
}
