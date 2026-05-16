import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/formulae';

export default function CycleManagement() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCycles(); }, []);
  const loadCycles = async () => {
    try { setCycles(await api.getCycles()); } catch(e){console.error(e);} finally{setLoading(false);}
  };

  const handleToggle = async (phase) => {
    try { await api.toggleCycle(phase); await loadCycles(); } catch(e){alert(e.message);}
  };

  if(loading) return <div className="page-enter"><div className="skeleton" style={{height:300}}/></div>;

  return(
    <div className="page-enter">
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Phase</th><th>Label</th><th>Status</th><th>Opened</th><th>Closed</th><th>Action</th></tr></thead>
          <tbody>
            {cycles.map(c=>(
              <tr key={c.id}>
                <td className="mono" style={{fontWeight:600}}>{c.phase}</td>
                <td>{c.label}</td>
                <td><span className={`badge ${c.isOpen?'badge-completed':'badge-draft'}`}>{c.isOpen?'Open':'Closed'}</span></td>
                <td className="mono" style={{fontSize:'0.8rem'}}>{formatDate(c.openedAt)}</td>
                <td className="mono" style={{fontSize:'0.8rem'}}>{formatDate(c.closedAt)}</td>
                <td>
                  <button className={`btn btn-sm ${c.isOpen?'btn-warning':'btn-success'}`} onClick={()=>handleToggle(c.phase)}>
                    {c.isOpen?'Close':'Open'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
