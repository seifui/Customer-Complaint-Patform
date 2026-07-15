'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { loginAction } from '@/lib/actions';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-6">
      <ThemeToggle className="absolute top-5 right-5" />
      <Card className="w-full max-w-[420px]">
        <CardContent className="pt-2 pb-2">
          <div className="mb-7">
            <Logo size={32} />
          </div>
          <div className="mb-1.5 font-heading text-xl font-medium">Sign in</div>
          <p className="mb-6.5 text-[12.5px] text-muted-foreground">Sign in to your Concerns AI workspace</p>

          {state?.error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-3.5 py-2.5 text-[11.5px] text-destructive">{state.error}</div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="login-email" className="mb-1.5">Email</Label>
              <Input id="login-email" type="email" name="email" required placeholder="you@yourbank.com" />
            </div>
            <div>
              <Label htmlFor="login-password" className="mb-1.5">Password</Label>
              <Input id="login-password" type="password" name="password" required placeholder="Password" />
            </div>
            <Button type="submit" size="lg" className="mt-1.5 w-full" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {pending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
