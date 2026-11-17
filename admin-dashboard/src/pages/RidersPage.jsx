import React, { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, XCircle, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Suspended', value: 'suspended' },
];

export default function RidersPage() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [updating, setUpdating] = useState(null);

  const fetchRiders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/riders', { params: { search, approval: filter, page, limit: 15 } });
      setRiders(data.riders);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Could not load riders'); }
    finally { setLoading(false); }
  }, [search, filter, page]);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  const handleAction = async (id, action) => {
    setUpdating(id);
    try {
      await api.patch(`/admin/riders/${id}/approval`, { action });
      toast.success(`Rider ${action}d`);
      fetchRiders();
    } catch { toast.error('Action failed'); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Riders</h1>
          <p style={{ color: '#6B7280', fontSize: '0.8rem' }}>{total} total riders</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search riders..."
            style={{ paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', border: '1.5px solid #E5E7EB', borderRadius: '0.625rem', fontSize: '0.875rem', outline: 'none', width: '220px' }} />
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
            style={{ padding: '0.375rem 0.875rem', borderRadius: '9999px', border: `1.5px solid ${filter === f.value ? '#FFC928' : '#E5E7EB'}`, background: filter === f.value ? '#FFC928' : 'white', color: filter === f.value ? '#111111' : '#6B7280', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '0.875rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Rider', 'Contact', 'Vehicle', 'Rating', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    {Array(6).fill(0).map((_, j) => <td key={j} style={{ padding: '0.875rem 1rem' }}><div style={{ height: '14px', background: '#F3F4F6', borderRadius: '4px' }}></div></td>)}
                  </tr>
                ))
              ) : riders.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No riders found</td></tr>
              ) : (
                riders.map((r) => (
                  <tr key={r._id} style={{ borderBottom: '1px solid #F3F4F6' }} onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>
                          {r.name?.[0] || '?'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.name}</p>
                          <p style={{ fontSize: '0.7rem', color: '#6B7280' }}>Joined {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontSize: '0.8rem' }}>{r.email}</p>
                      <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{r.phone || '—'}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 500 }}>{r.vehicleModel || '—'}</p>
                      <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{r.vehicleRegNumber || '—'}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star size={13} style={{ color: '#FFC928' }} fill="#FFC928" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{r.rating?.toFixed(1) || '5.0'}</span>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{r.totalRides || 0} rides</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: '9999px',
                        background: !r.isActive ? '#FEE2E2' : r.isApproved ? '#D1FAE5' : '#FEF3C7',
                        color: !r.isActive ? '#991B1B' : r.isApproved ? '#065F46' : '#92400E'
                      }}>
                        {!r.isActive ? 'Suspended' : r.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {!r.isApproved && r.isActive && (
                          <button onClick={() => handleAction(r._id, 'approve')} disabled={updating === r._id}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.625rem', borderRadius: '0.5rem', border: '1.5px solid #10B981', background: 'transparent', color: '#10B981', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                            <CheckCircle size={13} /> Approve
                          </button>
                        )}
                        {!r.isApproved && r.isActive && (
                          <button onClick={() => handleAction(r._id, 'reject')} disabled={updating === r._id}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.625rem', borderRadius: '0.5rem', border: '1.5px solid #EF4444', background: 'transparent', color: '#EF4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                            <XCircle size={13} /> Reject
                          </button>
                        )}
                        {r.isApproved && r.isActive && (
                          <button onClick={() => handleAction(r._id, 'suspend')} disabled={updating === r._id}
                            style={{ padding: '0.375rem 0.625rem', borderRadius: '0.5rem', border: '1.5px solid #F97316', background: 'transparent', color: '#F97316', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                            Suspend
                          </button>
                        )}
                        {!r.isActive && (
                          <button onClick={() => handleAction(r._id, 'activate')} disabled={updating === r._id}
                            style={{ padding: '0.375rem 0.625rem', borderRadius: '0.5rem', border: '1.5px solid #3B82F6', background: 'transparent', color: '#3B82F6', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Page {page} of {pages}</span>
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

