import React, { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';

const PERIODS = [{ value: 'daily', label: 'Daily (Last 30d)' }, { value: 'weekly', label: 'Weekly (Last 90d)' }, { value: 'monthly', label: 'Monthly (Last 12m)' }];

export default function ReportsPage() {
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState({ revenueData: [], ridesData: [] });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/reports', { params: { period } })
      .then(({ data: d }) => setData(d))
      .catch(() => toast.error('Could not load reports'))
      .finally(() => setLoading(false));
  }, [period]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/admin/reports/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `ridewala-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report exported!');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  // Calculate totals
  const totals = data.revenueData.reduce((acc, d) => ({
    revenue: acc.revenue + (d.revenue || 0),
    commission: acc.commission + (d.commission || 0),
    rides: acc.rides + (d.count || 0),
  }), { revenue: 0, commission: 0, rides: 0 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Reports & Analytics</h1>
          <p style={{ color: '#6B7280', fontSize: '0.8rem' }}>Business performance overview</p>
        </div>
        <button onClick={handleExport} disabled={exporting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', background: '#111111', border: 'none', borderRadius: '0.625rem', color: 'white', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
          {exporting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
          Export CSV
        </button>
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {PERIODS.map((p) => (
          <button key={p.value} onClick={() => setPeriod(p.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: `1.5px solid ${period === p.value ? '#FFC928' : '#E5E7EB'}`, background: period === p.value ? '#FFC928' : 'white', color: period === p.value ? '#111' : '#6B7280', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Revenue', value: `₹${totals.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#10B981' },
          { label: 'Platform Commission', value: `₹${totals.commission.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#6366F1' },
          { label: 'Total Rides', value: totals.rides.toLocaleString(), color: '#F59E0B' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'white', borderRadius: '0.875rem', border: '1px solid #E5E7EB', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500, marginBottom: '0.5rem' }}>{s.label}</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={32} style={{ color: '#FFC928', animation: 'spin 1s linear infinite' }} /></div>
      ) : (
        <>
          {/* Revenue chart */}
          <div style={{ background: 'white', borderRadius: '0.875rem', border: '1px solid #E5E7EB', padding: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Revenue Over Time</h3>
            {data.revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v, n) => [`₹${v}`, n === 'revenue' ? 'Revenue' : 'Commission']} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#FFC928" strokeWidth={2.5} name="Revenue" dot={false} />
                  <Line type="monotone" dataKey="commission" stroke="#6366F1" strokeWidth={2} name="Commission" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.875rem' }}>No data for this period</div>
            )}
          </div>

          {/* Rides chart */}
          <div style={{ background: 'white', borderRadius: '0.875rem', border: '1px solid #E5E7EB', padding: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Rides Overview</h3>
            {data.ridesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.ridesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancelled" fill="#EF4444" name="Cancelled" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.875rem' }}>No data for this period</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

