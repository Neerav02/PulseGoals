import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { THRUST_AREAS, UOM_TYPES, VALIDATION_RULES } from '../../lib/constants';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export default function GoalSheet() {
  const [sheet, setSheet] = useState(null);
  const [step, setStep] = useState(0); // 0=list, 1=thrust, 2=details, 3=review
  const [form, setForm] = useState({ title:'', description:'', thrustArea:'', uomType:'MIN', target:'', weightage:10 });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadSheet(); }, []);

  const loadSheet = async () => {
    try { setSheet(await api.getGoalSheet()); } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const goals = sheet?.goals || [];
  const totalW = goals.reduce((s,g) => s + g.weightage, 0);
  const remainW = VALIDATION_RULES.TOTAL_WEIGHTAGE - totalW;
  const canAdd = goals.length < VALIDATION_RULES.MAX_GOALS && sheet?.status !== 'APPROVED';

  const resetForm = () => { setForm({ title:'', description:'', thrustArea:'', uomType:'MIN', target:'', weightage:10 }); setEditId(null); setAiResult(null); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) { await api.updateGoal(editId, form); }
      else { await api.createGoal(form); }
      await loadSheet(); setStep(0); resetForm();
    } catch(e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try { await api.deleteGoal(id); await loadSheet(); } catch(e) { alert(e.message); }
  };

  const handleSubmit = async () => {
    if (Math.abs(totalW - 100) > 0.01) { alert(`Total weightage must be exactly 100%. Current: ${totalW}%`); return; }
    if (!confirm('Submit goals for manager approval?')) return;
    try { 
      await api.submitGoals(); 
      await loadSheet(); 
      toast.success('Email & Teams notification sent to Manager!', { duration: 5000, icon: '📧' });
    } catch(e) { alert(e.message); }
  };

  const handleAiReview = async () => {
    setAiLoading(true);
    try { setAiResult(await api.reviewGoal(form.title, form.description)); }
    catch(e) { console.error(e); }
    finally { setAiLoading(false); }
  };

  const startEdit = (g) => {
    setForm({ title:g.title, description:g.description||'', thrustArea:g.thrustArea, uomType:g.uomType, target:g.target, weightage:g.weightage });
    setEditId(g.id); setStep(2);
  };

  if (loading) return <div className="page-enter">{[1,2,3].map(i=><div key={i} className="skeleton" style={{height:120,marginBottom:16}}/>)}</div>;

  // Step 0: Goal List
  if (step === 0) return (
    <div className="page-enter">
      {/* Weightage Bar */}
      <div className="card-static" style={{marginBottom:24,display:'flex',alignItems:'center',gap:20}}>
        <div style={{flex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:'0.8rem',fontWeight:600}}>Total Weightage</span>
            <span className="mono" style={{fontSize:'0.85rem',fontWeight:700,color:totalW===100?'var(--color-accent-3)':totalW>100?'#EF4444':'var(--color-accent-1)'}}>{totalW}%</span>
          </div>
          <div className="progress-bar-track" style={{height:10}}>
            <div className={`progress-bar-fill shimmer ${totalW===100?'success':''}`} style={{width:`${Math.min(totalW,100)}%`}}/>
          </div>
          <p style={{fontSize:'0.7rem',color:'var(--color-text-muted)',marginTop:4}}>{remainW>0?`${remainW}% remaining`:'✓ Fully allocated'}</p>
        </div>
        <div style={{textAlign:'center',padding:'0 16px',borderLeft:'1px solid var(--color-border)'}}>
          <p className="mono" style={{fontSize:'1.5rem',fontWeight:700}}>{goals.length}<span style={{color:'var(--color-text-muted)',fontSize:'0.9rem'}}>/{VALIDATION_RULES.MAX_GOALS}</span></p>
          <p style={{fontSize:'0.7rem',color:'var(--color-text-muted)'}}>Goals</p>
        </div>
      </div>

      {/* Actions */}
      <div style={{display:'flex',gap:12,marginBottom:20}}>
        {canAdd && <button className="btn btn-primary" onClick={()=>{resetForm();setStep(1);}}>+ Add Goal</button>}
        {goals.length>0 && totalW===100 && sheet?.status!=='APPROVED' && sheet?.status!=='SUBMITTED' && (
          <button className="btn btn-success" onClick={handleSubmit}>🚀 Submit for Approval</button>
        )}
      </div>

      {/* Goals */}
      {goals.length===0?(
        <div className="card-static" style={{textAlign:'center',padding:'3rem'}}>
          <div style={{fontSize:'3rem',marginBottom:12}}>🎯</div>
          <h3 style={{fontFamily:'var(--font-display)',marginBottom:8}}>Start Building Your Goals</h3>
          <p style={{color:'var(--color-text-muted)',marginBottom:16}}>Add up to 8 goals totaling 100% weightage</p>
          <button className="btn btn-primary" onClick={()=>{resetForm();setStep(1);}}>+ Add First Goal</button>
        </div>
      ):(
        <div style={{display:'grid',gap:12}}>
          {goals.map((g,i)=>(
            <div key={g.id} className="card" style={{display:'flex',alignItems:'center',gap:16}}>
              <div className="mono" style={{width:36,height:36,borderRadius:'var(--radius-md)',background:'var(--color-bg-secondary)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,flexShrink:0}}>{i+1}</div>
              <div style={{flex:1,minWidth:0}}>
                <h4 style={{fontSize:'0.9rem',fontWeight:600}}>{g.isShared&&'🔗 '}{g.title}</h4>
                <div style={{display:'flex',gap:12,fontSize:'0.75rem',color:'var(--color-text-muted)',marginTop:4}}>
                  <span>{g.thrustArea}</span><span className="mono">{g.weightage}%</span><span>{g.uomType} → {g.target}</span>
                </div>
              </div>
              {sheet?.status!=='APPROVED'&&!g.isShared&&(
                <div style={{display:'flex',gap:6}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>startEdit(g)}>✏️</button>
                  <button className="btn btn-ghost btn-sm" onClick={()=>handleDelete(g.id)}>🗑️</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Step 1: Thrust Area Selection
  if (step === 1) return (
    <div className="page-enter">
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <button className="btn btn-ghost" onClick={()=>{setStep(0);resetForm();}}>← Back</button>
        <div><h3 style={{fontFamily:'var(--font-display)'}}>Step 1: Choose Thrust Area</h3><p style={{fontSize:'0.8rem',color:'var(--color-text-muted)'}}>Select the strategic area for your goal</p></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
        {THRUST_AREAS.map(ta=>(
          <div key={ta.id} className="card" onClick={()=>{setForm(f=>({...f,thrustArea:ta.label}));setStep(2);}}
            style={{cursor:'pointer',textAlign:'center',borderColor:form.thrustArea===ta.label?ta.color:'var(--color-border)',borderWidth:form.thrustArea===ta.label?2:1}}>
            <div style={{fontSize:'2rem',marginBottom:8}}>{ta.icon}</div>
            <p style={{fontWeight:600,fontSize:'0.85rem'}}>{ta.label}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // Step 2: Goal Details
  if (step === 2) return (
    <div className="page-enter">
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <button className="btn btn-ghost" onClick={()=>setStep(editId?0:1)}>← Back</button>
        <div><h3 style={{fontFamily:'var(--font-display)'}}>Step 2: Goal Details</h3><p style={{fontSize:'0.8rem',color:'var(--color-text-muted)'}}>Define your goal specifics</p></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:24}}>
        <div className="card-static">
          <div style={{marginBottom:16}}>
            <label className="input-label">Goal Title *</label>
            <input className="input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g., Increase Q3 Revenue by 20%" maxLength={100}/>
            <p style={{fontSize:'0.65rem',color:'var(--color-text-muted)',marginTop:4}}>{form.title.length}/100</p>
          </div>
          <div style={{marginBottom:16}}>
            <label className="input-label">Description *</label>
            <textarea className="textarea" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Describe what success looks like..." rows={3}/>
            {form.title && form.description.length>=10 && (
              <button className="btn btn-outline btn-sm" style={{marginTop:8}} onClick={handleAiReview} disabled={aiLoading}>
                {aiLoading?'Reviewing...':'✨ Review with AI'}
              </button>
            )}
          </div>
          {aiResult && (
            <div style={{background:'#FEFCE8',border:'1px solid #FDE68A',borderRadius:'var(--radius-md)',padding:16,marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span style={{fontWeight:700,fontSize:'0.85rem'}}>✨ AI Review</span>
                <span className={`badge ${aiResult.verdict==='Strong'?'badge-completed':aiResult.verdict==='Weak'?'badge-rework':'badge-submitted'}`}>{aiResult.verdict}</span>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {aiResult.suggestions?.map((s,i)=>(
                  <div key={i} style={{background:'white',border:'1px solid #FDE68A',borderRadius:'var(--radius-full)',padding:'4px 12px',fontSize:'0.75rem'}}>💡 {s}</div>
                ))}
              </div>
            </div>
          )}
          <div style={{marginBottom:16}}>
            <label className="input-label">Unit of Measurement</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
              {UOM_TYPES.map(u=>(
                <div key={u.value} className="card" onClick={()=>setForm(f=>({...f,uomType:u.value}))}
                  style={{cursor:'pointer',padding:12,borderColor:form.uomType===u.value?'var(--color-accent-1)':'var(--color-border)',borderWidth:form.uomType===u.value?2:1}}>
                  <span style={{fontSize:'1.2rem'}}>{u.icon}</span>
                  <p style={{fontWeight:600,fontSize:'0.8rem',marginTop:4}}>{u.label}</p>
                  <p style={{fontSize:'0.65rem',color:'var(--color-text-muted)'}}>{u.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div>
              <label className="input-label">Target {form.uomType==='TIMELINE'?'(Deadline Date)':'(Value)'}</label>
              <input className="input" type={form.uomType==='TIMELINE'?'date':'text'} value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))} placeholder={form.uomType==='ZERO'?'0':'500000'}/>
            </div>
            <div>
              <label className="input-label">Weightage (%)</label>
              <input className="input" type="number" min={10} max={100} value={form.weightage} onChange={e=>setForm(f=>({...f,weightage:parseFloat(e.target.value)||0}))}/>
              {form.weightage<10&&<p style={{color:'#EF4444',fontSize:'0.7rem',marginTop:4}}>Min 10% required</p>}
            </div>
          </div>
          <div style={{marginTop:20,display:'flex',gap:12}}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving||!form.title||form.description.length<10||!form.target||form.weightage<10}>
              {saving?'Saving...':editId?'Update Goal':'Save Goal'}
            </button>
            <button className="btn btn-ghost" onClick={()=>{setStep(0);resetForm();}}>Cancel</button>
          </div>
        </div>
        {/* Sticky Sidebar */}
        <div style={{position:'sticky',top:100,alignSelf:'start'}}>
          <div className="card-static">
            <h4 style={{fontWeight:700,fontSize:'0.85rem',marginBottom:12}}>Weightage Summary</h4>
            {goals.map((g,i)=>(
              <div key={g.id} style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',padding:'4px 0',borderBottom:'1px solid var(--color-border)'}}>
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160}}>{g.title}</span>
                <span className="mono" style={{fontWeight:600}}>{g.weightage}%</span>
              </div>
            ))}
            {!editId&&<div style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',padding:'4px 0',color:'var(--color-accent-1)',fontWeight:600}}>
              <span>+ New goal</span><span className="mono">{form.weightage}%</span>
            </div>}
            <div style={{marginTop:8,paddingTop:8,borderTop:'2px solid var(--color-border)',display:'flex',justifyContent:'space-between',fontWeight:700}}>
              <span>Total</span>
              <span className="mono" style={{color:totalW+(editId?0:form.weightage)===100?'var(--color-accent-3)':'var(--color-accent-1)'}}>
                {totalW+(editId?0:form.weightage)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return null;
}
