// app/page.tsx
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { TaskDashboard } from "@/components/tasks/TaskDashboard"
import { Logo } from "@/components/Logo"

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <Logo size="sm" showText={true} showTagline={false} />
              <p className="text-sm text-gray-600 ml-1">
                Welcome back, {session.user?.name || session.user?.email}!
              </p>
            </div>
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/login" })
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content - Task Management Dashboard */}
      <TaskDashboard />
    </div>
  )
}
