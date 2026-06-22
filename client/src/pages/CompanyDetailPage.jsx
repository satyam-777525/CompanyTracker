import { useState, useMemo, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { companyAPI, questionAPI, progressAPI } from '@/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { getDifficultyColor, debounce } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function CompanyDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('questionNumber');
  const [updatingId, setUpdatingId] = useState(null);

  const debouncedSetSearch = useMemo(
    () => debounce((val) => setDebouncedSearch(val), 300),
    []
  );

  const handleSearchChange = useCallback((val) => {
    setSearch(val);
    debouncedSetSearch(val);
  }, [debouncedSetSearch]);

  const { data: company } = useQuery({
    queryKey: ['company', slug, isAuthenticated],
    queryFn: () => companyAPI.getBySlug(slug).then((r) => r.data.data),
  });

  const questionLimit = Math.max(company?.totalQuestions || 500, 500);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['questions', slug, difficulty, status, debouncedSearch, sort, isAuthenticated],
    queryFn: () => questionAPI.getByCompany(slug, {
      page: 1,
      limit: questionLimit,
      difficulty,
      status,
      search: debouncedSearch,
      sort,
    }).then((r) => r.data.data),
    enabled: !!slug && !!company,
  });

  const toggleSolved = useMutation({
    mutationFn: ({ questionId, isSolved }) =>
      progressAPI.update(questionId, { status: isSolved ? 'not_started' : 'solved' }),
    onMutate: ({ questionId }) => setUpdatingId(questionId),
    onSuccess: (_, { isSolved }) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(isSolved ? 'Marked as unsolved' : 'Marked as solved');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
    onSettled: () => setUpdatingId(null),
  });

  const questions = data?.questions || [];
  const totalCount = data?.pagination?.total ?? questions.length;

  const handleStatusClick = (e, question) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Sign in to track progress');
      return;
    }
    const isSolved = question.progress?.status === 'solved';
    toggleSolved.mutate({ questionId: question._id, isSolved });
  };

  const StatusBadge = ({ question }) => {
    const progress = question.progress || {};
    const isSolved = progress.status === 'solved';
    const isUpdating = updatingId === question._id;
    const variant = isSolved ? 'success' : 'secondary';
    const label = isSolved ? 'Solved' : 'Unsolved';

    if (!isAuthenticated) {
      if (progress.isRevision) return <Badge variant="warning">Revision</Badge>;
      if (progress.isBookmarked) return <Badge variant="default">Bookmarked</Badge>;
      return <Badge variant="secondary">Unsolved</Badge>;
    }

    return (
      <button
        type="button"
        onClick={(e) => handleStatusClick(e, question)}
        disabled={isUpdating}
        title={isSolved ? 'Click to mark unsolved' : 'Click to mark solved'}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full transition-all',
          'hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-wait',
          'focus:outline-none focus:ring-2 focus:ring-primary/50'
        )}
      >
        {isUpdating ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving
          </span>
        ) : (
          <Badge variant={variant} className="cursor-pointer hover:opacity-90">
            {label}
          </Badge>
        )}
        {!isUpdating && progress.isRevision && (
          <Badge variant="warning" className="pointer-events-none">Rev</Badge>
        )}
        {!isUpdating && progress.isBookmarked && (
          <Badge variant="default" className="pointer-events-none">★</Badge>
        )}
      </button>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {company && (
          <div className="flex items-center gap-4">
            {company.logo ? (
              <img src={company.logo} alt="" className="w-14 h-14 rounded-xl object-contain bg-white/5 p-1" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {company.name[0]}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <p className="text-muted text-sm">
                {company.totalQuestions} questions · {company.solvedCount || 0} solved
              </p>
              <ProgressBar value={company.progressPercent || 0} showLabel className="mt-2 max-w-xs" />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-9 px-3 rounded-lg bg-card border border-border text-sm flex-1 min-w-[200px]"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="h-9 px-3 rounded-lg bg-card border border-border text-sm"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 px-3 rounded-lg bg-card border border-border text-sm"
            disabled={!isAuthenticated && status !== ''}
          >
            <option value="">All Status</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
            <option value="revision">Revision</option>
            <option value="bookmarked">Bookmarked</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-9 px-3 rounded-lg bg-card border border-border text-sm"
          >
            <option value="questionNumber">Number</option>
            <option value="title">Title</option>
            <option value="difficulty">Difficulty</option>
            <option value="acceptance">Acceptance</option>
            <option value="frequency">Frequency</option>
          </select>
        </div>

        {/* Full question list — scroll naturally like LeetCode */}
        {isLoading ? (
          <SkeletonTable rows={12} />
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-14 z-10 bg-card border-b border-border shadow-sm">
                  <tr>
                    <th className="text-left p-3 font-medium text-muted w-16">#</th>
                    <th className="text-left p-3 font-medium text-muted">Question</th>
                    <th className="text-left p-3 font-medium text-muted hidden sm:table-cell w-28">Difficulty</th>
                    <th className="text-left p-3 font-medium text-muted hidden md:table-cell w-28">Acceptance</th>
                    <th className="text-left p-3 font-medium text-muted hidden lg:table-cell w-28">Frequency</th>
                    <th className="text-left p-3 font-medium text-muted w-36">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr
                      key={q._id}
                      className="border-b border-border/50 hover:bg-primary/5 transition-colors"
                    >
                      <td className="p-3 text-muted tabular-nums">{q.questionNumber}</td>
                      <td className="p-3">
                        <Link
                          to={`/questions/${q._id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {q.title}
                        </Link>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs border', getDifficultyColor(q.difficulty))}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-3 text-muted hidden md:table-cell tabular-nums">
                        {q.acceptanceRate?.toFixed(1)}%
                      </td>
                      <td className="p-3 text-muted hidden lg:table-cell tabular-nums">
                        {q.frequencyRate?.toFixed(1)}%
                      </td>
                      <td className="p-3">
                        <StatusBadge question={q} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {questions.length === 0 && (
              <p className="text-center text-muted py-12">
                {status && !isAuthenticated
                  ? 'Sign in to filter by solved, bookmarked, or revision status'
                  : 'No questions found'}
              </p>
            )}

            {questions.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card/50 text-xs text-muted">
                <span>
                  Showing {questions.length} of {totalCount} questions
                </span>
                {isFetching && !isLoading && (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Updating...
                  </span>
                )}
                {isAuthenticated && (
                  <span>Click status to mark solved / unsolved</span>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
