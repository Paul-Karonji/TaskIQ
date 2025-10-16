// app/page.tsx
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TaskIQ</h1>
              <p className="text-sm text-gray-600">
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

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            🎉 Setup Complete!
          </h2>
          <p className="mt-2 text-gray-600">
            Your TaskIQ foundation is ready. Week 1 is complete!
          </p>
          
          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-600">✅ Next.js + TypeScript configured</p>
            <p className="text-sm text-gray-600">✅ Database connected (PostgreSQL + Prisma)</p>
            <p className="text-sm text-gray-600">✅ Google OAuth working</p>
            <p className="text-sm text-gray-600">✅ Authentication system ready</p>
          </div>

          <div className="mt-8 rounded-lg bg-blue-50 p-4">
            <h3 className="font-medium text-blue-900">Next Steps (Week 2):</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>• Build Task CRUD API endpoints</li>
              <li>• Create task list UI</li>
              <li>• Implement quick add task form</li>
              <li>• Add priority levels and filtering</li>
            </ul>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 rounded-lg bg-gray-100 p-4">
          <h3 className="font-mono text-sm font-semibold text-gray-700">
            Session Debug Info:
          </h3>
          <pre className="mt-2 overflow-auto text-xs text-gray-600">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  )
}
