import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Offline Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <WifiOff className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">
            You&apos;re Offline
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-lg">
            It looks like you&apos;ve lost your internet connection. Don&apos;t worry,
            some features are still available offline!
          </p>

          {/* Features Available Offline */}
          <div className="bg-green-50 rounded-lg p-4 text-left space-y-2">
            <h2 className="font-semibold text-green-900 mb-2">
              Available Offline:
            </h2>
            <ul className="space-y-1 text-sm text-green-800">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                View cached tasks
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                Browse previously loaded pages
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                Access Focus Mode timer
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </Link>
          </div>

          {/* Tips */}
          <div className="text-sm text-gray-500 pt-4 border-t">
            <p>
              <strong>Tip:</strong> Once you&apos;re back online, all your changes
              will sync automatically.
            </p>
          </div>
        </div>

        {/* PWA Info */}
        <div className="mt-6 text-sm text-gray-600">
          <p>
            DueSync works offline thanks to Progressive Web App technology
          </p>
        </div>
      </div>
    </div>
  );
}
