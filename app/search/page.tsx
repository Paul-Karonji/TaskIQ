import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { SearchResults } from '@/components/search/SearchResults';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; priority?: string; categoryId?: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams;
  const query = params.q || '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Search Results
          </h1>
          {query && (
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Showing results for: <span className="font-semibold">"{query}"</span>
            </p>
          )}
        </div>

        <SearchResults
          initialQuery={query}
          initialStatus={params.status}
          initialPriority={params.priority}
          initialCategoryId={params.categoryId}
        />
      </main>
    </div>
  );
}
