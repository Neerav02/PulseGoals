import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { getInitials } from '../../lib/formulae';

export default function OrgHierarchy() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({name:'',email:'',password:'Password@123',role:'EMPLOYEE',department:'',designation:'',managerId:''});
  const [filter, setFilter] = useState('');

  useEffect(() => { loadUsers(); }, []);
  const loadUsers = async () => {
    try { setUsers(await api.getUsers()); } catch(e){console.error(e);} finally{setLoading(false);}
  };

  const handleAdd = async () => {
    try { await api.createUser(form); setShowAdd(false); setForm({name:'',email:'',password:'Password@123',role:'EMPLOYEE',department:'',designation:'',managerId:''}); await loadUsers(); }
    catch(e) { alert(e.message); }
  };

  const managers = users.filter(u=>u.role==='MANAGER'||u.role==='ADMIN');
  const filtered = users.filter(u=>!filter||u.name.toLowerCase().includes(filter.toLowerCase())||u.email.toLowerCase().includes(filter.toLowerCase()));

  if(loading) return <div className="page-enter"><div className="skeleton" style={{height:400}}/></div>;

  return(
    <div className="page-enter">
      <div style={{display:'flex',gap:12,marginBottom:20}}>
        <input className="input" placeholder="Search by name or email..." value={filter} onChange={e=>setFilter(e.target.value)} style={{maxWidth:300}}/>
        <button className="btn btn-primary" onClick={()=>setShowAdd(!showAdd)}>+ Add Employee</button>
      </div>

      {showAdd&&(
        <div className="card-static" style={{marginBottom:20}}>
          <h4 style={{fontWeight:700,marginBottom:12}}>New Employee</h4>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            <div><label className="input-label">Name</label><input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
            <div><label className="input-label">Email</label><input className="input" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
            <div><label className="input-label">Role</label>
              <select className="input" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                <option value="EMPLOYEE">Employee</option><option value="MANAGER">Manager</option><option value="ADMIN">Admin</option>
              </select>
            </div>
            <div><label className="input-label">Department</label><input className="input" value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))}/></div>
            <div><label className="input-label">Designation</label><input className="input" value={form.designation} onChange={e=>setForm(f=>({...f,designation:e.target.value}))}/></div>
            <div><label className="input-label">Manager</label>
              <select className="input" value={form.managerId} onChange={e=>setForm(f=>({...f,managerId:e.target.value}))}>
                <option value="">None</option>
                {managers.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginTop:12,display:'flex',gap:8}}>
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>Save</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead><tr><th>Employee</th><th>Email</th><th>Role</th><th>Department</th><th>Manager</th><th>Goals</th></tr></thead>
          <tbody>
            {filtered.map(u=>(
              <tr key={u.id}>
                <td style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:32,height:32,borderRadius:'var(--radius-full)',background:'var(--color-bg-secondary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',fontWeight:700,color:'var(--color-accent-1)',flexShrink:0}}>{getInitials(u.name)}</div>
                  <div><p style={{fontWeight:600,fontSize:'0.85rem'}}>{u.name}</p><p style={{fontSize:'0.65rem',color:'var(--color-text-muted)'}}>{u.designation}</p></div>
                </td>
                <td style={{fontSize:'0.8rem'}}>{u.email}</td>
                <td><span className={`badge ${u.role==='ADMIN'?'badge-submitted':u.role==='MANAGER'?'badge-on-track':'badge-draft'}`}>{u.role}</span></td>
                <td style={{fontSize:'0.85rem'}}>{u.department}</td>
                <td style={{fontSize:'0.85rem'}}>{u.manager?.name||'—'}</td>
                <td className="mono" style={{fontWeight:600}}>{u._count?.goalSheets||0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
