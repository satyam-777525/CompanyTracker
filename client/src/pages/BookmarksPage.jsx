import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bookmark } from 'lucide-react';
import { progressAPI } from '@/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { getDifficultyColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function BookmarksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => progressAPI.getBookmarks({ limit: 50 }).then((r) => r.data.data),
  });

  const bookmarks = data?.bookmarks || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-warning" /> Bookmarks
          </h1>
          <p className="text-muted text-sm">Your saved important questions</p>
        </div>

        {isLoading ? <SkeletonTable /> : bookmarks.length === 0 ? (
          <Card className="text-center py-16">
            <Bookmark className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted mb-2">No bookmarks yet</p>
            <p className="text-sm text-muted">Bookmark questions from the question detail page</p>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-card border-b border-border">
                  <tr>
                    <th className="text-left p-3 font-medium text-muted">Question</th>
                    <th className="text-left p-3 font-medium text-muted">Company</th>
                    <th className="text-left p-3 font-medium text-muted">Difficulty</th>
                    <th className="text-left p-3 font-medium text-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookmarks.map((q) => (
                    <tr key={q._id} className="border-b border-border/50 hover:bg-primary/5">
                      <td className="p-3">
                        <Link to={`/questions/${q._id}`} className="font-medium hover:text-primary">{q.title}</Link>
                      </td>
                      <td className="p-3 text-muted">{q.company?.name}</td>
                      <td className="p-3">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs border', getDifficultyColor(q.difficulty))}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={q.progress?.status === 'solved' ? 'success' : 'secondary'}>
                          {q.progress?.status === 'solved' ? 'Solved' : 'Unsolved'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
