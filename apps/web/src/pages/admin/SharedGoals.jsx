import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { THRUST_AREAS, UOM_TYPES } from '../../lib/constants';

export default function SharedGoals() {
  const [goals, setGoals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({title:'',description:'',thrustArea:'Revenue Growth',uomType:'MIN',target:'',department:'',assignedTo:[]});

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try { const [g,u] = await Promise.all([api.getSharedGoals(), api.getUsers()]); setGoals(g); setUsers(u); }
    catch(e){console.error(e);} finally{setLoading(false);}
  };

  const handleCreate = async () => {
    try { await api.createSharedGoal(form); setShowForm(false); setForm({title:'',description:'',thrustArea:'Revenue Growth',uomType:'MIN',target:'',department:'',assignedTo:[]}); await loadData(); }
    catch(e){alert(e.message);}
  };

  const toggleUser = (uid) => {
    setForm(f => ({...f, assignedTo: f.assignedTo.includes(uid) ? f.assignedTo.filter(id=>id!==uid) : [...f.assignedTo, uid]}));
  };

  if(loading) return <div className="page-enter"><div className="skeleton" style={{height:300}}/></div>;

  return(
    <div className="page-enter">
      <button className="btn btn-primary" style={{marginBottom:20}} onClick={()=>setShowForm(!showForm)}>+ Publish Shared Goal</button>

      {showForm&&(
        <div className="card-static" style={{marginBottom:24}}>
          <h4 style={{fontWeight:700,marginBottom:16}}>New Departmental KPI</h4>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
            <div><label className="input-label">Title</label><input className="input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
            <div><label className="input-label">Department</label><input className="input" value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))}/></div>
            <div><label className="input-label">Thrust Area</label>
              <select className="input" value={form.thrustArea} onChange={e=>setForm(f=>({...f,thrustArea:e.target.value}))}>
                {THRUST_AREAS.map(t=><option key={t.id} value={t.label}>{t.label}</option>)}
              </select>
            </div>
            <div><label className="input-label">UoM Type</label>
              <select className="input" value={form.uomType} onChange={e=>setForm(f=>({...f,uomType:e.target.value}))}>
                {UOM_TYPES.map(u=><option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            <div><label className="input-label">Target</label><input className="input" value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))}/></div>
          </div>
          <div style={{marginBottom:16}}>
            <label className="input-label">Description</label>
            <textarea className="textarea" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={2}/>
          </div>
          <div style={{marginBottom:16}}>
            <label className="input-label">Assign To ({form.assignedTo.length} selected)</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
              {users.filter(u=>u.role==='EMPLOYEE').map(u=>(
                <button key={u.id} className={`btn btn-sm ${form.assignedTo.includes(u.id)?'btn-primary':'btn-outline'}`}
                  onClick={()=>toggleUser(u.id)}>{u.name}</button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-primary" onClick={handleCreate} disabled={!form.title||!form.target||form.assignedTo.length===0}>Publish</button>
            <button className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {goals.length===0?(
        <div className="card-static" style={{textAlign:'center',padding:'2rem'}}><p style={{color:'var(--color-text-muted)'}}>No shared goals published yet.</p></div>
      ):(
        <div style={{display:'grid',gap:12}}>
          {goals.map(g=>(
            <div key={g.id} className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'start'}}>
                <div>
                  <h4 style={{fontWeight:600}}>{g.title}</h4>
                  <p style={{fontSize:'0.8rem',color:'var(--color-text-muted)',marginTop:4}}>{g.thrustArea} · {g.uomType} · Target: {g.target}</p>
                  {g.description&&<p style={{fontSize:'0.8rem',marginTop:4}}>{g.description}</p>}
                </div>
                <span className="badge badge-submitted">{g.assignedTo?.length||0} assigned</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
