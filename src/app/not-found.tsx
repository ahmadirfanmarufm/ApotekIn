import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary-text mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-primary-text mb-2">Page Not Found</h2>
        <p className="text-primary-text mb-8">
          Sorry, the page you{"'"}re looking for doesn{"'"}t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary/80 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
