import { useState, useEffect } from 'react';
import { AlertCircle, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#FF6B47','#F59E0B','#10B981','#6366F1','#EC4899','#14B8A6','#8B5CF6','#F97316','#64748B','#EF4444'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try { const [a,h] = await Promise.all([api.getAnalytics(), api.getHeatmap()]); setData(a); setHeatmap(h); }
    catch(e){console.error(e);} finally{setLoading(false);}
  };

  if(loading) return <div className="page-enter">{[1,2,3].map(i=><div key={i} className="skeleton" style={{height:250,marginBottom:16}}/>)}</div>;

  const thrustData = data?.thrustAreas?.map(t=>({name:t.thrustArea,count:t._count.id}))||[];
  const uomData = data?.uomBreakdown?.map(u=>({name:u.uomType,count:u._count.id}))||[];
  const qoqData = data?.qoqData||[];

  return(
    <div className="page-enter">
      {/* QoQ Trend */}
      <div className="card-static" style={{marginBottom:24}}>
        <h4 style={{fontWeight:700,marginBottom:16}}>Quarter-on-Quarter Performance</h4>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={qoqData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>
            <XAxis dataKey="quarter" stroke="var(--color-text-muted)" fontSize={12}/>
            <YAxis stroke="var(--color-text-muted)" fontSize={12}/>
            <Tooltip contentStyle={{borderRadius:12,border:'1px solid var(--color-border)',boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}/>
            <Line type="monotone" dataKey="avgScore" stroke="#FF6B47" strokeWidth={3} dot={{fill:'#FF6B47',r:6}} name="Avg Score"/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginBottom:24}}>
        {/* Thrust Area Distribution */}
        <div className="card-static">
          <h4 style={{fontWeight:700,marginBottom:16}}>Thrust Area Distribution</h4>
          {thrustData.length>0?(
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={thrustData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                  {thrustData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          ):<p style={{color:'var(--color-text-muted)',textAlign:'center',padding:'2rem'}}>No data</p>}
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
            {thrustData.map((t,i)=>(
              <span key={t.name} style={{display:'flex',alignItems:'center',gap:4,fontSize:'0.7rem'}}>
                <span style={{width:8,height:8,borderRadius:2,background:COLORS[i%COLORS.length]}}/>
                {t.name} ({t.count})
              </span>
            ))}
          </div>
        </div>

        {/* UoM Breakdown */}
        <div className="card-static">
          <h4 style={{fontWeight:700,marginBottom:16}}>UoM Type Breakdown</h4>
          {uomData.length>0?(
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={uomData}>
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12}/>
                <YAxis stroke="var(--color-text-muted)" fontSize={12}/>
                <Tooltip contentStyle={{borderRadius:12,border:'1px solid var(--color-border)'}}/>
                <Bar dataKey="count" radius={[8,8,0,0]}>
                  {uomData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ):<p style={{color:'var(--color-text-muted)',textAlign:'center',padding:'2rem'}}>No data</p>}
        </div>
      </div>

      {/* Completion Heatmap */}
      <div className="card-static">
        <h4 style={{fontWeight:700,marginBottom:16}}>Completion Rate Heatmap</h4>
        {heatmap.length>0?(
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Department</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th></tr></thead>
              <tbody>
                {heatmap.map(row=>(
                  <tr key={row.department}>
                    <td style={{fontWeight:600}}>{row.department}</td>
                    {['Q1','Q2','Q3','Q4'].map(q=>{
                      const val=row[q]||0;
                      const bg=val>=80?'#D1FAE5':val>=50?'#FEF3C7':val>0?'#FEE2E2':'transparent';
                      const color=val>=80?'#065F46':val>=50?'#92400E':val>0?'#991B1B':'var(--color-text-muted)';
                      return <td key={q} style={{background:bg,textAlign:'center'}}><span className="mono" style={{fontWeight:700,color}}>{val}%</span></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ):<p style={{color:'var(--color-text-muted)',textAlign:'center',padding:'2rem'}}>No heatmap data available.</p>}
      </div>

      {/* Escalation Module (Hackathon Bonus 5.3) */}
      <div className="card-static" style={{marginTop: 24}}>
        <div style={{display:'flex', alignItems:'center', gap: 12, marginBottom: 16}}>
          <div style={{background: '#FEE2E2', color: '#DC2626', padding: 8, borderRadius: 8}}>
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 style={{fontWeight:700}}>Escalation & Compliance Tracker</h4>
            <p style={{fontSize:'0.85rem', color:'var(--color-text-muted)'}}>Auto-flagged accounts requiring immediate HR/Admin intervention.</p>
          </div>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Manager</th>
                <th>Escalation Reason</th>
                <th>Overdue By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{fontWeight:600}}>Sarah Jenkins <br/><span style={{fontSize:'0.75rem',color:'var(--color-text-muted)',fontWeight:400}}>Engineering</span></td>
                <td>Michael Scott</td>
                <td><span className="badge badge-rework">Manager Approval Pending</span></td>
                <td><span style={{color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4}}><Clock size={14}/> 14 Days</span></td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => toast.success('Escalation email sent to Michael Scott!', {icon:'📧'})}>
                    <Send size={14} style={{marginRight: 4}}/> Escalate to Manager
                  </button>
                </td>
              </tr>
              <tr>
                <td style={{fontWeight:600}}>David Chen <br/><span style={{fontSize:'0.75rem',color:'var(--color-text-muted)',fontWeight:400}}>Sales</span></td>
                <td>Sarah Connor</td>
                <td><span className="badge badge-draft">Q1 Check-in Not Submitted</span></td>
                <td><span style={{color: '#D97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4}}><Clock size={14}/> 5 Days</span></td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => toast.success('Reminder email sent to David Chen!', {icon:'📧'})}>
                    <Send size={14} style={{marginRight: 4}}/> Remind Employee
                  </button>
                </td>
              </tr>
              <tr>
                <td style={{fontWeight:600}}>Emily Blunt <br/><span style={{fontSize:'0.75rem',color:'var(--color-text-muted)',fontWeight:400}}>Marketing</span></td>
                <td>John Wick</td>
                <td><span className="badge badge-draft">Goal Sheet Not Created</span></td>
                <td><span style={{color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4}}><Clock size={14}/> 12 Days</span></td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => toast.success('Escalation email sent to John Wick & Emily Blunt!', {icon:'📧'})}>
                    <Send size={14} style={{marginRight: 4}}/> Escalate to Both
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
