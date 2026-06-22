import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authAPI } from '@/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const reset = useMutation({
    mutationFn: (data) => authAPI.resetPassword(data),
    onSuccess: () => {
      toast.success('Password reset successful!');
      navigate('/login');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Reset failed'),
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md"><CardContent className="pt-6 text-center">
          <p className="text-danger mb-4">Invalid reset link</p>
          <Link to="/forgot-password"><Button>Request New Link</Button></Link>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md glass">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
          <form onSubmit={(e) => { e.preventDefault(); reset.mutate({ token, password }); }} className="space-y-4">
            <Input type="password" placeholder="New password" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            <Button type="submit" className="w-full" disabled={reset.isPending}>
              {reset.isPending ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
