import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Flame, Medal } from 'lucide-react';
import { adminAPI } from '@/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { SkeletonTable } from '@/components/ui/Skeleton';

const periods = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'alltime', label: 'All Time' },
];

const rankIcons = [Medal, Medal, Medal];
const rankColors = ['text-warning', 'text-muted', 'text-orange-400'];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState('alltime');

  const { data: leaders, isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => adminAPI.getLeaderboard(period).then((r) => r.data.data),
  });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center">
          <Trophy className="w-10 h-10 text-warning mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-muted text-sm">Top performers in the community</p>
        </div>

        <div className="flex justify-center gap-2">
          {periods.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.value ? 'bg-primary text-white' : 'bg-card text-muted hover:text-foreground border border-border'
              }`}>
              {p.label}
            </button>
          ))}
        </div>

        {isLoading ? <SkeletonTable rows={10} /> : (
          <Card className="overflow-hidden p-0">
            <div className="divide-y divide-border">
              {(leaders || []).map((user, i) => {
                const RankIcon = rankIcons[i];
                return (
                  <motion.div key={user._id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 hover:bg-primary/5 transition-colors">
                    <span className={`w-8 text-center font-bold ${i < 3 ? rankColors[i] : 'text-muted'}`}>
                      {RankIcon && i < 3 ? <RankIcon className="w-5 h-5 mx-auto" /> : i + 1}
                    </span>
                    <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt="" className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted flex items-center gap-1">
                        <Flame className="w-3 h-3 text-warning" /> {user.currentStreak || 0} day streak
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{user.solved || 0}</p>
                      <p className="text-xs text-muted">solved</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {(!leaders || leaders.length === 0) && (
              <p className="text-center text-muted py-12">No data yet. Start solving to appear on the leaderboard!</p>
            )}
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
