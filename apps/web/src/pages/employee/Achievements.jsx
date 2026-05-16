import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { computeProgressScore, getScoreColor } from '../../lib/formulae';
import { QUARTERS, GOAL_STATUSES } from '../../lib/constants';

function AchievementRow({ goal, quarter, isLocked, saving, onSave }) {
  const ach = goal.achievements?.find(a => a.quarter === quarter);
  const [val, setVal] = useState(ach?.actualValue || '');
  const [st, setSt] = useState(ach?.status || 'NOT_STARTED');
  const preview = val ? computeProgressScore(goal.uomType, goal.target, val) : null;

  return (
    <tr>
      <td>
        <p style={{fontWeight:600,fontSize:'0.85rem'}}>{goal.title}</p>
        <p style={{fontSize:'0.7rem',color:'var(--color-text-muted)'}}>{goal.thrustArea} · {goal.weightage}%</p>
      </td>
      <td><span className="badge badge-draft">{goal.uomType}</span></td>
      <td><span className="mono" style={{fontWeight:600}}>{goal.target}</span></td>
      <td>
        <input className="input" type={goal.uomType==='TIMELINE'?'date':'text'}
          value={val} onChange={e=>setVal(e.target.value)}
          disabled={isLocked} placeholder={isLocked?'Locked':'Enter value'}
          style={{maxWidth:150}}/>
      </td>
      <td>
        <select className="input" value={st} onChange={e=>setSt(e.target.value)} disabled={isLocked} style={{maxWidth:140}}>
          <option value="NOT_STARTED">Not Started</option>
          <option value="ON_TRACK">On Track</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </td>
      <td>
        {preview != null ? (
          <span className="mono" style={{fontWeight:700,color:getScoreColor(preview)}}>{Math.round(preview)}%</span>
        ) : (
          <span style={{color:'var(--color-text-muted)'}}>—</span>
        )}
      </td>
      <td>
        {!isLocked && (
          <button className="btn btn-primary btn-sm" disabled={saving||!val}
            onClick={()=>onSave(goal.id,goal.uomType,goal.target,val,st)}>
            {saving?'...':'Save'}
          </button>
        )}
      </td>
    </tr>
  );
}

export default function Achievements() {
  const { user } = useAuth();
  const [sheet, setSheet] = useState(null);
  const [quarter, setQuarter] = useState('Q1');
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [s, c] = await Promise.all([api.getGoalSheet(), api.getCycles()]);
      setSheet(s);
      setCycles(c);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSaveAch = async (goalId, uomType, target, actualValue, status) => {
    setSaving(s => ({...s, [goalId]: true}));
    try {
      await api.saveAchievement({ goalId, quarter, actualValue, status });
      await loadData();
    } catch(e) { alert(e.message); }
    finally { setSaving(s => ({...s, [goalId]: false})); }
  };

  if (loading) return <div className="page-enter">{[1,2,3].map(i=><div key={i} className="skeleton" style={{height:60,marginBottom:8}}/>)}</div>;

  const goals = sheet?.goals || [];

  return (
    <div className="page-enter">
      {/* Quarter Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:24,background:'var(--color-bg-secondary)',padding:4,borderRadius:'var(--radius-md)',width:'fit-content'}}>
        {QUARTERS.map(q=>(
          <button key={q} onClick={()=>setQuarter(q)}
            className={q===quarter?'btn btn-primary btn-sm':'btn btn-ghost btn-sm'}
            style={{minWidth:70}}>
            {q}
          </button>
        ))}
      </div>

      {sheet?.status !== 'APPROVED' && (
        <div className="card-static" style={{marginBottom:20,background:'#FFF8F0',borderLeft:'4px solid var(--color-accent-2)'}}>
          <p style={{fontSize:'0.85rem',color:'#92400E'}}>⚠️ Your goal sheet must be approved before you can log achievements.</p>
        </div>
      )}

      {sheet?.status === 'APPROVED' && !cycles.find(c => c.phase === quarter)?.isOpen && (
        <div className="card-static" style={{marginBottom:20,background:'#F8FAFC',borderLeft:'4px solid #94A3B8'}}>
          <p style={{fontSize:'0.85rem',color:'#475569'}}>🔒 The reporting window for {quarter} is currently closed by the Administrator.</p>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Goal</th>
              <th>UoM</th>
              <th>Target</th>
              <th>Actual Achievement</th>
              <th>Status</th>
              <th>Score</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {goals.map(goal => {
              const isQuarterOpen = cycles.find(c => c.phase === quarter)?.isOpen;
              const isLocked = sheet?.status !== 'APPROVED' || !isQuarterOpen;
              return (
                <AchievementRow
                  key={`${goal.id}-${quarter}`}
                  goal={goal}
                  quarter={quarter}
                  isLocked={isLocked}
                  saving={saving[goal.id]}
                  onSave={handleSaveAch}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      {goals.length === 0 && (
        <div className="card-static" style={{textAlign:'center',padding:'2rem',marginTop:12}}>
          <p style={{color:'var(--color-text-muted)'}}>No goals to track yet.</p>
        </div>
      )}
    </div>
  );
}
