'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, LogIn, UserPlus } from 'lucide-react'; // Import icons
import { useRouter } from 'next/navigation'; // Use App Router's router

// Define validation schemas
const authSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

type AuthFormData = z.infer<typeof authSchema>;

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        console.log('Login successful');
        router.push('/'); // Redirect to home page after login
      } else {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
        console.log('Signup successful');
        router.push('/'); // Redirect to home page after signup
      }
      reset(); // Clear form on success
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log('Google sign-in successful');
      router.push('/'); // Redirect to home page
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null); // Clear error when switching modes
    reset(); // Clear form fields when switching modes
  };

  return (
    <Card className="w-full max-w-md mx-auto border border-border shadow-xl bg-card/95">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {isLogin ? (
            <span className="flex items-center justify-center gap-2"><LogIn className="w-6 h-6" /> Login</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><UserPlus className="w-6 h-6" /> Sign Up</span>
          )}
        </CardTitle>
        <CardDescription>
          {isLogin
            ? 'Enter your credentials to access your account.'
            : 'Create an account to discover events.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              aria-invalid={errors.password ? 'true' : 'false'}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              isLogin ? 'Login' : 'Sign Up'
            )}
          </Button>
        </form>
        <div className="mt-4 relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
           {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <>
                    {/* Basic SVG for Google Logo */}
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.4 512 0 398.8 0 256S110.4 0 244 0c73.2 0 136.3 30.1 182.7 78.4l-66.4 64.5c-21.7-20.5-50-33.3-83.9-33.3-64.6 0-117.2 52.4-117.2 117.1s52.6 117.1 117.2 117.1c72.1 0 100.6-53.1 104.9-81.3H244v-70.6h236c1.4 9.4 3.2 18.7 3.2 28.7z"></path>
                    </svg>
                    Sign in with Google
                </>
            )}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={toggleMode} className="text-sm">
          {isLogin
            ? "Don't have an account? Sign Up"
            : 'Already have an account? Login'}
        </Button>
      </CardFooter>
    </Card>
  );
}
