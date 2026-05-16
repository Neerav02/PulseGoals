import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { QUARTERS } from '../../lib/constants';
import { getInitials, formatDate, getScoreColor } from '../../lib/formulae';

export default function CheckIns() {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quarter, setQuarter] = useState('Q1');
  const [sheet, setSheet] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadTeam(); }, []);
  useEffect(() => { if (selected) { loadEmployeeData(); loadCheckIns(); } }, [selected, quarter]);

  const loadTeam = async () => {
    try { const t = await api.getTeam(user.id); setTeam(t); if(t.length>0)setSelected(t[0].id); }
    catch(e){console.error(e);} finally{setLoading(false);}
  };

  const loadEmployeeData = async () => {
    try { setSheet(await api.getUserAchievements(selected, quarter)); } catch(e){console.error(e);}
  };

  const loadCheckIns = async () => {
    try { setCheckIns(await api.getCheckIns(selected, quarter)); } catch(e){console.error(e);}
  };

  const handleSave = async () => {
    if(!comment.trim())return;
    setSaving(true);
    try { await api.createCheckIn({employeeId:selected,quarter,comment}); setComment(''); await loadCheckIns(); }
    catch(e){alert(e.message);} finally{setSaving(false);}
  };

  const selectedMember = team.find(m=>m.id===selected);

  if(loading) return <div className="page-enter"><div className="skeleton" style={{height:400}}/></div>;

  return(
    <div className="page-enter">
      <div style={{display:'grid',gridTemplateColumns:'240px 1fr',gap:24}}>
        {/* Team List */}
        <div className="card-static" style={{padding:'12px',alignSelf:'start',position:'sticky',top:100}}>
          <h4 style={{fontWeight:700,fontSize:'0.8rem',padding:'8px 8px 12px',color:'var(--color-text-secondary)'}}>Team Members</h4>
          {team.map(m=>(
            <div key={m.id} onClick={()=>setSelected(m.id)}
              style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:'var(--radius-md)',cursor:'pointer',
                background:selected===m.id?'#FFF3EC':'transparent',transition:'background 0.15s'}}>
              <div style={{width:32,height:32,borderRadius:'var(--radius-full)',background:'var(--color-bg-secondary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',fontWeight:700,color:'var(--color-accent-1)',flexShrink:0}}>{getInitials(m.name)}</div>
              <div><p style={{fontSize:'0.8rem',fontWeight:selected===m.id?600:500}}>{m.name}</p><p style={{fontSize:'0.65rem',color:'var(--color-text-muted)'}}>{m.department}</p></div>
            </div>
          ))}
        </div>

        {/* Check-in Content */}
        <div>
          {/* Quarter tabs */}
          <div style={{display:'flex',gap:4,marginBottom:20,background:'var(--color-bg-secondary)',padding:4,borderRadius:'var(--radius-md)',width:'fit-content'}}>
            {QUARTERS.map(q=>(
              <button key={q} onClick={()=>setQuarter(q)} className={q===quarter?'btn btn-primary btn-sm':'btn btn-ghost btn-sm'}>{q}</button>
            ))}
          </div>

          {selectedMember && (
            <div className="card-static" style={{marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:40,height:40,borderRadius:'var(--radius-full)',background:'var(--color-bg-secondary)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'var(--color-accent-1)'}}>{getInitials(selectedMember.name)}</div>
              <div><h4 style={{fontWeight:600}}>{selectedMember.name}</h4><p style={{fontSize:'0.75rem',color:'var(--color-text-muted)'}}>{quarter} Check-in</p></div>
            </div>
          )}

          {/* Goals comparison */}
          {sheet?.goals?.length > 0 && (
            <div className="table-container" style={{marginBottom:20}}>
              <table className="table">
                <thead><tr><th>Goal</th><th>Planned</th><th>Actual</th><th>Score</th></tr></thead>
                <tbody>
                  {sheet.goals.map(g=>{
                    const ach=g.achievements?.[0];
                    return(
                      <tr key={g.id}>
                        <td><p style={{fontWeight:600,fontSize:'0.85rem'}}>{g.title}</p><p style={{fontSize:'0.7rem',color:'var(--color-text-muted)'}}>{g.thrustArea}</p></td>
                        <td className="mono" style={{fontWeight:600}}>{g.target}</td>
                        <td className="mono">{ach?.actualValue||'—'}</td>
                        <td>{ach?.progressScore!=null?<span className="mono" style={{fontWeight:700,color:getScoreColor(ach.progressScore)}}>{Math.round(ach.progressScore)}%</span>:'—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Add comment */}
          <div className="card-static" style={{marginBottom:20}}>
            <label className="input-label">Check-in Comment</label>
            <textarea className="textarea" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Share feedback on this quarter's progress..." rows={4}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
              <span style={{fontSize:'0.7rem',color:'var(--color-text-muted)'}}>{comment.length} characters</span>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving||!comment.trim()}>{saving?'Saving...':'💬 Save Check-in'}</button>
            </div>
          </div>

          {/* History */}
          {checkIns.length>0&&(
            <div>
              <h4 style={{fontFamily:'var(--font-display)',marginBottom:12}}>Previous Check-ins</h4>
              {checkIns.map(ci=>(
                <div key={ci.id} className="card-static" style={{marginBottom:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontSize:'0.75rem',fontWeight:600}}>{ci.manager?.name}</span>
                    <span className="mono" style={{fontSize:'0.7rem',color:'var(--color-text-muted)'}}>{formatDate(ci.createdAt)}</span>
                  </div>
                  <p style={{fontSize:'0.85rem',lineHeight:1.5}}>{ci.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
