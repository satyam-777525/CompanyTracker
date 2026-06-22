import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Users, Building2, FileQuestion, Activity, Upload, Plus, Trash2, Pencil
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { adminAPI, companyAPI, questionAPI } from '@/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyForm, setCompanyForm] = useState({ name: '', description: '', logo: '' });
  const [csvFile, setCsvFile] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [importResult, setImportResult] = useState(null);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then((r) => r.data.data),
  });

  const { data: companiesData } = useQuery({
    queryKey: ['companies-admin'],
    queryFn: () => companyAPI.getAll({ limit: 50 }).then((r) => r.data.data),
  });

  const createCompany = useMutation({
    mutationFn: (data) => companyAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies-admin']);
      queryClient.invalidateQueries(['admin-dashboard']);
      setShowCompanyForm(false);
      setCompanyForm({ name: '', description: '', logo: '' });
      toast.success('Company created');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteCompany = useMutation({
    mutationFn: (id) => companyAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies-admin']);
      toast.success('Company deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const importCSV = useMutation({
    mutationFn: (formData) => adminAPI.importCSV(formData),
    onSuccess: (res) => {
      setImportResult(res.data.data);
      queryClient.invalidateQueries(['companies-admin']);
      queryClient.invalidateQueries(['admin-dashboard']);
      toast.success(`Imported ${res.data.data.imported} questions`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Import failed'),
  });

  const handleCSVUpload = () => {
    if (!csvFile) return toast.error('Select a CSV file');
    const formData = new FormData();
    formData.append('file', csvFile);
    if (selectedCompany) formData.append('companyId', selectedCompany);
    importCSV.mutate(formData);
  };

  if (isLoading) {
    return <AppLayout><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
    </div></AppLayout>;
  }

  const { stats, charts, mostActiveUsers } = dashboard || {};
  const companies = companiesData?.companies || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-primary' },
            { label: 'Total Questions', value: stats?.totalQuestions, icon: FileQuestion, color: 'text-success' },
            { label: 'Total Companies', value: stats?.totalCompanies, icon: Building2, color: 'text-warning' },
            { label: 'Daily Active', value: stats?.dailyActiveUsers, icon: Activity, color: 'text-danger' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-4">
                <Icon className={`w-5 h-5 ${color} mb-2`} />
                <p className="text-2xl font-bold">{value || 0}</p>
                <p className="text-xs text-muted">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={charts?.userGrowth || []}>
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
            <CardHeader><CardTitle>Most Active Users</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(mostActiveUsers || []).slice(0, 5).map((u, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{u.name}</span>
                  <Badge variant="success">{u.solved} solved</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* CSV Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> CSV Import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted">Format: ID,URL,Title,Difficulty,Acceptance %,Frequency %</p>
            <div className="flex flex-wrap gap-3">
              <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}
                className="h-10 px-3 rounded-lg bg-card border border-border text-sm">
                <option value="">Auto-detect from filename</option>
                {companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <Input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="max-w-xs" />
              <Button onClick={handleCSVUpload} disabled={importCSV.isPending}>
                {importCSV.isPending ? 'Importing...' : 'Upload CSV'}
              </Button>
            </div>
            {importResult && (
              <div className="p-4 rounded-lg bg-background text-sm space-y-1">
                <p>Total: {importResult.total} | Imported: {importResult.imported} | Skipped: {importResult.skipped}</p>
                {importResult.company && <p>Company: {importResult.company.name}</p>}
                {importResult.errors?.length > 0 && (
                  <p className="text-danger">{importResult.errors.length} errors</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Company Management</CardTitle>
            <Button size="sm" onClick={() => setShowCompanyForm(!showCompanyForm)}>
              <Plus className="w-4 h-4" /> Add Company
            </Button>
          </CardHeader>
          <CardContent>
            {showCompanyForm && (
              <form onSubmit={(e) => { e.preventDefault(); createCompany.mutate(companyForm); }}
                className="grid sm:grid-cols-3 gap-3 mb-4 p-4 rounded-lg bg-background">
                <Input placeholder="Company name" value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} required />
                <Input placeholder="Logo URL" value={companyForm.logo}
                  onChange={(e) => setCompanyForm({ ...companyForm, logo: e.target.value })} />
                <Input placeholder="Description" value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })} />
                <Button type="submit" className="sm:col-span-3" disabled={createCompany.isPending}>Create</Button>
              </form>
            )}
            <div className="space-y-2">
              {companies.map((c) => (
                <div key={c._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-background">
                  <div className="flex items-center gap-3">
                    {c.logo ? <img src={c.logo} alt="" className="w-8 h-8 rounded" /> : (
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{c.name[0]}</div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted">{c.totalQuestions} questions</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    if (confirm('Delete this company and all its questions?')) deleteCompany.mutate(c._id);
                  }}>
                    <Trash2 className="w-4 h-4 text-danger" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
