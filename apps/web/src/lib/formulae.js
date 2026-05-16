/**
 * Client-side progress score computation — mirrors backend exactly
 */
export function computeProgressScore(uomType, target, achievement) {
  switch (uomType) {
    case 'MIN': {
      const t = parseFloat(target);
      const a = parseFloat(achievement);
      if (!t || isNaN(a)) return 0;
      return Math.min((a / t) * 100, 100);
    }
    case 'MAX': {
      const t = parseFloat(target);
      const a = parseFloat(achievement);
      if (isNaN(a)) return 0;
      if (a === 0) return 100;
      return Math.min((t / a) * 100, 100);
    }
    case 'TIMELINE': {
      const deadline = new Date(target);
      const completionDate = new Date(achievement);
      if (!achievement || isNaN(completionDate.getTime())) return 0;
      if (completionDate <= deadline) return 100;
      const daysLate = (completionDate - deadline) / (1000 * 60 * 60 * 24);
      return Math.max(0, 100 - daysLate * 10);
    }
    case 'ZERO': {
      const a = parseFloat(achievement);
      return a === 0 ? 100 : 0;
    }
    default:
      return 0;
  }
}

export function getScoreColor(score) {
  if (score >= 80) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

export function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}

export function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
}
