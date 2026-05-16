export const VALIDATION_RULES = {
  TOTAL_WEIGHTAGE: 100,
  MIN_WEIGHTAGE: 10,
  MAX_GOALS: 8,
  MAX_GOAL_TITLE_LEN: 100,
  MIN_GOAL_DESC_LEN: 10,
};

export const THRUST_AREAS = [
  { id: 'revenue', label: 'Revenue Growth', icon: '📈', color: '#FF6B47' },
  { id: 'tech', label: 'Technical Excellence', icon: '⚡', color: '#6366F1' },
  { id: 'quality', label: 'Quality Assurance', icon: '🛡️', color: '#10B981' },
  { id: 'people', label: 'People Development', icon: '👥', color: '#F59E0B' },
  { id: 'ops', label: 'Operational Excellence', icon: '⚙️', color: '#8B5CF6' },
  { id: 'cost', label: 'Cost Optimization', icon: '💰', color: '#EC4899' },
  { id: 'brand', label: 'Brand Building', icon: '🎯', color: '#14B8A6' },
  { id: 'innovation', label: 'Innovation & R&D', icon: '🚀', color: '#F97316' },
  { id: 'compliance', label: 'Compliance & Risk', icon: '📋', color: '#64748B' },
  { id: 'customer', label: 'Customer Success', icon: '❤️', color: '#EF4444' },
];

export const UOM_TYPES = [
  { value: 'MIN', label: 'Numeric (Higher is Better)', description: 'Sales, Revenue, Coverage %', icon: '📊' },
  { value: 'MAX', label: 'Numeric (Lower is Better)', description: 'Cost, TAT, Response Time', icon: '📉' },
  { value: 'TIMELINE', label: 'Timeline / Deadline', description: 'Complete by a specific date', icon: '📅' },
  { value: 'ZERO', label: 'Zero-Based', description: 'Zero defects, zero incidents', icon: '🎯' },
];

export const GOAL_STATUSES = {
  NOT_STARTED: { label: 'Not Started', class: 'badge-not-started' },
  ON_TRACK: { label: 'On Track', class: 'badge-on-track' },
  COMPLETED: { label: 'Completed', class: 'badge-completed' },
};

export const SHEET_STATUSES = {
  DRAFT: { label: 'Draft', class: 'badge-draft' },
  SUBMITTED: { label: 'Submitted', class: 'badge-submitted' },
  APPROVED: { label: 'Approved', class: 'badge-approved' },
  REWORK: { label: 'Needs Rework', class: 'badge-rework' },
};

export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

export const CYCLE_WINDOWS = {
  GOAL_SETTING: { label: 'Goal Setting Phase' },
  Q1: { label: 'Q1 Check-in (Jul–Sep)' },
  Q2: { label: 'Q2 Check-in (Oct–Dec)' },
  Q3: { label: 'Q3 Check-in (Jan–Mar)' },
  Q4: { label: 'Q4 / Annual Review' },
};
