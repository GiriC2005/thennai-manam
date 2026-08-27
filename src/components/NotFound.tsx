import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-heading text-8xl font-bold text-gold/30 mb-4">404</p>
      <h1 className="font-heading text-3xl text-ink mb-2">Page not found</h1>
      <p className="text-ink-soft mb-8 max-w-md">
        The page you are looking for might have been moved or doesn't exist.
      </p>
      <div className="flex gap-3">
        <Link to="/" className="btn-primary">
          <Home className="w-4 h-4" />
          Go Home
        </Link>
        <button onClick={() => window.history.back()} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}
