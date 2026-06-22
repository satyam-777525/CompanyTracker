import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  Target, BarChart3, Bookmark, RotateCcw, Flame, Building2,
  ChevronRight, Star, ArrowRight, CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/api';

const features = [
  { icon: Building2, title: 'Company-Wise Questions', desc: 'Curated LeetCode questions organized by top tech companies.' },
  { icon: Target, title: 'Progress Tracking', desc: 'Track solved, bookmarked, and revision questions with detailed analytics.' },
  { icon: BarChart3, title: 'Interview Readiness', desc: 'Measure your preparation with readiness scores and company-wise progress.' },
  { icon: Bookmark, title: 'Smart Bookmarks', desc: 'Save important questions and access them from a dedicated page.' },
  { icon: RotateCcw, title: 'Revision System', desc: 'Mark questions for revision and revisit them before interviews.' },
  { icon: Flame, title: 'Daily Streaks', desc: 'Build consistency with daily streak tracking and motivational insights.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'SDE @ Amazon', text: 'CompanyTracker helped me systematically prepare for Amazon interviews. The company-wise organization is brilliant!', avatar: 'sarah' },
  { name: 'Raj Patel', role: 'SWE @ Google', text: 'The revision system and progress analytics gave me confidence going into my Google onsite.', avatar: 'raj' },
  { name: 'Emily Wong', role: 'Engineer @ Meta', text: 'Best interview prep tool I\'ve used. The streak feature kept me motivated every single day.', avatar: 'emily' },
];

const faqs = [
  { q: 'What is CompanyTracker?', a: 'CompanyTracker is a premium interview preparation platform where you can browse company-wise LeetCode questions, track progress, and measure interview readiness.' },
  { q: 'Is it free to use?', a: 'Yes! CompanyTracker is free to use with all core features including progress tracking, bookmarks, and revision lists.' },
  { q: 'How does the streak system work?', a: 'Solve at least one question per day to maintain your streak. Your current and best streaks are tracked on your dashboard.' },
  { q: 'Can I import my own question lists?', a: 'Admins can upload CSV files with company-specific questions. Contact your admin for custom imports.' },
];

const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5 },
};

export default function LandingPage() {
  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => adminAPI.getStats().then((r) => r.data.data),
  });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">CT</div>
            <span className="font-bold text-lg text-foreground">CompanyTracker</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#companies" className="hover:text-foreground transition-colors">Companies</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/register"><Button size="sm" className="shadow-md shadow-primary/20">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 md:pt-44 md:pb-32 px-4">
        <div className="hero-glow" aria-hidden="true" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
            <Star className="w-4 h-4" /> Interview Preparation OS
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.15]">
            <span className="block text-foreground">Crack Coding Interviews</span>
            <span className="gradient-text mt-3 sm:mt-4">Company by Company</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Track progress, solve curated questions, manage revisions, and stay interview-ready with CompanyTracker.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto shadow-md shadow-primary/20">
                Start Tracking <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/companies" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Explore Companies
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="max-w-5xl mx-auto px-4 py-14 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: 'Questions', value: stats?.questions || '120+' },
              { label: 'Companies', value: stats?.companies || '8+' },
              { label: 'Users', value: stats?.users || '500+' },
              { label: 'Problems Solved', value: stats?.solved || '10K+' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold gradient-text">{s.value}</p>
                <p className="text-sm text-muted mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-section scroll-mt-20">
        <div className="landing-container">
          <motion.div className="text-center mb-14 md:mb-16" {...fadeIn}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">Everything You Need to Succeed</h2>
            <p className="text-muted max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
              A complete interview preparation operating system built for serious candidates.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass rounded-xl p-6 md:p-7 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="landing-section pt-0">
        <div className="landing-container max-w-5xl">
          <motion.div {...fadeIn}>
            <div className="glass rounded-2xl p-1">
              <div className="rounded-xl bg-card p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-danger" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="ml-2 text-xs text-muted">Dashboard Preview</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {['Total: 120', 'Solved: 45', 'Streak: 7🔥', 'Ready: 72%'].map((s) => (
                    <div key={s} className="bg-background rounded-lg p-4 text-center">
                      <p className="text-sm font-medium text-foreground">{s}</p>
                    </div>
                  ))}
                </div>
                <div className="h-32 bg-background rounded-lg flex items-end justify-around gap-2 px-4 pb-4">
                  {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 max-w-8 bg-primary/60 rounded-t transition-all"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Companies Preview */}
      <section id="companies" className="landing-section border-t border-border/50 scroll-mt-20">
        <div className="landing-container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">Top Companies Covered</h2>
          <p className="text-muted mb-12 max-w-lg mx-auto leading-relaxed">
            Practice with curated questions from the world&apos;s leading tech companies.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
            {['Amazon', 'Google', 'Microsoft', 'Meta', 'Netflix', 'Adobe', 'Uber', 'Atlassian'].map((name) => (
              <div
                key={name}
                className="glass rounded-xl p-6 hover:border-primary/30 transition-all hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-3 flex items-center justify-center text-primary font-bold text-lg">
                  {name[0]}
                </div>
                <p className="font-medium text-sm text-foreground">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-section">
        <div className="landing-container">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Loved by Engineers</h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="glass rounded-xl p-6 md:p-7">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-sm text-muted mb-6 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.avatar}`}
                    alt=""
                    className="w-9 h-9 rounded-full bg-card"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="landing-section border-t border-border/50 scroll-mt-20">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="glass rounded-xl group">
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer font-medium text-foreground list-none">
                  <span>{f.q}</span>
                  <ChevronRight className="w-4 h-4 text-muted shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="px-5 pb-5 text-sm text-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-section">
        <div className="max-w-3xl mx-auto px-4 text-center glass rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Ready to Ace Your Interviews?</h2>
          <p className="text-muted mb-8 leading-relaxed">Join thousands of engineers preparing smarter, not harder.</p>
          <Link to="/register">
            <Button size="lg" className="shadow-md shadow-primary/20">
              Start Tracking Free <CheckCircle2 className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">CT</div>
            <span className="font-semibold text-foreground">CompanyTracker</span>
          </div>
          <p className="text-sm text-muted text-center">
            © 2026 CompanyTracker. Master Company-Wise Coding Interview Questions.
          </p>
        </div>
      </footer>
    </div>
  );
}
