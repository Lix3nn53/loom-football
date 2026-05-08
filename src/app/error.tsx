"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-base-100 p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="iconify lucide--alert-triangle text-error size-24 mb-4" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
        
        <p className="text-base-content/70 mb-2">
          We encountered an unexpected error. This has been logged and we'll look into it.
        </p>
        
        {error.digest && (
          <p className="text-xs text-base-content/50 font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="btn btn-primary"
          >
            <span className="iconify lucide--refresh-cw size-4" />
            Try Again
          </button>
          
          <Link href="/" className="btn btn-ghost">
            <span className="iconify lucide--home size-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

