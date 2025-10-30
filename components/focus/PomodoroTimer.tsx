'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PomodoroTimerProps {
  onComplete?: () => void;
}

type TimerMode = 'work' | 'break';

export function PomodoroTimer({ onComplete }: PomodoroTimerProps) {
  // Settings (in minutes)
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Timer state
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(workDuration * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(workDuration * 60);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play completion sound
  const playSound = () => {
    if (soundEnabled) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        // Fallback: Use system notification sound or log
        console.log('Timer complete!');
      });
    }
  };

  // Start timer
  const start = () => {
    setIsRunning(true);
  };

  // Pause timer
  const pause = () => {
    setIsRunning(false);
  };

  // Reset timer
  const reset = () => {
    setIsRunning(false);
    const duration = mode === 'work' ? workDuration : breakDuration;
    setTimeLeft(duration * 60);
    setTotalTime(duration * 60);
  };

  // Switch modes
  const switchMode = () => {
    const newMode = mode === 'work' ? 'break' : 'work';
    setMode(newMode);
    const duration = newMode === 'work' ? workDuration : breakDuration;
    setTimeLeft(duration * 60);
    setTotalTime(duration * 60);
    setIsRunning(false);
  };

  // Update settings
  const updateSettings = (newWorkDuration: number, newBreakDuration: number) => {
    setWorkDuration(newWorkDuration);
    setBreakDuration(newBreakDuration);

    // Update current timer if not running
    if (!isRunning) {
      const duration = mode === 'work' ? newWorkDuration : newBreakDuration;
      setTimeLeft(duration * 60);
      setTotalTime(duration * 60);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playSound();

            // Call onComplete callback
            if (mode === 'work' && onComplete) {
              onComplete();
            }

            // Auto-switch to break after work session
            if (mode === 'work') {
              setTimeout(() => switchMode(), 1000);
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 120; // circle radius = 120
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode indicator */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => mode === 'break' && switchMode()}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'work'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Work
        </button>
        <button
          onClick={() => mode === 'work' && switchMode()}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'break'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Break
        </button>
      </div>

      {/* Circular timer */}
      <div className="relative">
        <svg width="280" height="280" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r="120"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="140"
            cy="140"
            r="120"
            stroke={mode === 'work' ? '#3B82F6' : '#10B981'}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>

        {/* Timer display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl font-bold mb-2">{formatTime(timeLeft)}</p>
            <p className="text-gray-400 text-sm">
              {mode === 'work' ? 'Focus Time' : 'Break Time'}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!isRunning ? (
          <Button
            onClick={start}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 px-8"
          >
            <Play className="h-5 w-5 mr-2" />
            Start
          </Button>
        ) : (
          <Button
            onClick={pause}
            size="lg"
            variant="outline"
            className="px-8"
          >
            <Pause className="h-5 w-5 mr-2" />
            Pause
          </Button>
        )}

        <Button
          onClick={reset}
          size="lg"
          variant="outline"
          className="text-gray-700 hover:text-gray-900"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          onClick={() => setSoundEnabled(!soundEnabled)}
          size="lg"
          variant="outline"
          className="text-gray-700 hover:text-gray-900"
        >
          {soundEnabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </Button>

        {/* Settings dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" variant="outline" className="text-gray-700 hover:text-gray-900">
              <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle>Timer Settings</DialogTitle>
              <DialogDescription className="text-gray-400">
                Customize your focus and break durations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="work-duration" className="text-white">Work Duration (minutes)</Label>
                <Input
                  id="work-duration"
                  type="number"
                  min="1"
                  max="60"
                  value={workDuration}
                  onChange={(e) =>
                    updateSettings(parseInt(e.target.value) || 25, breakDuration)
                  }
                  className="!bg-gray-700 !border-gray-600 !text-white mt-2"
                />
              </div>
              <div>
                <Label htmlFor="break-duration" className="text-white">Break Duration (minutes)</Label>
                <Input
                  id="break-duration"
                  type="number"
                  min="1"
                  max="30"
                  value={breakDuration}
                  onChange={(e) =>
                    updateSettings(workDuration, parseInt(e.target.value) || 5)
                  }
                  className="!bg-gray-700 !border-gray-600 !text-white mt-2"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
