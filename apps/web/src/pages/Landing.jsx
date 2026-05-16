import { Link } from 'react-router-dom';
import { HeartPulse, User, Briefcase, Shield, ArrowRight, Activity, Sparkles, CheckCircle, Globe, MessageCircle, Mail } from 'lucide-react';

export default function Landing() {
  return (
    <div className="landing-page animated-bg" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Orbs & 3D Grid Floor */}
      <div style={{ position: 'absolute', inset: 0, perspective: '1000px', zIndex: 0 }}>
        <div className="grid-floor-3d" />
      </div>
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255,107,71,0.12) 0%, rgba(255,107,71,0) 70%)', borderRadius: '50%', zIndex: 0, animation: 'pulseBeat 8s infinite alternate' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0) 70%)', borderRadius: '50%', zIndex: 0, animation: 'pulseBeat 10s infinite alternate-reverse' }} />

      {/* Header */}
      <header className="landing-header" style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'var(--gradient-progress)', width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 15px rgba(255,107,71,0.4)' }}>
            <HeartPulse size={24} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)' }}>
            Pulse<span style={{ color: 'var(--color-accent-1)' }}>Goals</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/login" className="btn btn-ghost" style={{ fontWeight: 600 }}>Sign In</Link>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-full)' }}>
            Get Started <ArrowRight size={18} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-main" style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto' }}>
        <div className="hero-grid">
          
          <div className="fade-in-up hero-text" style={{ animationDuration: '1s' }}>
            <span className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: 'var(--gradient-card-hover)', color: 'var(--color-accent-1)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1.5rem', border: '1px solid rgba(255,107,71,0.2)' }}>
              <Activity size={16} /> INTELLIGENT PERFORMANCE MANAGEMENT
            </span>
            <h1 className="hero-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1.1, color: 'var(--color-text-primary)', marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>
              Align Teams. <br/>
              <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Accelerate Growth.</span>
            </h1>
            <p className="hero-desc" style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', maxWidth: 500, lineHeight: 1.6, marginBottom: '2rem' }}>
              The modern goal-setting portal that brings clarity to your organization's priorities, backed by real-time analytics and AI-powered feedback.
            </p>
            <div className="hero-actions" style={{ display: 'flex', gap: 16 }}>
              <Link to="/signup" className="btn btn-primary btn-lg" style={{ borderRadius: 'var(--radius-full)' }}>
                Start Free Trial <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
            <img 
              src="/3d_dashboard_hero.png" 
              alt="3D Dashboard Illustration" 
              className="float-3d" 
              style={{ width: '100%', maxWidth: 650, display: 'block', margin: '0 auto' }}
            />
          </div>

        </div>

        {/* Features Section */}
        <section style={{ marginBottom: '8rem', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="fade-in-up" style={{ animationDelay: '0.2s', fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--color-text-primary)' }}>
              Everything you need to <span style={{ color: 'var(--color-accent-1)' }}>scale</span>
            </h2>
            <p className="fade-in-up" style={{ animationDelay: '0.3s', color: 'var(--color-text-secondary)', maxWidth: 600, margin: '1rem auto 0', fontSize: '1.1rem' }}>
              PulseGoals connects the daily work of your employees to the long-term vision of your company.
            </p>
          </div>
          
          <div className="hero-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '0' }}>
            <div className="card fade-in-up hover-glow" style={{ animationDelay: '0.4s', padding: '2.5rem', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(255,107,71,0.1)', color: 'var(--color-accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>AI-Powered Feedback</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Get instant, intelligent feedback on your goals to ensure they are actionable, measurable, and aligned with company strategy.</p>
            </div>
            
            <div className="card fade-in-up hover-glow" style={{ animationDelay: '0.5s', padding: '2.5rem', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(99,102,241,0.1)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Activity size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Real-Time Alignment</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Shared goals automatically cascade across teams. When a manager updates a shared objective, every linked employee sheet stays in sync.</p>
            </div>
            
            <div className="card fade-in-up hover-glow" style={{ animationDelay: '0.6s', padding: '2.5rem', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <CheckCircle size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Smart Check-ins</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Streamline the quarterly review process with dedicated manager dashboards, visual progress tracking, and 1-click approvals.</p>
            </div>
          </div>
        </section>

        {/* Portal Selection */}
        <div style={{ textAlign: 'center' }}>
          <h3 className="fade-in-up" style={{ animationDelay: '0.3s', fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--color-text-primary)', marginBottom: '2.5rem' }}>
            Select Your Workspace Portal
          </h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: 1000, margin: '0 auto' }}>
          
          <Link to="/login/employee" className="card hover-glow fade-in-up" style={{ animationDelay: '0.3s', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3.5rem 2rem', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,107,71,0.1)', color: 'var(--color-accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <User size={36} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Employee Portal</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>Set your goals, get AI feedback, and track your quarterly achievements.</p>
          </Link>

          <Link to="/login/manager" className="card hover-glow fade-in-up" style={{ animationDelay: '0.4s', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3.5rem 2rem', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Briefcase size={36} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Manager Portal</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>Review team goals, conduct check-ins, and align your team to success.</p>
          </Link>

          <Link to="/login/admin" className="card hover-glow fade-in-up" style={{ animationDelay: '0.5s', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3.5rem 2rem', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Shield size={36} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Admin Portal</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>Manage organizational cycles, analyze completion heatmaps, and oversee compliance.</p>
          </Link>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(0,0,0,0.05)', padding: '4rem 2rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem' }}>
          
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <div style={{ background: 'var(--gradient-progress)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <HeartPulse size={18} strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                PulseGoals
              </span>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', maxWidth: 300, marginBottom: '1.5rem' }}>
              The modern goal-setting portal that brings clarity to your organization's priorities.
            </p>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-muted)' }}>
              <Globe size={20} style={{ cursor: 'pointer' }} className="hover-glow" />
              <MessageCircle size={20} style={{ cursor: 'pointer' }} className="hover-glow" />
              <Mail size={20} style={{ cursor: 'pointer' }} className="hover-glow" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                <li style={{ cursor: 'pointer' }}>Features</li>
                <li style={{ cursor: 'pointer' }}>Integrations</li>
                <li style={{ cursor: 'pointer' }}>Pricing</li>
                <li style={{ cursor: 'pointer' }}>Changelog</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                <li style={{ cursor: 'pointer' }}>About Us</li>
                <li style={{ cursor: 'pointer' }}>Careers</li>
                <li style={{ cursor: 'pointer' }}>Privacy Policy</li>
                <li style={{ cursor: 'pointer' }}>Terms of Service</li>
              </ul>
            </div>
          </div>
          
        </div>
        <div style={{ maxWidth: 1200, margin: '4rem auto 0', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} PulseGoals Inc. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
