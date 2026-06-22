import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Target, CheckCircle2, Circle, Bookmark, RotateCcw, Flame,
  TrendingUp, Award, FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { progressAPI } from '@/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';

const COLORS = ['#22C55E', '#F59E0B', '#EF4444'];

const statCards = [
  { key: 'totalQuestions', label: 'Total Questions', icon: Target, color: 'text-primary' },
  { key: 'solvedCount', label: 'Solved', icon: CheckCircle2, color: 'text-success' },
  { key: 'remaining', label: 'Remaining', icon: Circle, color: 'text-muted' },
  { key: 'bookmarkedCount', label: 'Bookmarked', icon: Bookmark, color: 'text-warning' },
  { key: 'revisionCount', label: 'Revision', icon: RotateCcw, color: 'text-danger' },
  { key: 'currentStreak', label: 'Streak', icon: Flame, color: 'text-warning', suffix: '🔥' },
];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => progressAPI.getDashboard().then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </AppLayout>
    );
  }

  const { stats, charts, insights } = data || {};

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted text-sm">Your interview preparation overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map(({ key, label, icon: Icon, color, suffix }, i) => (
            <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stats?.[key] || 0}{suffix || ''}</p>
                  <p className="text-xs text-muted mt-1">{label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Readiness & Completion */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Interview Readiness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#6366F1" strokeWidth="8"
                      strokeDasharray={`${(stats?.readinessScore || 0) * 2.51} 251`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">{stats?.readinessScore || 0}%</span>
                </div>
                <div className="flex-1">
                  <ProgressBar value={stats?.completionPercent || 0} showLabel />
                  <p className="text-sm text-muted mt-2">{stats?.notesCount || 0} notes saved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-success" /> Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights?.map((insight, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Badge variant={insight.type === 'success' ? 'success' : insight.type === 'warning' ? 'warning' : 'default'}>
                    {insight.type}
                  </Badge>
                  <p className="text-muted">{insight.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Solved by Difficulty</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={charts?.difficultyStats || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {(charts?.difficultyStats || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Weekly Progress</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={charts?.weeklyProgress || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Monthly Progress</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={charts?.monthlyProgress || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Company Wise Progress</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(charts?.companyProgress || []).map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{c.name}</span>
                    <span className="text-muted">{c.solved}/{c.total}</span>
                  </div>
                  <ProgressBar value={c.percent} />
                </div>
              ))}
              {(!charts?.companyProgress || charts.companyProgress.length === 0) && (
                <p className="text-sm text-muted text-center py-8">Start solving to see company progress</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
