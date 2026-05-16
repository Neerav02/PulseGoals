import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = {
  EMPLOYEE: [
    { path: '/employee', label: 'Dashboard', icon: '🏠' },
    { path: '/employee/goals', label: 'My Goals', icon: '🎯' },
    { path: '/employee/achievements', label: 'Achievements', icon: '📊' },
  ],
  MANAGER: [
    { path: '/manager', label: 'Team Overview', icon: '👥' },
    { path: '/manager/approvals', label: 'Approvals', icon: '✅' },
    { path: '/manager/checkins', label: 'Check-ins', icon: '💬' },
    { divider: true, label: 'My Portal' },
    { path: '/employee', label: 'My Dashboard', icon: '🏠' },
    { path: '/employee/goals', label: 'My Goals', icon: '🎯' },
    { path: '/employee/achievements', label: 'My Achievements', icon: '📊' },
  ],
  ADMIN: [
    { path: '/admin', label: 'Control Center', icon: '🎛️' },
    { path: '/admin/cycles', label: 'Cycle Management', icon: '🔄' },
    { path: '/admin/users', label: 'Org Hierarchy', icon: '🏢' },
    { path: '/admin/shared-goals', label: 'Shared Goals', icon: '🤝' },
    { path: '/admin/reports', label: 'Reports', icon: '📋' },
    { path: '/admin/audit', label: 'Audit Trail', icon: '🔍' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { divider: true, label: 'My Portal' },
    { path: '/employee', label: 'My Dashboard', icon: '🏠' },
    { path: '/employee/goals', label: 'My Goals', icon: '🎯' },
  ],
};

const CYCLE_PHASES = [
  { phase: 'GOAL_SETTING', label: 'Goal Setting' },
  { phase: 'Q1', label: 'Q1 Review' },
  { phase: 'Q2', label: 'Q2 Review' },
  { phase: 'Q3', label: 'Q3 Review' },
  { phase: 'Q4', label: 'Annual Review' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navItems = NAV_ITEMS[user?.role] || NAV_ITEMS.EMPLOYEE;

  return (
    <aside className="paper-texture" style={{
      width: 260,
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRight: '1px solid rgba(231, 224, 216, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40,
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-md)',
          background: 'var(--gradient-progress)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          boxShadow: '0 4px 12px rgba(255,107,71,0.25)',
        }}>
          🫀
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.15rem',
            fontWeight: 700,
            background: 'var(--gradient-progress)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2,
          }}>
            PulseGoals
          </h1>
          <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', letterSpacing: '0.03em' }}>
            Goal Intelligence
          </p>
        </div>
      </div>

      {/* Pulse Indicator */}
      <div style={{
        padding: '12px 1.5rem',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ display: 'flex', gap: 2, alignItems: 'end', height: 16 }}>
            {[3, 8, 5, 12, 6, 10, 4, 9, 7].map((h, i) => (
              <div key={i} className="pulse-line" style={{
                width: 2,
                height: h,
                background: 'var(--color-accent-1)',
                borderRadius: 1,
                animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-accent-1)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            LIVE
          </span>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Organization pulse active</p>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.75rem',
      }}>
        {navItems.map((item, idx) => {
          if (item.divider) {
            return (
              <div key={idx} style={{
                padding: '12px 12px 6px',
                fontSize: '0.65rem',
                color: 'var(--color-text-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                borderTop: '1px solid var(--color-border)',
                marginTop: 8,
              }}>
                {item.label}
              </div>
            );
          }

          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-accent-1)' : 'var(--color-text-secondary)',
                background: isActive ? '#FFF3EC' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                marginBottom: 2,
              }}
              onMouseEnter={e => { if (!isActive) { e.target.style.background = 'var(--color-bg-secondary)'; e.target.style.color = 'var(--color-text-primary)'; }}}
              onMouseLeave={e => { if (!isActive) { e.target.style.background = 'transparent'; e.target.style.color = 'var(--color-text-secondary)'; }}}
            >
              <span style={{ fontSize: '1rem', width: 24, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Cycle Phase Timeline */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid var(--color-border)',
      }}>
        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Cycle Phase
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', paddingLeft: 12 }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute',
            left: 5,
            top: 4,
            bottom: 4,
            width: 2,
            background: 'var(--color-border)',
            borderRadius: 1,
          }} />
          {CYCLE_PHASES.map((cp, idx) => {
            const isCurrent = idx <= 1; // Goal Setting + Q1 are open per seed
            return (
              <div key={cp.phase} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '4px 0',
                position: 'relative',
              }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  border: `2px solid ${isCurrent ? 'var(--color-accent-1)' : 'var(--color-border)'}`,
                  background: isCurrent ? 'var(--color-accent-1)' : 'transparent',
                  position: 'relative',
                  zIndex: 1,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: '0.7rem',
                  color: isCurrent ? 'var(--color-accent-1)' : 'var(--color-text-muted)',
                  fontWeight: isCurrent ? 600 : 400,
                }}>
                  {cp.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Profile */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-bg-secondary)',
          border: '2px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--color-accent-1)',
          flexShrink: 0,
        }}>
          {user?.name?.split(' ').map(n => n[0]).join('') || '??'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name}
          </p>
          <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{user?.role}</p>
        </div>
        <button onClick={logout} title="Logout" style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          padding: 4,
          borderRadius: 'var(--radius-sm)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.target.style.background = 'var(--color-bg-secondary)'}
        onMouseLeave={e => e.target.style.background = 'none'}
        >
          🚪
        </button>
      </div>
    </aside>
  );
}
