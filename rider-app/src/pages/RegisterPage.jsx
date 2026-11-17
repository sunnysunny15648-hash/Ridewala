import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ChevronRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = ['Personal', 'Licence', 'Vehicle'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    licenceNumber: '', vehicleRegNumber: '', vehicleModel: '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.name || !form.email || !form.phone || form.password.length < 6) {
        toast.error('Please fill all fields (password min 6 chars)'); return false;
      }
    } else if (step === 1) {
      if (!form.licenceNumber) { toast.error('Licence number is required'); return false; }
    } else {
      if (!form.vehicleRegNumber || !form.vehicleModel) { toast.error('Vehicle details are required'); return false; }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep((s) => s + 1); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      await register(form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  if (submitted) return (
    <div className="app-container flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div style={{background:'#DCFCE7', borderRadius:'9999px', padding:'1.5rem', marginBottom:'1.5rem'}}>
        <CheckCircle size={48} style={{color:'#16A34A'}} />
      </div>
      <h2 className="text-2xl font-bold mb-2" style={{color:'#111111'}}>Application Submitted!</h2>
      <p className="text-gray-500 mb-6">Your captain account is pending review. We'll verify your documents and notify you within 24-48 hours.</p>
      <button onClick={() => navigate('/login')} className="btn-primary">Back to Login</button>
    </div>
  );

  return (
    <div className="app-container flex flex-col min-h-screen">
      <div style={{background:'#111111'}} className="pt-10 pb-6 px-6">
        <h1 style={{color:'#FFC928'}} className="text-2xl font-extrabold">Become a Captain</h1>
        <p className="text-gray-400 text-sm mt-1">Step {step + 1} of 3: {STEPS[step]}</p>
        {/* Progress bar */}
        <div style={{background:'#333', borderRadius:'9999px', height:'4px', marginTop:'1rem'}}>
          <div style={{background:'#FFC928', borderRadius:'9999px', height:'4px', width:`${((step+1)/3)*100}%`, transition:'width 0.3s'}}></div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-4">
        {step === 0 && (
          <>
            {[['name', 'Full Name', 'text', 'Your full name'], ['email', 'Email', 'email', 'captain@example.com'], ['phone', 'Phone Number', 'tel', '10-digit number']].map(([k,l,t,p]) => (
              <div key={k}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                <input type={t} value={form[k]} onChange={(e) => set(k, e.target.value)} placeholder={p} className="input-field" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="At least 6 characters" className="input-field" />
            </div>
          </>
        )}

        {step === 1 && (
          <div>
            <div style={{background:'#FFF9E6', borderRadius:'0.75rem', padding:'0.75rem', marginBottom:'1rem'}}>
              <p className="text-sm font-medium" style={{color:'#111111'}}>📄 Driving Licence Details</p>
              <p className="text-xs text-gray-500 mt-1">Your licence will be verified by our team</p>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Licence Number</label>
            <input value={form.licenceNumber} onChange={(e) => set('licenceNumber', e.target.value)} placeholder="e.g. MH0120210012345" className="input-field" />
          </div>
        )}

        {step === 2 && (
          <>
            <div style={{background:'#FFF9E6', borderRadius:'0.75rem', padding:'0.75rem', marginBottom:'0.5rem'}}>
              <p className="text-sm font-medium" style={{color:'#111111'}}>🏍️ Vehicle Details</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Registration Number</label>
              <input value={form.vehicleRegNumber} onChange={(e) => set('vehicleRegNumber', e.target.value)} placeholder="e.g. MH12AB1234" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle Model</label>
              <input value={form.vehicleModel} onChange={(e) => set('vehicleModel', e.target.value)} placeholder="e.g. Honda Activa 6G" className="input-field" />
            </div>
          </>
        )}

        <div style={{display:'flex', gap:'0.75rem', paddingTop:'0.5rem'}}>
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} style={{flex:1, padding:'0.75rem', border:'2px solid #E5E7EB', borderRadius:'9999px', fontWeight:600, fontSize:'0.875rem', color:'#6B7280'}}>Back</button>
          )}
          {step < 2 ? (
            <button onClick={handleNext} className="btn-primary" style={{flex:1}}>Next <ChevronRight size={16} /></button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{flex:1}}>
              {loading ? <Loader2 size={18} style={{marginRight:'0.5rem'}} /> : null}
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

