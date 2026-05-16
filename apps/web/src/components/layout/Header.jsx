import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDate } from '../../lib/formulae';

const PAGE_TITLES = {
  '/employee': { title: 'Dashboard', desc: 'Your goal progress at a glance' },
  '/employee/goals': { title: 'My Goals', desc: 'Create and manage your performance goals' },
  '/employee/achievements': { title: 'Achievements', desc: 'Log your quarterly progress' },
  '/manager': { title: 'Team Overview', desc: 'Monitor your team\'s goal submissions' },
  '/manager/approvals': { title: 'Goal Approvals', desc: 'Review and approve team goals' },
  '/manager/checkins': { title: 'Check-ins', desc: 'Quarterly performance conversations' },
  '/admin': { title: 'Control Center', desc: 'Organization-wide goal intelligence' },
  '/admin/cycles': { title: 'Cycle Management', desc: 'Manage goal setting and review windows' },
  '/admin/users': { title: 'Org Hierarchy', desc: 'Manage employees, roles, and reporting lines' },
  '/admin/shared-goals': { title: 'Shared Goals', desc: 'Publish departmental KPIs' },
  '/admin/reports': { title: 'Reports', desc: 'Export achievement data' },
  '/admin/audit': { title: 'Audit Trail', desc: 'Track all system changes' },
  '/admin/analytics': { title: 'Analytics', desc: 'Performance trends and insights' },
};

export default function Header() {
  const location = useLocation();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef(null);

  const pathKey = Object.keys(PAGE_TITLES).find(key => location.pathname === key) ||
    Object.keys(PAGE_TITLES).find(key => location.pathname.startsWith(key));
  const pageInfo = PAGE_TITLES[pathKey] || { title: 'PulseGoals', desc: '' };

  // Build breadcrumb
  const segments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, idx) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + segments.slice(0, idx + 1).join('/'),
  }));

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header style={{
      padding: '1rem 2rem',
      borderBottom: '1px solid var(--color-border)',
      background: 'rgba(255,251,247,0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      <div>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          {breadcrumbs.map((bc, idx) => (
            <span key={bc.path} style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
              {idx > 0 && <span style={{ margin: '0 4px' }}>›</span>}
              <span style={{
                color: idx === breadcrumbs.length - 1 ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
                fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400,
              }}>
                {bc.label}
              </span>
            </span>
          ))}
        </div>
        {/* Page title */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.3 }}>
          {pageInfo.title}
        </h2>
        {pageInfo.desc && (
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
            {pageInfo.desc}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Notification Bell */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            id="notification-bell"
            style={{
              position: 'relative',
              background: showNotifs ? 'var(--color-bg-secondary)' : 'none',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              width: 40,
              height: 40,
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -4,
                background: 'var(--color-accent-1)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--color-bg-card)',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifs && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 48,
              width: 360,
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              animation: 'modalSlideUp 0.2s var(--spring-bounce)',
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="btn btn-ghost btn-sm" style={{ fontSize: '0.7rem' }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔔</div>
                    No notifications yet
                  </div>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      background: n.isRead ? 'transparent' : '#FFF8F5',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : '#FFF8F5'}
                  >
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                      {formatDate(n.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
