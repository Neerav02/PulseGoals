import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { QUARTERS } from '../../lib/constants';

export default function Reports() {
  const [users, setUsers] = useState([]);
  const [preview, setPreview] = useState([]);
  const [quarter, setQuarter] = useState('Q1');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadPreview(); }, [quarter]);

  const loadData = async () => {
    try { setUsers(await api.getUsers()); } catch(e){console.error(e);} finally{setLoading(false);}
  };

  const loadPreview = async () => {
    try { setPreview(await api.getExportPreview(quarter)); } catch(e){console.error(e);}
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await api.exportReport({ userIds: selectedUsers, quarter, year: new Date().getFullYear() });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `PulseGoals_${quarter}_Report.xlsx`; a.click();
      URL.revokeObjectURL(url);
    } catch(e) { alert(e.message); }
    finally { setExporting(false); }
  };

  if(loading) return <div className="page-enter"><div className="skeleton" style={{height:300}}/></div>;

  return(
    <div className="page-enter">
      <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:24}}>
        {/* Filters */}
        <div className="card-static" style={{alignSelf:'start',position:'sticky',top:100}}>
          <h4 style={{fontWeight:700,marginBottom:16}}>Export Settings</h4>
          <div style={{marginBottom:16}}>
            <label className="input-label">Quarter</label>
            <div style={{display:'flex',gap:4}}>
              {QUARTERS.map(q=>(
                <button key={q} className={q===quarter?'btn btn-primary btn-sm':'btn btn-outline btn-sm'} onClick={()=>setQuarter(q)}>{q}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label className="input-label">Employees (optional filter)</label>
            <div style={{maxHeight:200,overflowY:'auto',border:'1px solid var(--color-border)',borderRadius:'var(--radius-md)',padding:8}}>
              {users.filter(u=>u.role!=='ADMIN').map(u=>(
                <label key={u.id} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',cursor:'pointer',fontSize:'0.85rem'}}>
                  <input type="checkbox" checked={selectedUsers.includes(u.id)}
                    onChange={()=>setSelectedUsers(s=>s.includes(u.id)?s.filter(id=>id!==u.id):[...s,u.id])}/>
                  {u.name}
                </label>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" style={{width:'100%'}} onClick={handleExport} disabled={exporting}>
            {exporting?'Exporting...':'📥 Download Excel'}
          </button>
        </div>

        {/* Preview */}
        <div>
          <h4 style={{fontWeight:700,marginBottom:12}}>Preview (first 5 rows)</h4>
          {preview.length>0?(
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Employee</th><th>Goal</th><th>Thrust Area</th><th>UoM</th><th>Target</th><th>Actual</th><th>Score</th><th>Status</th></tr></thead>
                <tbody>
                  {preview.map((r,i)=>(
                    <tr key={i}>
                      <td style={{fontWeight:600,fontSize:'0.85rem'}}>{r.employeeName}</td>
                      <td style={{fontSize:'0.85rem'}}>{r.goalTitle}</td>
                      <td style={{fontSize:'0.8rem'}}>{r.thrustArea}</td>
                      <td><span className="badge badge-draft">{r.uomType}</span></td>
                      <td className="mono">{r.target}</td>
                      <td className="mono">{r.actualValue}</td>
                      <td className="mono" style={{fontWeight:700}}>{r.progressScore}%</td>
                      <td><span className={`badge badge-${r.status==='COMPLETED'?'completed':r.status==='ON_TRACK'?'on-track':'not-started'}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ):(
            <div className="card-static" style={{textAlign:'center',padding:'2rem'}}><p style={{color:'var(--color-text-muted)'}}>No data available for preview.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
