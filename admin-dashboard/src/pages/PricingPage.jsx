import React, { useState, useEffect } from 'react';
import { Save, Loader2, Info } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const FIELDS = [
  { key: 'baseFare', label: 'Base Fare', unit: '₹', desc: 'Starting fare for every ride' },
  { key: 'perKmCharge', label: 'Per KM Charge', unit: '₹/km', desc: 'Added for every kilometre travelled' },
  { key: 'minimumFare', label: 'Minimum Fare', unit: '₹', desc: 'Minimum fare regardless of distance' },
  { key: 'waitingChargePerMin', label: 'Waiting Charge', unit: '₹/min', desc: 'Charged per minute while waiting' },
  { key: 'commissionPercent', label: 'Platform Commission', unit: '%', desc: 'Percentage RideWala earns from each ride' },
];

export default function PricingPage() {
  const [_pricing, setPricing] = useState({});
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    api.get('/admin/pricing')
      .then(({ data }) => { setPricing(data.pricing); setForm(data.pricing); })
      .catch(() => toast.error('Could not load pricing'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/admin/pricing', form);
      setPricing(data.pricing);
      setConfirm(false);
      toast.success('Pricing updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update pricing');
    } finally { setSaving(false); }
  };

  // Live preview
  const previewFare = () => {
    const dist = 5;
    const base = parseFloat(form.baseFare) || 20;
    const perKm = parseFloat(form.perKmCharge) || 8;
    const min = parseFloat(form.minimumFare) || 30;
    return Math.max(base + dist * perKm, min).toFixed(2);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={32} style={{ color: '#FFC928', animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div style={{ maxWidth: '640px' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pricing Settings</h1>
        <p style={{ color: '#6B7280', fontSize: '0.8rem' }}>Configure fare calculation for all rides</p>
      </div>

      {/* Live preview */}
      <div style={{ background: '#FFF9E6', border: '1.5px solid #FFC928', borderRadius: '0.875rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Info size={16} style={{ color: '#92400E' }} />
          <p style={{ fontWeight: 700, color: '#92400E', fontSize: '0.875rem' }}>Fare Preview (5 km ride)</p>
        </div>
        <p style={{ fontSize: '2rem', fontWeight: 800, color: '#111111' }}>₹{previewFare()}</p>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
          ₹{form.baseFare} base + (5 × ₹{form.perKmCharge}) = ₹{((parseFloat(form.baseFare)||20) + 5*(parseFloat(form.perKmCharge)||8)).toFixed(2)} → min ₹{form.minimumFare}
        </p>
      </div>

      {/* Form */}
      <div style={{ background: 'white', borderRadius: '0.875rem', border: '1px solid #E5E7EB', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: '#111111' }}>{field.label}</label>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>{field.desc}</p>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form[field.key] || ''}
                onChange={(e) => setForm((f) => ({ ...f, [field.key]: parseFloat(e.target.value) }))}
                style={{ width: '100%', padding: '0.75rem 3.5rem 0.75rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 600, outline: 'none' }}
              />
              <span style={{ position: 'absolute', right: '1rem', color: '#9CA3AF', fontSize: '0.8rem', fontWeight: 600 }}>{field.unit}</span>
            </div>
          </div>
        ))}

        {!confirm ? (
          <button onClick={() => setConfirm(true)} style={{ padding: '0.875rem', background: '#FFC928', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Save size={18} /> Save Pricing
          </button>
        ) : (
          <div style={{ background: '#FEF3C7', border: '1.5px solid #FCD34D', borderRadius: '0.75rem', padding: '1rem' }}>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: '#92400E' }}>⚠️ This will update fares for all new rides. Confirm?</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setConfirm(false)} style={{ flex: 1, padding: '0.625rem', border: '1.5px solid #E5E7EB', borderRadius: '0.625rem', background: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '0.625rem', background: '#10B981', border: 'none', borderRadius: '0.625rem', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                {saving ? 'Saving...' : '✓ Confirm Update'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

