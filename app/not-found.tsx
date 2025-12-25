import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { Button } from './components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 mx-auto rounded-full bg-cyan-500/10 flex items-center justify-center">
          <Search className="w-10 h-10 text-cyan-500" />
        </div>
        <div>
          <h1 className="text-6xl font-bold text-white mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Page Not Found</h2>
          <p className="text-gray-400">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Link href="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
