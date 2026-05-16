import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import { SHEET_STATUSES } from '../../lib/constants';
import { getInitials } from '../../lib/formulae';

export default function TeamDashboard() {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => { loadTeam(); }, []);

  const loadTeam = async () => {
    try { setTeam(await api.getTeam(user.id)); } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = team.filter(m => {
    if (filter && !m.name.toLowerCase().includes(filter.toLowerCase())) return false;
    if (statusFilter !== 'ALL') {
      const st = m.goalSheets?.[0]?.status || 'NONE';
      if (statusFilter === 'NONE' && st !== 'NONE') return false;
      if (statusFilter !== 'NONE' && st !== statusFilter) return false;
    }
    return true;
  });

  const pending = team.filter(m => m.goalSheets?.[0]?.status === 'SUBMITTED').length;

  if (loading) return <div className="page-enter">{[1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:100,marginBottom:12}}/>)}</div>;

  return (
    <div className="page-enter">
      {pending > 0 && (
        <div className="card-static" style={{marginBottom:20,background:'#FFF3EC',borderLeft:'4px solid var(--color-accent-1)'}}>
          <p style={{fontWeight:600,color:'var(--color-accent-1)'}}>📋 {pending} goal sheet(s) pending your review</p>
        </div>
      )}

      <div style={{display:'flex',gap:12,marginBottom:20}}>
        <input className="input" placeholder="Search team member..." value={filter} onChange={e=>setFilter(e.target.value)} style={{maxWidth:300}}/>
        <select className="input" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{maxWidth:180}}>
          <option value="ALL">All Statuses</option>
          <option value="SUBMITTED">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="DRAFT">Draft</option>
          <option value="REWORK">Rework</option>
          <option value="NONE">Not Submitted</option>
        </select>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
        {filtered.map(member => {
          const sheet = member.goalSheets?.[0];
          const status = sheet?.status || 'NONE';
          const statusInfo = SHEET_STATUSES[status] || { label: 'Not Submitted', class: 'badge-draft' };
          return (
            <div key={member.id} className="card">
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <div style={{width:44,height:44,borderRadius:'var(--radius-full)',background:'var(--color-bg-secondary)',border:'2px solid var(--color-border)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.85rem',color:'var(--color-accent-1)'}}>
                  {getInitials(member.name)}
                </div>
                <div>
                  <h4 style={{fontWeight:600,fontSize:'0.9rem'}}>{member.name}</h4>
                  <p style={{fontSize:'0.7rem',color:'var(--color-text-muted)'}}>{member.designation} · {member.department}</p>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>
                {status === 'SUBMITTED' && (
                  <Link to={`/manager/approvals/${member.id}`} className="btn btn-primary btn-sm">Review</Link>
                )}
                {status === 'APPROVED' && (
                  <Link to={`/manager/checkins`} className="btn btn-outline btn-sm">Check-in</Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card-static" style={{textAlign:'center',padding:'2rem'}}>
          <p style={{color:'var(--color-text-muted)'}}>No team members match your filters.</p>
        </div>
      )}
    </div>
  );
}
