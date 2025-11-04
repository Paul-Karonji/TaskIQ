import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/Logo"
import {
  Calendar,
  CheckCircle,
  Clock,
  Target,
  Bell,
  Shield,
  Zap,
  Users,
  Smartphone,
  BarChart3
} from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} showTagline={true} />
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                Terms
              </Link>
              <Link href="/login">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            🚀 Smart Task Management
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Sync Your Tasks with
            <span className="text-blue-600 dark:text-blue-400"> Google Calendar</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            DueSync intelligently organizes your tasks, sets smart priorities, and keeps your Google Calendar in perfect sync.
            Never miss a deadline again with automated reminders and seamless integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to Stay Organized
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Powerful features designed to help you manage tasks efficiently and keep your schedule in sync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Calendar className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
                <CardTitle>Google Calendar Sync</CardTitle>
                <CardDescription>
                  Automatically sync your tasks with Google Calendar. Create events, set reminders, and keep everything in one place.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Target className="h-10 w-10 text-green-600 dark:text-green-400 mb-4" />
                <CardTitle>Smart Prioritization</CardTitle>
                <CardDescription>
                  Intelligent priority system helps you focus on what matters most. High, medium, and low priority tasks with visual indicators.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Clock className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-4" />
                <CardTitle>Focus Mode</CardTitle>
                <CardDescription>
                  Built-in Pomodoro timer and distraction-free mode to help you concentrate and complete tasks efficiently.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Bell className="h-10 w-10 text-orange-600 dark:text-orange-400 mb-4" />
                <CardTitle>Smart Notifications</CardTitle>
                <CardDescription>
                  Get reminded about upcoming tasks via email, push notifications, and calendar alerts. Customizable notification preferences.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-4" />
                <CardTitle>Recurring Tasks</CardTitle>
                <CardDescription>
                  Set up daily, weekly, or monthly recurring tasks. DueSync automatically creates new instances so you never forget routine tasks.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-4" />
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Track your productivity with detailed statistics. See completed tasks, pending items, and overdue tasks at a glance.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Google Integration Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Seamless Google Integration
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              DueSync securely connects to your Google account to provide the best task management experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
                Why We Need Access to Your Google Account
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Calendar Events</h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      Create, update, and delete calendar events for your tasks so they appear in Google Calendar.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Smart Reminders</h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      Set automatic reminders and notifications to ensure you never miss important deadlines.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Profile Information</h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      Access your basic profile information (name, email) to personalize your experience.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Your Data Security</h4>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      We only access the minimum data required and never share your information with third parties.
                      All data is encrypted and stored securely.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 text-center">
                What We Access
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-slate-700 dark:text-slate-300">Basic profile information</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-slate-700 dark:text-slate-300">Email address</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-700 dark:text-slate-300">Google Calendar (read/write)</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 text-center">
                Green: Basic access • Blue: Calendar integration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Organized?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of users who have transformed their productivity with DueSync.
          </p>
          <Link href="/login">
            <Button size="lg" variant="default" className="bg-blue-600 hover:bg-blue-700">
              Start Syncing Your Tasks
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Logo size="md" showText={true} showTagline={false} />
              <p className="text-slate-600 dark:text-slate-300 mt-4 max-w-md">
                Smart task management with seamless Google Calendar integration.
                Stay organized, meet deadlines, and boost your productivity.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><Link href="/login" className="hover:text-slate-900 dark:hover:text-white">Dashboard</Link></li>
                <li><Link href="/focus" className="hover:text-slate-900 dark:hover:text-white">Focus Mode</Link></li>
                <li><Link href="/settings" className="hover:text-slate-900 dark:hover:text-white">Settings</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-slate-900 dark:hover:text-white">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-slate-900 dark:hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>&copy; 2025 DueSync. All rights reserved. Built with ❤️ for productivity enthusiasts.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}