import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { FocusModeView } from '@/components/focus/FocusModeView';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export const metadata = {
  title: 'Focus Mode | DueSync',
  description: 'Distraction-free task focus with Pomodoro timer',
};

export default async function FocusPage() {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="opacity-90 hover:opacity-100 transition-opacity">
                <Logo size="sm" showText={true} showTagline={false} theme="dark" />
              </div>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main>
        <FocusModeView />
      </main>
    </div>
  );
}
