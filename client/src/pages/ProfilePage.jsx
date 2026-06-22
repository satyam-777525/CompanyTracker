import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { User, Flame, Calendar, Download, Share2 } from 'lucide-react';
import { authAPI, progressAPI } from '@/api';
import { updateUser } from '@/store/authSlice';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => progressAPI.getDashboard().then((r) => r.data.data),
  });

  const updateProfile = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (res) => {
      dispatch(updateUser(res.data.data));
      toast.success('Profile updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const handleExport = async () => {
    try {
      const res = await progressAPI.export();
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'companytracker-progress.json';
      a.click();
      toast.success('Progress exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const stats = dashboard?.stats;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Profile</h1>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <img src={form.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt="" className="w-20 h-20 rounded-full border-2 border-primary/30" />
              <div>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-muted text-sm">{user?.email}</p>
                <p className="text-xs text-muted flex items-center gap-1 mt-1">
                  <Flame className="w-3 h-3 text-warning" /> {stats?.currentStreak || 0} day streak · Best: {stats?.bestStreak || 0}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 rounded-lg bg-background">
                <p className="text-xl font-bold text-success">{stats?.solvedCount || 0}</p>
                <p className="text-xs text-muted">Solved</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background">
                <p className="text-xl font-bold text-warning">{stats?.bookmarkedCount || 0}</p>
                <p className="text-xs text-muted">Bookmarks</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background">
                <p className="text-xl font-bold text-primary">{stats?.revisionCount || 0}</p>
                <p className="text-xs text-muted">Revision</p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate(form); }} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Avatar URL</label>
                <Input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
              </div>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleExport}>
              <Download className="w-4 h-4" /> Export Progress
            </Button>
            <Button variant="secondary" onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/profile/${user?.id}`);
              toast.success('Profile link copied');
            }}>
              <Share2 className="w-4 h-4" /> Share Progress
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
