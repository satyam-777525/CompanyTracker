import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  CheckCircle2, Bookmark, RotateCcw, ExternalLink, ArrowLeft,
  FileText, Building2
} from 'lucide-react';
import { questionAPI, progressAPI, noteAPI } from '@/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { getDifficultyColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/utils';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [noteContent, setNoteContent] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const { data: question, isLoading } = useQuery({
    queryKey: ['question', id],
    queryFn: () => questionAPI.getById(id).then((r) => r.data.data),
  });

  const { data: note } = useQuery({
    queryKey: ['note', id],
    queryFn: () => noteAPI.get(id).then((r) => r.data.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (note?.content !== undefined) setNoteContent(note.content);
  }, [note]);

  const updateProgress = useMutation({
    mutationFn: (data) => progressAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
      toast.success('Progress updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const saveNote = useMutation({
    mutationFn: (content) => noteAPI.upsert(id, content),
    onSuccess: () => {
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    },
  });

  const debouncedSave = useCallback(
    debounce((content) => saveNote.mutate(content), 1000),
    [id]
  );

  const handleNoteChange = (content) => {
    setNoteContent(content);
    debouncedSave(content);
  };

  if (isLoading) {
    return <AppLayout><SkeletonCard /></AppLayout>;
  }

  if (!question) {
    return <AppLayout><p className="text-center text-muted py-20">Question not found</p></AppLayout>;
  }

  const progress = question.progress || {};
  const isSolved = progress.status === 'solved';

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to={`/companies/${question.company?.slug}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to {question.company?.name}
        </Link>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted mb-1">#{question.questionNumber}</p>
                    <h1 className="text-2xl font-bold">{question.title}</h1>
                  </div>
                  <span className={cn('px-3 py-1 rounded-full text-sm border shrink-0', getDifficultyColor(question.difficulty))}>
                    {question.difficulty}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted mb-4">
                  <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {question.company?.name}</span>
                  <span>Acceptance: {question.acceptanceRate?.toFixed(1)}%</span>
                  <span>Frequency: {question.frequencyRate?.toFixed(1)}%</span>
                </div>

                {question.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {question.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={isSolved ? 'success' : 'default'}
                    onClick={() => updateProgress.mutate({ status: isSolved ? 'not_started' : 'solved' })}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isSolved ? 'Mark Unsolved' : 'Mark Solved'}
                  </Button>
                  <Button
                    variant={progress.isBookmarked ? 'warning' : 'secondary'}
                    onClick={() => updateProgress.mutate({ isBookmarked: !progress.isBookmarked })}
                  >
                    <Bookmark className="w-4 h-4" />
                    {progress.isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Button>
                  <Button
                    variant={progress.isRevision ? 'warning' : 'secondary'}
                    onClick={() => updateProgress.mutate({ isRevision: !progress.isRevision, status: progress.isRevision ? progress.status : 'revision' })}
                  >
                    <RotateCcw className="w-4 h-4" />
                    {progress.isRevision ? 'In Revision' : 'Add to Revision'}
                  </Button>
                  <a href={question.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <ExternalLink className="w-4 h-4" /> Open on LeetCode
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Personal Notes
                  {noteSaved && <span className="text-xs text-success font-normal">Saved</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={noteContent}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="Write your approach, key insights, time complexity..."
                  className="w-full h-48 rounded-lg border border-border bg-background p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted mt-2">Auto-saves as you type. Notes are private.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
