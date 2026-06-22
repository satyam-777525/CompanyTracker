import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authAPI } from '@/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const forgot = useMutation({
    mutationFn: (email) => authAPI.forgotPassword(email),
    onSuccess: (res) => {
      setSent(true);
      toast.success('Reset link sent!');
      if (res.data.data.resetUrl) {
        console.log('Reset URL:', res.data.data.resetUrl);
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send reset link'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md glass">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
          <p className="text-muted text-sm mb-6">Enter your email to receive a reset link.</p>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-success">Check your email for the reset link.</p>
              <Link to="/login"><Button variant="secondary" className="w-full">Back to Login</Button></Link>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); forgot.mutate(email); }} className="space-y-4">
              <Input type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" className="w-full" disabled={forgot.isPending}>
                {forgot.isPending ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <Link to="/login" className="block text-center text-sm text-primary hover:underline">Back to Login</Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
