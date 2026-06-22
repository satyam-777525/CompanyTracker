import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Building2, ArrowUpDown } from 'lucide-react';
import { companyAPI } from '@/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { debounce } from '@/lib/utils';
import { useMemo, useCallback } from 'react';

export default function CompaniesPage() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const debouncedSetSearch = useMemo(
    () => debounce((val) => setDebouncedSearch(val), 300),
    []
  );

  const handleSearch = useCallback((val) => {
    setSearch(val);
    debouncedSetSearch(val);
  }, [debouncedSetSearch]);

  const { data, isLoading } = useQuery({
    queryKey: ['companies', debouncedSearch, sort, isAuthenticated],
    queryFn: () => companyAPI.getAll({ search: debouncedSearch, sort, limit: 50 }).then((r) => r.data.data),
  });

  const companies = data?.companies || [];

  return (
    <AppLayout onSearch={handleSearch}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Companies</h1>
            <p className="text-muted text-sm">Browse company-wise interview questions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <Input className="pl-9 w-64" placeholder="Search companies..." value={search}
                onChange={(e) => handleSearch(e.target.value)} />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="h-10 rounded-lg border border-border bg-card px-3 text-sm">
              <option value="name">Name</option>
              <option value="questions">Questions</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : companies.length === 0 ? (
          <Card className="text-center py-16">
            <Building2 className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">No companies found</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companies.map((company, i) => (
              <motion.div key={company._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/companies/${company.slug}`}>
                  <Card className="hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} className="w-12 h-12 rounded-xl object-contain bg-white/5 p-1" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {company.name[0]}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{company.name}</h3>
                          <p className="text-xs text-muted">{company.totalQuestions} questions</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted">
                          <span>{company.solvedCount || 0} solved</span>
                          <span>{company.progressPercent || 0}%</span>
                        </div>
                        <ProgressBar value={company.progressPercent || 0} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
