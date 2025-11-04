// app/page.tsx
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { TaskDashboard } from "@/components/tasks/TaskDashboard"
import { WelcomeTour } from "@/components/onboarding/WelcomeTour"
import { Logo } from "@/components/Logo"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import Link from "next/link"
import { Settings } from "lucide-react"

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-slate-900 transition-colors" suppressHydrationWarning>
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" suppressHydrationWarning>
          <div className="flex items-center justify-between" suppressHydrationWarning>
            <div className="flex flex-col gap-2">
              <Logo size="sm" showText={true} showTagline={false} />
              <p className="text-sm text-slate-600 dark:text-slate-400 ml-1">
                Welcome back, {session.user?.name || session.user?.email}!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/settings" data-tour="settings">
                <button className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              </Link>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/login" })
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg bg-slate-100 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Task Management Dashboard */}
      <TaskDashboard userId={session.user.id} />

      {/* Welcome Tour for new users */}
      <WelcomeTour />
    </div>
  )
}
