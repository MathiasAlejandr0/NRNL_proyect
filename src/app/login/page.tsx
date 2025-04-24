import { AuthForm } from '@/components/AuthForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login / Sign Up | NoRaveNoLife',
    description: 'Login or create an account to access NoRaveNoLife features.',
};


export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <AuthForm />
    </div>
  );
}
