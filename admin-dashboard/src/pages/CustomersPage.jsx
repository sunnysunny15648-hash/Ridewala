import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserCheck, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = { true: { bg: '#D1FAE5', text: '#065F46', label: 'Active' }, false: { bg: '#FEE2E2', text: '#991B1B', label: 'Suspended' } };

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const LIMIT = 15;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/customers', { params: { search, page, limit: LIMIT } });
      setCustomers(data.customers);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Could not load customers'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleToggle = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/customers/${id}/status`, { isActive: !currentStatus });
      toast.success(`Customer ${!currentStatus ? 'activated' : 'suspended'}`);
      fetchCustomers();
    } catch { toast.error('Action failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111' }}>Customers</h1>
          <p style={{ color: '#6B7280', fontSize: '0.8rem' }}>{total} total customers</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            style={{ paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', border: '1.5px solid #E5E7EB', borderRadius: '0.625rem', fontSize: '0.875rem', outline: 'none', width: '220px' }}
          />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '0.875rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Customer', 'Email', 'Phone', 'Joined', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ height: '14px', background: '#F3F4F6', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No customers found</td></tr>
              ) : (
                customers.map((c) => {
                  const statusStyle = STATUS_COLORS[c.isActive];
                  return (
                    <tr key={c._id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFF9E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#111111', flexShrink: 0 }}>
                            {c.name?.[0] || '?'}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111111' }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#374151' }}>{c.email}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#374151' }}>{c.phone || '—'}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#6B7280' }}>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ background: statusStyle.bg, color: statusStyle.text, fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: '9999px' }}>{statusStyle.label}</span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <button onClick={() => handleToggle(c._id, c.isActive)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: `1.5px solid ${c.isActive ? '#EF4444' : '#10B981'}`, background: 'transparent', color: c.isActive ? '#EF4444' : '#10B981', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                          {c.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                          {c.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Page {page} of {pages} ({total} total)</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.375rem', borderRadius: '0.5rem', border: '1.5px solid #E5E7EB', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}><ChevronLeft size={16} /></button>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} style={{ padding: '0.375rem', borderRadius: '0.5rem', border: '1.5px solid #E5E7EB', background: 'white', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.4 : 1 }}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

