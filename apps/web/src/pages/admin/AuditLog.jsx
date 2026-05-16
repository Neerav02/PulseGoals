import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/formulae';

const ACTION_COLORS = {
  TOGGLE_CYCLE: '#6366F1',
  APPROVE_GOALS: '#10B981',
  REWORK_GOALS: '#F59E0B',
  CREATE_GOAL: '#FF6B47',
  UPDATE_GOAL: '#F59E0B',
  DELETE_GOAL: '#EF4444',
  MANAGER_EDIT_GOAL: '#F59E0B',
  SUBMIT_GOALS: '#FF6B47',
  CREATE_USER: '#6366F1',
  UPDATE_USER: '#6366F1',
  PUBLISH_SHARED_GOAL: '#8B5CF6',
  UPDATE_ACHIEVEMENT: '#10B981',
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate:'', endDate:'', entityType:'' });

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    try {
      const f = {};
      if(filters.startDate) f.startDate = filters.startDate;
      if(filters.endDate) f.endDate = filters.endDate;
      if(filters.entityType) f.entityType = filters.entityType;
      setLogs(await api.getAuditLogs(f));
    } catch(e){console.error(e);} finally{setLoading(false);}
  };

  const handleFilter = () => { setLoading(true); loadLogs(); };

  if(loading) return <div className="page-enter"><div className="skeleton" style={{height:400}}/></div>;

  return(
    <div className="page-enter">
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <div><label className="input-label">From</label><input className="input" type="date" value={filters.startDate} onChange={e=>setFilters(f=>({...f,startDate:e.target.value}))}/></div>
        <div><label className="input-label">To</label><input className="input" type="date" value={filters.endDate} onChange={e=>setFilters(f=>({...f,endDate:e.target.value}))}/></div>
        <div><label className="input-label">Entity</label>
          <select className="input" value={filters.entityType} onChange={e=>setFilters(f=>({...f,entityType:e.target.value}))}>
            <option value="">All</option>
            <option value="Goal">Goal</option><option value="GoalSheet">GoalSheet</option>
            <option value="User">User</option><option value="CycleConfig">CycleConfig</option>
            <option value="Achievement">Achievement</option><option value="SharedGoal">SharedGoal</option>
          </select>
        </div>
        <div style={{display:'flex',alignItems:'flex-end'}}><button className="btn btn-primary btn-sm" onClick={handleFilter}>🔍 Filter</button></div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
          <tbody>
            {logs.map(log=>(
              <tr key={log.id}>
                <td className="mono" style={{fontSize:'0.75rem',whiteSpace:'nowrap'}}>{formatDate(log.createdAt)}</td>
                <td style={{fontWeight:600,fontSize:'0.85rem'}}>{log.actorName}</td>
                <td>
                  <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'3px 10px',borderRadius:'var(--radius-full)',fontSize:'0.7rem',fontWeight:600,
                    background:`${ACTION_COLORS[log.action]||'#A8A29E'}15`,color:ACTION_COLORS[log.action]||'#A8A29E'}}>
                    <span style={{width:6,height:6,borderRadius:'50%',background:'currentColor'}}/>
                    {log.action.replace(/_/g,' ')}
                  </span>
                </td>
                <td style={{fontSize:'0.8rem'}}>{log.entityType}<br/><span className="mono" style={{fontSize:'0.65rem',color:'var(--color-text-muted)'}}>{log.entityId.substring(0,8)}...</span></td>
                <td style={{fontSize:'0.75rem',maxWidth:200}}>
                  {log.beforeValue&&<span style={{color:'#EF4444'}}>-{JSON.stringify(log.beforeValue).substring(0,40)}</span>}
                  {log.afterValue&&<span style={{color:'#10B981',marginLeft:4}}>+{JSON.stringify(log.afterValue).substring(0,40)}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {logs.length===0&&<div className="card-static" style={{textAlign:'center',padding:'2rem',marginTop:12}}><p style={{color:'var(--color-text-muted)'}}>No audit logs found.</p></div>}
    </div>
  );
}
