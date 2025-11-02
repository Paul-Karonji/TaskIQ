# Focus Mode Feature

**Status**: 🟡 5% Complete
**Priority**: Medium
**Estimated Time**: 6-8 hours

## Overview
A distraction-free view showing only today's pending tasks with an optional Pomodoro timer to help users stay focused and productive. Focus Mode removes all UI clutter and provides a clean, minimal interface for deep work.

---

## Current Implementation Status

### ✅ Completed (5%)

#### 1. API Endpoint for Today's Tasks
**File**: `app/api/tasks/today/route.ts` (if it exists, otherwise needs creation)

**Current Status**: Likely exists based on CLAUDE.md mention

```typescript
// Expected implementation
export async function GET(request: NextRequest) {
  const session = await requireAuth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
      status: 'PENDING',
      dueDate: {
        gte: today,
        lt: tomorrow,
      },
    },
    orderBy: [
      { priority: 'desc' },
      { dueTime: 'asc' },
    ],
  });

  return NextResponse.json({ tasks, total: tasks.length });
}
```

#### 2. Navigation Link
**File**: `components/tasks/TaskDashboard.tsx`

```tsx
<Link href="/focus" data-tour="focus-mode">
  <Button
    size="sm"
    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
  >
    <Target className="h-4 w-4 mr-2" />
    Focus Mode
  </Button>
</Link>
```

**Status**: Link exists, but destination page does not.

---

## ❌ Not Implemented (95%)

### 1. Focus Mode Page (0%)

#### Create Main Page
**New file**: `app/focus/page.tsx`

**Features**:
- Full-screen distraction-free layout
- No header, no sidebar, no clutter
- Only today's pending tasks
- Minimal styling
- Exit button to return to dashboard

**UI Structure**:
```tsx
export default async function FocusModePage() {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <FocusModeView />
    </div>
  );
}
```

---

### 2. Focus Mode View Component (0%)

**New file**: `components/focus/FocusModeView.tsx`

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  [← Exit Focus Mode]                    [⚙ Settings]        │
│                                                               │
│                       🎯 Focus Mode                          │
│                   Today's Tasks (3 remaining)                 │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ☐  Write project proposal                          │   │
│  │      Due: 2:00 PM  •  Priority: High  •  Work      │   │
│  │      Estimated: 2 hours                             │   │
│  │                                                       │   │
│  │      [Start Pomodoro]  [Complete]  [Skip]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ☐  Team standup meeting                            │   │
│  │      Due: 3:30 PM  •  Priority: Medium              │   │
│  │                                                       │   │
│  │      [Start Pomodoro]  [Complete]  [Skip]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│                    [🍅 Pomodoro Timer]                       │
│                         25:00                                 │
│                                                               │
│                      [Start Timer]                            │
│                                                               │
│  Progress: ████████░░░░░░░  2 of 3 completed                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Component Structure**:
```tsx
'use client';

export function FocusModeView() {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['focus-tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks/today');
      return res.json();
    },
  });

  const currentTask = data?.tasks[currentTaskIndex];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/">
          <Button variant="ghost">← Exit Focus Mode</Button>
        </Link>
        <FocusModeSettings />
      </div>

      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🎯 Focus Mode
        </h1>
        <p className="text-gray-600">
          Today's Tasks ({data?.tasks.length - completedCount} remaining)
        </p>
      </div>

      {/* Current Task Card */}
      {currentTask ? (
        <FocusTaskCard
          task={currentTask}
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      ) : (
        <CompletionCelebration />
      )}

      {/* Pomodoro Timer */}
      <div className="mt-8">
        <PomodoroTimer taskTitle={currentTask?.title} />
      </div>

      {/* Progress Bar */}
      <FocusProgress
        completed={completedCount}
        total={data?.tasks.length || 0}
      />
    </div>
  );
}
```

---

### 3. Focus Task Card (0%)

**New file**: `components/focus/FocusTaskCard.tsx`

**Features**:
- Large, prominent display
- Shows one task at a time
- Quick action buttons
- Minimal distractions

```tsx
interface FocusTaskCardProps {
  task: Task;
  onComplete: () => void;
  onSkip: () => void;
}

export function FocusTaskCard({ task, onComplete, onSkip }: FocusTaskCardProps) {
  return (
    <Card className="p-8 shadow-2xl border-2">
      {/* Priority Indicator */}
      <div
        className="h-2 w-full rounded-full mb-6"
        style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
      />

      {/* Task Title */}
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        {task.title}
      </h2>

      {/* Task Details */}
      {task.description && (
        <p className="text-gray-600 mb-6 text-lg">{task.description}</p>
      )}

      {/* Meta Information */}
      <div className="flex gap-6 mb-8 text-gray-500">
        {task.dueTime && (
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Due: {task.dueTime}
          </div>
        )}
        {task.estimatedTime && (
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            {task.estimatedTime} minutes
          </div>
        )}
        {task.category && (
          <Badge style={{ backgroundColor: task.category.color }}>
            {task.category.name}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          size="lg"
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={onComplete}
        >
          <Check className="h-5 w-5 mr-2" />
          Complete Task
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onSkip}
        >
          Skip for Now
        </Button>
      </div>
    </Card>
  );
}
```

---

### 4. Pomodoro Timer (0%)

**New file**: `components/focus/PomodoroTimer.tsx`

**Features**:
- 25-minute work sessions
- 5-minute short breaks
- 15-minute long breaks (after 4 sessions)
- Audio notification when complete
- Pause/Resume functionality
- Settings for custom durations

```tsx
'use client';

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_SHORT_BREAK = 5;
const DEFAULT_LONG_BREAK = 15;

export function PomodoroTimer({ taskTitle }: { taskTitle?: string }) {
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_WORK_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    // Play notification sound
    const audio = new Audio('/sounds/timer-complete.mp3');
    audio.play();

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Complete!', {
        body: mode === 'work' ? 'Time for a break!' : 'Back to work!',
        icon: '/icon-192.png',
      });
    }

    // Switch mode
    if (mode === 'work') {
      setSessionsCompleted((prev) => prev + 1);
      const nextMode = sessionsCompleted % 4 === 3 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(nextMode === 'longBreak' ? DEFAULT_LONG_BREAK * 60 : DEFAULT_SHORT_BREAK * 60);
    } else {
      setMode('work');
      setTimeLeft(DEFAULT_WORK_MINUTES * 60);
    }

    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(DEFAULT_WORK_MINUTES * 60);
    setMode('work');
  };

  return (
    <Card className="p-8 text-center">
      {/* Mode Indicator */}
      <div className="mb-4">
        <Badge
          variant={mode === 'work' ? 'default' : 'secondary'}
          className="text-lg px-4 py-2"
        >
          {mode === 'work' ? '🍅 Work Session' : mode === 'shortBreak' ? '☕ Short Break' : '🌴 Long Break'}
        </Badge>
      </div>

      {/* Timer Display */}
      <div className="text-7xl font-bold text-gray-900 mb-8 font-mono">
        {formatTime(timeLeft)}
      </div>

      {/* Task Context */}
      {taskTitle && mode === 'work' && (
        <p className="text-gray-600 mb-6">Working on: {taskTitle}</p>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!isRunning ? (
          <Button size="lg" onClick={handleStart}>
            <Play className="h-5 w-5 mr-2" />
            Start
          </Button>
        ) : (
          <Button size="lg" variant="secondary" onClick={handlePause}>
            <Pause className="h-5 w-5 mr-2" />
            Pause
          </Button>
        )}
        <Button size="lg" variant="outline" onClick={handleReset}>
          <RotateCcw className="h-5 w-5 mr-2" />
          Reset
        </Button>
      </div>

      {/* Session Counter */}
      <div className="mt-6 text-gray-500">
        Sessions completed today: {sessionsCompleted}
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 flex justify-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < sessionsCompleted % 4 ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </Card>
  );
}
```

---

### 5. Focus Mode Settings (0%)

**New file**: `components/focus/FocusModeSettings.tsx`

**Features**:
- Customize Pomodoro durations
- Toggle sounds
- Toggle browser notifications
- Auto-start next task
- Theme (light/dark/zen)

```tsx
export function FocusModeSettings() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartNextTask: true,
    soundEnabled: true,
    browserNotifications: true,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Focus Mode Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Timer Durations */}
          <div>
            <Label>Work Duration (minutes)</Label>
            <Input
              type="number"
              value={settings.workDuration}
              onChange={(e) => setSettings({ ...settings, workDuration: +e.target.value })}
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between">
            <Label>Auto-start next task</Label>
            <Switch
              checked={settings.autoStartNextTask}
              onCheckedChange={(checked) => setSettings({ ...settings, autoStartNextTask: checked })}
            />
          </div>

          <Button onClick={() => {
            localStorage.setItem('focusModeSettings', JSON.stringify(settings));
            toast.success('Settings saved');
            setOpen(false);
          }}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 6. Completion Celebration (0%)

**New file**: `components/focus/CompletionCelebration.tsx`

**Features**:
- Show when all tasks are complete
- Confetti animation
- Stats summary
- Motivational message

```tsx
export function CompletionCelebration() {
  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <Card className="p-12 text-center">
      <div className="text-8xl mb-6">🎉</div>
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        All Done!
      </h2>
      <p className="text-xl text-gray-600 mb-8">
        You've completed all tasks for today. Great job!
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">5</div>
          <div className="text-sm text-gray-600">Tasks Completed</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-green-600">3.5</div>
          <div className="text-sm text-gray-600">Hours Focused</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">7</div>
          <div className="text-sm text-gray-600">Pomodoros</div>
        </div>
      </div>

      <Link href="/">
        <Button size="lg">
          Return to Dashboard
        </Button>
      </Link>
    </Card>
  );
}
```

---

## Implementation Steps

### Phase 1: Basic Focus Mode (3-4 hours)

1. **Create Focus Mode Page** (1 hour)
   - [ ] Create `app/focus/page.tsx`
   - [ ] Add server-side auth check
   - [ ] Create minimal layout

2. **Create Focus Mode View** (1.5 hours)
   - [ ] Create `FocusModeView.tsx` component
   - [ ] Fetch today's tasks
   - [ ] Display current task
   - [ ] Add complete/skip actions
   - [ ] Show progress

3. **Create Focus Task Card** (0.5 hours)
   - [ ] Create `FocusTaskCard.tsx`
   - [ ] Large, clean design
   - [ ] Action buttons

4. **Test Basic Flow** (1 hour)
   - [ ] Navigate to /focus
   - [ ] Complete tasks
   - [ ] Verify progress updates
   - [ ] Test empty state

### Phase 2: Pomodoro Timer (2-3 hours)

5. **Create Timer Component** (2 hours)
   - [ ] Create `PomodoroTimer.tsx`
   - [ ] Implement countdown logic
   - [ ] Add start/pause/reset
   - [ ] Mode switching (work/break)
   - [ ] Session counter

6. **Add Notifications** (0.5 hours)
   - [ ] Browser notification permission
   - [ ] Notification on timer complete
   - [ ] Add timer-complete sound

7. **Settings Dialog** (0.5 hours)
   - [ ] Create settings component
   - [ ] Custom durations
   - [ ] Save to localStorage

### Phase 3: Polish (1-2 hours)

8. **Completion Celebration** (0.5 hours)
   - [ ] Confetti animation
   - [ ] Stats display
   - [ ] Return to dashboard link

9. **Keyboard Shortcuts** (0.5 hours)
   - [ ] Space: Start/Pause timer
   - [ ] Enter: Complete current task
   - [ ] Esc: Exit focus mode

10. **Final Testing** (1 hour)
    - [ ] Test full flow
    - [ ] Test timer accuracy
    - [ ] Test notifications
    - [ ] Mobile responsive check

---

## Dependencies

```bash
# For confetti celebration
npm install canvas-confetti
npm install --save-dev @types/canvas-confetti

# For timer sounds (add MP3 files to public/sounds/)
# - timer-complete.mp3
# - timer-start.mp3
```

---

## API Endpoints

### Get Today's Tasks

**GET** `/api/tasks/today`

**Response**:
```json
{
  "tasks": [
    {
      "id": "task_id",
      "title": "Task title",
      "description": "Description",
      "dueDate": "2025-10-31",
      "dueTime": "14:00",
      "priority": "HIGH",
      "category": { "name": "Work", "color": "#10B981" }
    }
  ],
  "total": 3
}
```

---

## Testing Checklist

### Manual Testing

- [ ] Navigate to /focus from dashboard
- [ ] See only today's pending tasks
- [ ] Complete a task
  - [ ] Verify it moves to next task
  - [ ] Verify progress updates
- [ ] Skip a task
  - [ ] Verify it moves to next task
  - [ ] Verify task remains pending
- [ ] Start Pomodoro timer
  - [ ] Verify countdown works
  - [ ] Verify timer shows correct time
- [ ] Complete a Pomodoro
  - [ ] Verify notification appears
  - [ ] Verify sound plays
  - [ ] Verify mode switches to break
- [ ] Complete all tasks
  - [ ] Verify celebration screen shows
  - [ ] Verify confetti animation
  - [ ] Verify stats are correct
- [ ] Exit focus mode
  - [ ] Return to dashboard
  - [ ] Verify tasks are updated

### Edge Cases

- [ ] No tasks due today
- [ ] All tasks already completed
- [ ] Timer running when leaving page
- [ ] Browser notification permission denied
- [ ] Sound disabled in browser
- [ ] Multiple focus mode tabs open

---

## Known Issues / Considerations

1. **Timer Persistence**: Timer resets if user refreshes page or leaves
2. **Multi-Tab**: Opening multiple focus mode tabs may cause issues
3. **Background Timer**: Timer stops if tab is in background (browser throttling)
4. **Notification Permission**: Some users may deny notification permission
5. **Sound Autoplay**: Some browsers block sound autoplay

---

## Future Enhancements

- [ ] Save timer state to localStorage (persist on refresh)
- [ ] Sync Pomodoro sessions to database (track productivity)
- [ ] Productivity analytics (tasks completed per day, Pomodoros per week)
- [ ] Custom background music/sounds
- [ ] Integration with Spotify/YouTube for background music
- [ ] Zen mode (even more minimal - just task title and timer)
- [ ] Goals: Set daily Pomodoro goals
- [ ] Breaks: Suggested activities during breaks
- [ ] Distractions: Log and track distractions
- [ ] Focus score: Calculate focus quality based on sessions
- [ ] Social: Share focus sessions with team (accountability)

---

## Resources

- [Pomodoro Technique](https://en.wikipedia.org/wiki/Pomodoro_Technique)
- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- [Free Timer Sounds](https://freesound.org/)

---

**Last Updated**: October 31, 2025
**Next Review**: When implementation begins
