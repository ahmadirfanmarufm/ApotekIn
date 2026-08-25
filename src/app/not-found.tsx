"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-primary-text mb-2">
          Page Not Found
        </h2>
        <p className="text-primary-text mb-8">
          Sorry, the page you{"'"}re looking for doesn{"'"}t exist or has been
          moved.
        </p>
        <button
          onClick={() => router.back()}
          className="inline-block bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary/80 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
