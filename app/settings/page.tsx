// app/settings/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SettingsLayout } from "@/components/settings/SettingsLayout"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/Logo"

export default async function SettingsPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Fetch user data with related information
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      notifications: true,
      accounts: {
        where: { provider: "google" },
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  // Get Google account info
  const googleAccount = user.accounts.find((acc) => acc.provider === "google")

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo size="sm" showText={true} showTagline={false} />
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Settings</h1>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SettingsLayout
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            timezone: user.timezone,
            createdAt: user.createdAt.toISOString(),
          }}
          googleAccount={
            googleAccount
              ? {
                  email: user.email,
                  connected: true,
                  accessToken: !!googleAccount.access_token,
                  expiresAt: googleAccount.expires_at,
                }
              : null
          }
        />
      </main>
    </div>
  )
}
