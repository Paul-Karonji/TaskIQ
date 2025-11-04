import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ArchiveView } from '@/components/archive/ArchiveView';
import { Logo } from '@/components/Logo';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ArchivePage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

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
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <ArchiveView userId={session.user.id} />
      </main>
    </div>
  );
}
