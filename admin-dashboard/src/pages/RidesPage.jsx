import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  searching: { bg: '#FEF3C7', text: '#92400E' },
  assigned: { bg: '#DBEAFE', text: '#1E40AF' },
  arriving: { bg: '#EDE9FE', text: '#5B21B6' },
  arrived: { bg: '#D1FAE5', text: '#065F46' },
  started: { bg: '#E0F2FE', text: '#0369A1' },
  completed: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

const STATUSES = ['', 'searching', 'assigned', 'arriving', 'arrived', 'started', 'completed', 'cancelled'];

export default function RidesPage() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState(null);

  const fetchRides = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/rides', { params: { status, page, limit: 15 } });
      setRides(data.rides);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Could not load rides'); }
    finally { setLoading(false); }
  }, [status, page]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Rides</h1>
          <p style={{ color: '#6B7280', fontSize: '0.8rem' }}>{total} total rides</p>
        </div>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            style={{ padding: '0.3rem 0.75rem', borderRadius: '9999px', border: `1.5px solid ${status === s ? '#FFC928' : '#E5E7EB'}`, background: status === s ? '#FFC928' : 'white', color: status === s ? '#111' : '#6B7280', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', textTransform: 'capitalize' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setSelected(null)}>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '480px', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Ride Details</h3>
            {[
              ['Ride ID', selected._id],
              ['Customer', selected.customerId?.name + ' (' + selected.customerId?.phone + ')'],
              ['Rider', selected.riderId?.name || 'Unassigned'],
              ['Pickup', selected.pickupAddress],
              ['Destination', selected.destinationAddress],
              ['Distance', selected.distance + ' km'],
              ['Estimated Fare', '₹' + selected.estimatedFare],
              ['Actual Fare', selected.actualFare ? '₹' + selected.actualFare : '—'],
              ['Payment Method', selected.paymentMethod],
              ['Status', selected.status],
              ['Date', new Date(selected.createdAt).toLocaleString('en-IN')],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6', fontSize: '0.875rem' }}>
                <span style={{ color: '#6B7280', fontWeight: 500 }}>{k}</span>
                <span style={{ fontWeight: 600, color: '#111', textAlign: 'right', maxWidth: '55%', wordBreak: 'break-word' }}>{v}</span>
              </div>
            ))}
            <button onClick={() => setSelected(null)} style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', background: '#111', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '0.875rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Customer', 'Rider', 'Route', 'Fare', 'Status', 'Date', ''].map((h) => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    {Array(7).fill(0).map((_, j) => <td key={j} style={{ padding: '0.875rem 1rem' }}><div style={{ height: '12px', background: '#F3F4F6', borderRadius: '4px' }}></div></td>)}
                  </tr>
                ))
              ) : rides.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No rides found</td></tr>
              ) : (
                rides.map((r) => {
                  const sc = STATUS_COLORS[r.status] || { bg: '#F3F4F6', text: '#374151' };
                  return (
                    <tr key={r._id} style={{ borderBottom: '1px solid #F3F4F6' }} onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 500 }}>{r.customerId?.name || '—'}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#374151' }}>{r.riderId?.name || 'Unassigned'}</td>
                      <td style={{ padding: '0.875rem 1rem', maxWidth: '200px' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.pickupAddress?.split(',')[0]}</p>
                        <p style={{ fontSize: '0.75rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>→ {r.destinationAddress?.split(',')[0]}</p>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 700 }}>₹{r.actualFare || r.estimatedFare}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ background: sc.bg, color: sc.text, fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: '9999px', textTransform: 'capitalize' }}>{r.status}</span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: '#6B7280', whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <button onClick={() => setSelected(r)} style={{ padding: '0.375rem', borderRadius: '0.5rem', border: '1.5px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6B7280' }}>
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Page {page} of {pages} ({total} total)</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.375rem', borderRadius: '0.5rem', border: '1.5px solid #E5E7EB', background: 'white', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}><ChevronLeft size={16} /></button>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} style={{ padding: '0.375rem', borderRadius: '0.5rem', border: '1.5px solid #E5E7EB', background: 'white', cursor: 'pointer', opacity: page === pages ? 0.4 : 1 }}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

