import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';


export default function ControlCenter() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);
  const loadStats = async () => {
    try { setStats(await api.getStats()); } catch(e){console.error(e);} finally{setLoading(false);}
  };

  if(loading) return <div className="page-enter">{[1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:120,marginBottom:16}}/>)}</div>;

  const s = stats||{};

  return(
    <div className="page-enter">
      {/* Phase indicator */}
      {s.currentPhase&&(
        <div className="card-static" style={{marginBottom:24,background:'var(--gradient-card-hover)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <p style={{fontSize:'0.7rem',color:'var(--color-text-muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'}}>Current Phase</p>
            <h3 style={{fontFamily:'var(--font-display)',color:'var(--color-accent-1)'}}>{s.currentPhase.label}</h3>
          </div>
          <span className="badge badge-completed">Active</span>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
        {[
          {label:'Total Employees',value:s.totalEmployees,icon:'👥',color:'var(--color-accent-1)'},
          {label:'Goals Submitted',value:s.submissionRate,suffix:'%',icon:'📤',color:'var(--color-accent-2)'},
          {label:'Goals Approved',value:s.approvalRate,suffix:'%',icon:'✅',color:'var(--color-accent-3)'},
          {label:'Pending Review',value:s.pendingSheets,icon:'⏳',color:'var(--color-accent-4)'},
        ].map((item,i)=>(
          <div key={i} className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:'1.5rem',marginBottom:8}}>{item.icon}</div>
            <p className="mono" style={{fontSize:'2rem',fontWeight:700,color:item.color,lineHeight:1}}>
              {item.value||0}{item.suffix||''}
            </p>
            <p style={{fontSize:'0.75rem',color:'var(--color-text-secondary)',marginTop:8,fontWeight:600}}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
        <div className="card-static">
          <h4 style={{fontWeight:700,marginBottom:12}}>Sheet Status Breakdown</h4>
          {[
            {label:'Draft',count:s.draftSheets,color:'#A8A29E'},
            {label:'Submitted',count:s.submittedSheets,color:'#F59E0B'},
            {label:'Approved',count:s.approvedSheets,color:'#10B981'},
            {label:'Rework',count:s.reworkSheets,color:'#EF4444'},
          ].map(item=>(
            <div key={item.label} style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:item.color,flexShrink:0}}/>
              <span style={{flex:1,fontSize:'0.85rem'}}>{item.label}</span>
              <span className="mono" style={{fontWeight:700}}>{item.count||0}</span>
            </div>
          ))}
        </div>
        <div className="card-static">
          <h4 style={{fontWeight:700,marginBottom:12}}>Departments</h4>
          {s.departments?.map(d=>(
            <div key={d.department} style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontSize:'0.85rem'}}>{d.department}</span>
              <span className="mono" style={{fontWeight:600}}>{d._count.id} employees</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <h3 style={{fontFamily:'var(--font-display)',marginBottom:12}}>Quick Actions</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
        <Link to="/admin/cycles" className="card" style={{textDecoration:'none',textAlign:'center'}}>
          <div style={{fontSize:'1.5rem',marginBottom:8}}>🔄</div><p style={{fontWeight:600,fontSize:'0.85rem'}}>Manage Cycles</p>
        </Link>
        <Link to="/admin/shared-goals" className="card" style={{textDecoration:'none',textAlign:'center'}}>
          <div style={{fontSize:'1.5rem',marginBottom:8}}>🤝</div><p style={{fontWeight:600,fontSize:'0.85rem'}}>Publish Shared Goal</p>
        </Link>
        <Link to="/admin/reports" className="card" style={{textDecoration:'none',textAlign:'center'}}>
          <div style={{fontSize:'1.5rem',marginBottom:8}}>📋</div><p style={{fontWeight:600,fontSize:'0.85rem'}}>Export Report</p>
        </Link>
        <Link to="/admin/analytics" className="card" style={{textDecoration:'none',textAlign:'center'}}>
          <div style={{fontSize:'1.5rem',marginBottom:8}}>📈</div><p style={{fontWeight:600,fontSize:'0.85rem'}}>View Analytics</p>
        </Link>
      </div>
    </div>
  );
}
