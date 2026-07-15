import { Link } from 'react-router-dom';
import CoconutMark from '../components/CoconutMark';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream-100 text-center px-6">
      <CoconutMark size={48} />
      <h1 className="font-display text-3xl font-semibold text-bark-900">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-500">The page you're looking for doesn't exist or may have been moved.</p>
      <Link to="/" className="rounded-lg bg-palm-700 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-palm-600">
        Back to dashboard
      </Link>
    </div>
  );
}
