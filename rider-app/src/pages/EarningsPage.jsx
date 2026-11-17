import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { rideService } from '../services/ride.service';
import toast from 'react-hot-toast';

const PERIODS = ['daily', 'weekly', 'monthly'];
const PERIOD_LABELS = { daily: 'Today', weekly: 'This Week', monthly: 'This Month' };

export default function EarningsPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    rideService.getEarnings(period)
      .then((r) => setData(r.data))
      .catch(() => toast.error('Could not load earnings'))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F9FAFB' }}>
      <div style={{ background: '#111111', paddingTop: '2.5rem', paddingBottom: '1.25rem', paddingLeft: '1.25rem', paddingRight: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <button onClick={() => navigate('/')} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#333', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ color: 'white', fontWeight: 700 }}>My Earnings</h1>
        </div>

        {/* Period tabs */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {PERIODS.map((p) => (
            <button key={p} onClick={() => setPeriod(p)} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: period === p ? '#FFC928' : '#333', color: period === p ? '#111111' : '#9CA3AF', fontWeight: 600, fontSize: '0.75rem' }}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '1rem', paddingBottom: '5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Loader2 size={32} style={{ color: '#FFC928', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              {[
                { label: 'Gross Earnings', value: `₹${data?.totalEarnings || 0}`, color: '#FFF9E6', icon: '💰' },
                { label: 'Commission', value: `₹${data?.totalCommission || 0}`, color: '#FFF1F2', icon: '📊' },
                { label: 'Net Earnings', value: `₹${data?.netEarnings || 0}`, color: '#F0FFF4', icon: '✅' },
                { label: 'Total Rides', value: data?.rideCount || 0, color: '#EFF6FF', icon: '🏍️' },
              ].map((s) => (
                <div key={s.label} style={{ background: s.color, borderRadius: '0.75rem', padding: '0.875rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111', marginTop: '0.25rem' }}>{s.value}</p>
                  <p style={{ fontSize: '0.7rem', color: '#6B7280' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Ride breakdown */}
            <h3 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111111', marginBottom: '0.75rem' }}>Ride Breakdown</h3>
            {(data?.rides || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📊</span>
                <p style={{ fontSize: '0.875rem' }}>No rides in this period</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(data?.rides || []).map((r) => (
                  <div key={r._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111111' }}>{r.destinationAddress?.split(',')[0]}</p>
                      <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, color: '#16A34A' }}>₹{r.riderEarnings || Math.round((r.actualFare || r.estimatedFare) * 0.8)}</p>
                      <p style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>of ₹{r.actualFare || r.estimatedFare}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: 'white', borderTop: '1px solid #F3F4F6', display: 'flex' }}>
        {[{ label: 'Dashboard', path: '/', icon: '🏠' }, { label: 'Earnings', path: '/earnings', icon: '💰', active: true }, { label: 'Profile', path: '/profile', icon: '👤' }].map((tab) => (
          <button key={tab.path} onClick={() => navigate(tab.path)} style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', border: 'none', background: tab.active ? '#FFF9E6' : 'transparent', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: tab.active ? '#FFC928' : '#9CA3AF' }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

