"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-base-100 p-4">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <span className="iconify lucide--alert-octagon text-error" style={{ fontSize: '96px' }} />
            </div>
            
            <h1 className="text-4xl font-bold mb-4">Critical Error</h1>
            
            <p className="text-base-content/70 mb-6">
              A critical error occurred. Please try refreshing the page.
            </p>
            
            {error.digest && (
              <p className="text-xs text-base-content/50 font-mono mb-6">
                Error ID: {error.digest}
              </p>
            )}

            <button
              onClick={reset}
              className="btn btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

