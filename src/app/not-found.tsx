import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
       <AlertTriangle className="w-24 h-24 text-destructive mb-6 animate-pulse" />
      <h1 className="text-6xl font-extrabold text-destructive mb-4">404</h1>
      <h2 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h2>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        Oops! The page you're looking for seems to have gotten lost in the mix.
      </p>
      <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
        <Link href="/">Return to the Main Stage</Link>
      </Button>
    </div>
  )
}
