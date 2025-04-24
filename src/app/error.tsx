
'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
       <AlertTriangle className="w-24 h-24 text-destructive mb-6 animate-ping" />
       <h1 className="text-4xl font-extrabold text-destructive mb-4">Something Went Wrong</h1>
       <p className="text-lg text-muted-foreground mb-6 max-w-md">
        An unexpected error occurred. We apologize for the inconvenience.
      </p>
      {/* Attempt to recover by trying to re-render the segment */}
      <Button
        onClick={() => reset()}
        variant="destructive"
        className="mb-4"
      >
        Try Again
      </Button>
       <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
        <a href="/">Go back to Home</a>
      </Button>
      {/* Optionally display error details during development */}
      {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left w-full max-w-2xl p-4 bg-muted/50 rounded border border-dashed">
              <summary className="cursor-pointer font-medium">Error Details (Dev Only)</summary>
              <pre className="mt-2 text-xs whitespace-pre-wrap break-all">
                  <code>{error?.message}</code>
                  {error?.digest && <p>Digest: {error.digest}</p>}
                  {error?.stack && <p className="mt-2">Stack: {error.stack}</p>}
              </pre>
          </details>
      )}
    </div>
  )
}
