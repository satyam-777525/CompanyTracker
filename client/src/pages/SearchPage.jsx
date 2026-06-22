import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { questionAPI } from '@/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getDifficultyColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/utils';
import { useMemo, useCallback } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const navigate = useNavigate();

  const debouncedSet = useMemo(() => debounce((val) => setDebouncedQuery(val), 300), []);

  const handleSearch = useCallback((val) => {
    setQuery(val);
    debouncedSet(val);
  }, [debouncedSet]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => questionAPI.search({ q: debouncedQuery, limit: 30 }).then((r) => r.data.data),
    enabled: debouncedQuery.length >= 2,
  });

  const questions = data?.questions || [];

  return (
    <AppLayout onSearch={handleSearch}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Search questions, companies, tags..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-card border border-border text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
          />
        </div>

        {debouncedQuery.length < 2 ? (
          <p className="text-center text-muted py-12">Type at least 2 characters to search</p>
        ) : isLoading ? (
          <p className="text-center text-muted py-12">Searching...</p>
        ) : questions.length === 0 ? (
          <p className="text-center text-muted py-12">No results found for "{debouncedQuery}"</p>
        ) : (
          <Card className="divide-y divide-border p-0 overflow-hidden">
            {questions.map((q) => (
              <Link key={q._id} to={`/questions/${q._id}`}
                className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors">
                <div>
                  <p className="font-medium">{q.title}</p>
                  <p className="text-xs text-muted">{q.company?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs border', getDifficultyColor(q.difficulty))}>
                    {q.difficulty}
                  </span>
                  {q.progress?.status === 'solved' && <Badge variant="success">Solved</Badge>}
                </div>
              </Link>
            ))}
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
