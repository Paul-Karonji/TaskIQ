// app/settings/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SettingsLayout } from "@/components/settings/SettingsLayout"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>
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
