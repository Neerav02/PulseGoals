import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import { getGreeting, getScoreColor } from '../../lib/formulae';
import { SHEET_STATUSES, GOAL_STATUSES } from '../../lib/constants';


export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setSheet(await api.getGoalSheet()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const totalW = sheet?.goals?.reduce((s, g) => s + g.weightage, 0) || 0;
  const goalCount = sheet?.goals?.length || 0;
  const overallScore = sheet?.goals?.reduce((acc, g) => {
    const a = g.achievements?.[g.achievements.length - 1];
    return a?.progressScore != null ? acc + (a.progressScore * g.weightage / 100) : acc;
  }, 0) || 0;

  const now = new Date();
  const qEnd = new Date(now.getFullYear(), Math.ceil((now.getMonth() + 1) / 3) * 3, 0);
  const daysLeft = Math.ceil((qEnd - now) / 86400000);

  if (loading) return <div className="page-enter">{[1,2,3].map(i=><div key={i} className="skeleton" style={{height:160,marginBottom:16}}/>)}</div>;

  return (
    <div className="page-enter">
      <div className="card-static" style={{marginBottom:24,background:'var(--gradient-card-hover)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <h2 style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',fontWeight:700}}>{getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h2>
            {overallScore >= 85 && (
              <span className="badge" style={{background:'#FEF3C7',color:'#D97706',border:'1px solid #FDE68A',animation:'pulseBeat 2s infinite'}}>
                🔥 Top Performer
              </span>
            )}
          </div>
          <p style={{color:'var(--color-text-secondary)',marginTop:4,fontSize:'0.9rem'}}>
            {sheet?.status==='DRAFT'&&'Start building your goals for this cycle'}
            {sheet?.status==='SUBMITTED'&&'Your goals are pending manager review'}
            {sheet?.status==='APPROVED'&&'Your goals are approved — track your progress!'}
            {sheet?.status==='REWORK'&&'⚠️ Your manager has returned your goals with comments'}
          </p>
        </div>
        <div style={{textAlign:'center',padding:'8px 20px',background:'var(--color-bg-card)',borderRadius:'var(--radius-lg)',border:'1px solid var(--color-border)'}}>
          <p style={{fontSize:'0.65rem',color:'var(--color-text-muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'}}>Days Left</p>
          <p className="mono" style={{fontSize:'2rem',fontWeight:700,color:'var(--color-accent-1)',lineHeight:1.2}}>{daysLeft}</p>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
        <div className="card" style={{textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center'}}>
          <svg width="100" height="100" viewBox="0 0 100 100" style={{marginBottom:8}}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-bg-secondary)" strokeWidth="8"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="url(#pg)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${totalW*2.51} 251`} transform="rotate(-90 50 50)" style={{transition:'stroke-dasharray 1s var(--ease-out)'}}/>
            <defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FF6B47"/><stop offset="100%" stopColor="#F59E0B"/></linearGradient></defs>
            <text x="50" y="46" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="18" fontWeight="700" fill="var(--color-text-primary)">{totalW}%</text>
            <text x="50" y="62" textAnchor="middle" fontSize="9" fill="var(--color-text-muted)">allocated</text>
          </svg>
          <p style={{fontSize:'0.75rem',color:'var(--color-text-secondary)',fontWeight:600}}>Weightage</p>
        </div>
        <div className="card" style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
          <p className="mono" style={{fontSize:'2.5rem',fontWeight:700,lineHeight:1}}>{goalCount}</p>
          <p style={{fontSize:'0.75rem',color:'var(--color-text-secondary)',fontWeight:600,marginTop:8}}>Goals Set</p>
        </div>
        <div className="card" style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
          <span className={`badge ${SHEET_STATUSES[sheet?.status]?.class||'badge-draft'}`} style={{fontSize:'0.85rem',padding:'8px 16px'}}>{SHEET_STATUSES[sheet?.status]?.label||'Draft'}</span>
          <p style={{fontSize:'0.75rem',color:'var(--color-text-secondary)',fontWeight:600,marginTop:12}}>Status</p>
        </div>
        <div className="card" style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
          <p className="mono" style={{fontSize:'2.5rem',fontWeight:700,lineHeight:1,color:overallScore>0?getScoreColor(overallScore):'var(--color-text-muted)'}}>{overallScore>0?`${Math.round(overallScore)}%`:'—'}</p>
          <p style={{fontSize:'0.75rem',color:'var(--color-text-secondary)',fontWeight:600,marginTop:8}}>Score</p>
        </div>
      </div>

      <div style={{display:'flex',gap:12,marginBottom:24}}>
        <Link to="/employee/goals" className="btn btn-primary">{goalCount===0?'+ Add New Goal':'📝 Edit Goals'}</Link>
        {sheet?.status==='APPROVED'&&<Link to="/employee/achievements" className="btn btn-outline">📊 Log Achievement</Link>}
      </div>

      {sheet?.status==='REWORK'&&sheet.reworkNote&&(
        <div className="card-static" style={{marginBottom:24,background:'#FFF8F0',borderLeft:'4px solid #F59E0B'}}>
          <p style={{fontSize:'0.8rem',fontWeight:700,color:'#92400E',marginBottom:4}}>⚠️ Manager's Feedback</p>
          <p style={{fontSize:'0.85rem',color:'#78350F'}}>{sheet.reworkNote}</p>
        </div>
      )}

      <h3 style={{fontFamily:'var(--font-display)',marginBottom:12}}>My Goals</h3>
      {goalCount===0?(
        <div className="card-static" style={{textAlign:'center',padding:'3rem'}}>
          <div style={{fontSize:'3rem',marginBottom:12}}>🌱</div>
          <h3 style={{fontFamily:'var(--font-display)',color:'var(--color-text-secondary)',marginBottom:8}}>No goals yet</h3>
          <p style={{color:'var(--color-text-muted)',fontSize:'0.85rem',marginBottom:16}}>Plant the seeds of your performance journey</p>
          <Link to="/employee/goals" className="btn btn-primary">+ Add Your First Goal</Link>
        </div>
      ):(
        <div style={{display:'grid',gap:12}}>
          {sheet.goals.map((goal,idx)=>{
            const ach=goal.achievements?.[goal.achievements.length-1];
            const score=ach?.progressScore;
            const colors=['#FF6B47','#F59E0B','#10B981','#6366F1','#EC4899','#14B8A6','#8B5CF6','#F97316'];
            return(
              <div key={goal.id} className="card" style={{display:'flex',alignItems:'center',gap:16}}>
                <div style={{width:40,height:40,borderRadius:'var(--radius-md)',background:`${colors[idx%8]}15`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,flexShrink:0,color:colors[idx%8],fontFamily:'var(--font-mono)'}}>{idx+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <h4 style={{fontSize:'0.9rem',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{goal.isShared&&<span title="Shared">🔗 </span>}{goal.title}</h4>
                    {ach&&<span className={`badge ${GOAL_STATUSES[ach.status]?.class||'badge-not-started'}`}>{GOAL_STATUSES[ach.status]?.label}</span>}
                  </div>
                  <div style={{display:'flex',gap:16,fontSize:'0.75rem',color:'var(--color-text-muted)'}}>
                    <span>📌 {goal.thrustArea}</span><span className="mono">⚖️ {goal.weightage}%</span><span>📐 {goal.uomType}</span>
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  {score!=null?(<><p className="mono" style={{fontSize:'1.25rem',fontWeight:700,color:getScoreColor(score)}}>{Math.round(score)}%</p>
                    <div className="progress-bar-track" style={{width:80,height:4,marginTop:4}}><div className={`progress-bar-fill shimmer ${score>=80?'success':''}`} style={{width:`${score}%`}}/></div></>
                  ):(<p style={{fontSize:'0.8rem',color:'var(--color-text-muted)'}}>No data</p>)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
