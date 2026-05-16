import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import confetti from 'canvas-confetti';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../lib/formulae';
import toast from 'react-hot-toast';

export default function ApprovalView() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState([]);
  const [sheet, setSheet] = useState(null);
  const [selectedUser, setSelectedUser] = useState(userId || null);
  const [loading, setLoading] = useState(true);
  const [reworkComment, setReworkComment] = useState('');
  const [showRework, setShowRework] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => { loadTeam(); }, []);
  useEffect(() => { if (selectedUser) loadSheet(selectedUser); }, [selectedUser]);

  const loadTeam = async () => {
    try {
      const t = await api.getTeam(user.id);
      setTeam(t.filter(m => m.goalSheets?.[0]?.status === 'SUBMITTED'));
      if (!selectedUser && t.length > 0) {
        const pending = t.find(m => m.goalSheets?.[0]?.status === 'SUBMITTED');
        if (pending) setSelectedUser(pending.id);
      }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadSheet = async (uid) => {
    try { setSheet(await api.getUserGoalSheet(uid)); } catch(e) { console.error(e); }
  };

  const handleApprove = async () => {
    if (!confirm('Approve and lock this goal sheet?')) return;
    try {
      await api.approveGoals(sheet.id);
      
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#10B981', '#14B8A6', '#8B5CF6']
      });
      
      toast.success('Email & Teams notification sent to Employee!', { duration: 5000, icon: '📧' });
      setTimeout(() => navigate('/manager'), 2500);
    } catch(e) { alert(e.message); }
  };

  const handleRework = async () => {
    if (!reworkComment.trim()) { alert('Please add a comment'); return; }
    try { 
      await api.reworkGoals(sheet.id, reworkComment); 
      toast.success('Rework requested. Email sent to Employee!', { duration: 5000, icon: '📧' });
      navigate('/manager'); 
    } catch(e) { alert(e.message); }
  };

  const handleManagerEdit = async (goalId) => {
    try { await api.managerEditGoal(goalId, editValues); await loadSheet(selectedUser); setEditingGoal(null); }
    catch(e) { alert(e.message); }
  };

  if (loading) return <div className="page-enter"><div className="skeleton" style={{height:400}}/></div>;

  return (
    <div className="page-enter">
      {/* Pending list */}
      {team.length > 0 && (
        <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
          {team.map(m => (
            <button key={m.id} onClick={()=>setSelectedUser(m.id)}
              className={selectedUser===m.id?'btn btn-primary btn-sm':'btn btn-outline btn-sm'}>
              {m.name}
            </button>
          ))}
        </div>
      )}

      {!sheet ? (
        <div className="card-static" style={{textAlign:'center',padding:'2rem'}}>
          <p style={{color:'var(--color-text-muted)'}}>Select a team member to review their goals.</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:24}}>
          <div>
            <div className="card-static" style={{marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:48,height:48,borderRadius:'var(--radius-full)',background:'var(--color-bg-secondary)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'var(--color-accent-1)'}}>{getInitials(sheet.user?.name)}</div>
              <div>
                <h3 style={{fontWeight:700}}>{sheet.user?.name}</h3>
                <p style={{fontSize:'0.8rem',color:'var(--color-text-muted)'}}>{sheet.user?.designation} · {sheet.user?.department}</p>
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead><tr><th>#</th><th>Goal</th><th>Thrust Area</th><th>UoM</th><th>Target</th><th>Weight</th><th></th></tr></thead>
                <tbody>
                  {sheet.goals?.map((g,i)=>(
                    <tr key={g.id}>
                      <td className="mono" style={{fontWeight:600}}>{i+1}</td>
                      <td>
                        <p style={{fontWeight:600,fontSize:'0.85rem'}}>{g.isShared&&'🔗 '}{g.title}</p>
                        {g.description&&<p style={{fontSize:'0.7rem',color:'var(--color-text-muted)',marginTop:2}}>{g.description.substring(0,80)}...</p>}
                      </td>
                      <td style={{fontSize:'0.8rem'}}>{g.thrustArea}</td>
                      <td><span className="badge badge-draft">{g.uomType}</span></td>
                      <td>
                        {editingGoal===g.id?(
                          <input className="input" style={{maxWidth:100}} defaultValue={g.target}
                            onChange={e=>setEditValues(v=>({...v,target:e.target.value}))}/>
                        ):(
                          <span className="mono" style={{fontWeight:600,cursor:'pointer'}} onClick={()=>{setEditingGoal(g.id);setEditValues({target:g.target,weightage:g.weightage});}} title="Click to edit">{g.target}</span>
                        )}
                      </td>
                      <td>
                        {editingGoal===g.id?(
                          <input className="input" type="number" style={{maxWidth:70}} defaultValue={g.weightage}
                            onChange={e=>setEditValues(v=>({...v,weightage:parseFloat(e.target.value)}))}/>
                        ):(
                          <span className="mono" style={{fontWeight:600}}>{g.weightage}%</span>
                        )}
                      </td>
                      <td>
                        {editingGoal===g.id&&(
                          <div style={{display:'flex',gap:4}}>
                            <button className="btn btn-primary btn-sm" onClick={()=>handleManagerEdit(g.id)}>✓</button>
                            <button className="btn btn-ghost btn-sm" onClick={()=>setEditingGoal(null)}>✕</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div style={{marginTop:20,display:'flex',gap:12}}>
              <button className="btn btn-success" onClick={handleApprove}>✅ Approve & Lock</button>
              <button className="btn btn-warning" onClick={()=>setShowRework(!showRework)}>🔄 Return for Rework</button>
            </div>
            {showRework&&(
              <div className="card-static" style={{marginTop:12}}>
                <label className="input-label">Rework Comment *</label>
                <textarea className="textarea" value={reworkComment} onChange={e=>setReworkComment(e.target.value)} placeholder="Explain what needs to change..." rows={3}/>
                <button className="btn btn-warning btn-sm" style={{marginTop:8}} onClick={handleRework} disabled={!reworkComment.trim()}>Send Rework</button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{position:'sticky',top:100,alignSelf:'start'}}>
            <div className="card-static">
              <h4 style={{fontWeight:700,fontSize:'0.85rem',marginBottom:12}}>Validation</h4>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:'0.8rem'}}>Goals</span>
                <span className="mono" style={{fontWeight:700}}>{sheet.goals?.length || 0}/8</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:'0.8rem'}}>Total Weightage</span>
                <span className="mono" style={{fontWeight:700,color:sheet.goals?.reduce((s,g)=>s+g.weightage,0)===100?'var(--color-accent-3)':'var(--color-accent-1)'}}>
                  {sheet.goals?.reduce((s,g)=>s+g.weightage,0)}%
                </span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:'0.8rem'}}>Min per goal</span>
                <span className="mono" style={{fontWeight:700,color:sheet.goals?.every(g=>g.weightage>=10)?'var(--color-accent-3)':'#EF4444'}}>
                  {sheet.goals?.every(g=>g.weightage>=10)?'✓ Pass':'✕ Fail'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
