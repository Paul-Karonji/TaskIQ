// app/login/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/Logo"
import { LoginForm } from "@/components/LoginForm"

export default async function LoginPage() {
  const session = await auth()

  // If already logged in, redirect to home
  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
      {/* Main Login Card */}
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white dark:bg-slate-800 p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center">
          <Logo size="md" showText={true} showTagline={true} />
        </div>

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>

      {/* Footer with Policy Links */}
      <footer className="mt-8 mb-4 w-full max-w-md">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <Link
            href="/privacy"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            Privacy Policy
          </Link>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <Link
            href="/terms"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            Terms of Service
          </Link>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <Link
            href="/security"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            Security
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-500">
          © 2025 DueSync. All rights reserved.
        </p>
      </footer>
    </div>
  )
}