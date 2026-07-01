import { useEffect, useState } from 'react';
import api from '../api/axios';

const STATUS_LABELS = {
  pending: { label: 'Menunggu', color: '#f59e0b', bg: '#fef3c7' },
  approved: { label: 'Disetujui', color: '#10b981', bg: '#d1fae5' },
  rejected: { label: 'Ditolak', color: '#ef4444', bg: '#fee2e2' },
};

const ISSUE_STATUS = {
  pending: { label: 'Baru', color: '#f59e0b', bg: '#fef3c7' },
  in_progress: { label: 'Diproses', color: '#3b82f6', bg: '#dbeafe' },
  resolved: { label: 'Selesai', color: '#10b981', bg: '#d1fae5' },
};

function BadgeStatus({ status, type = 'store' }) {
  const map = type === 'issue' ? ISSUE_STATUS : STATUS_LABELS;
  const s = map[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.color,
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '0.78rem',
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
}

/* ─── Tab Button ─── */
function TabButton({ active, label, icon, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        borderRadius: '12px 12px 0 0',
        border: 'none',
        borderBottom: active ? '3px solid #c90045' : '3px solid transparent',
        backgroundColor: active ? 'white' : '#f9fafb',
        color: active ? '#c90045' : '#6b7280',
        fontWeight: 700,
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {icon} {label}
      {badge > 0 && (
        <span
          style={{
            background: '#c90045',
            color: 'white',
            borderRadius: 999,
            padding: '1px 8px',
            fontSize: '0.72rem',
            fontWeight: 700,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stores');

  // ─── Store State ───
  const [stores, setStores] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [storeLoading, setStoreLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // ─── Issue State ───
  const [issues, setIssues] = useState([]);
  const [issueFilter, setIssueFilter] = useState('all');
  const [issueLoading, setIssueLoading] = useState(true);
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Fetch Stores ───
  const fetchStores = async () => {
    setStoreLoading(true);
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const res = await api.get('/stores/admin/all', { params });
      setStores(res.data.data);
    } catch {
      showToast('Gagal memuat data toko', 'error');
    } finally {
      setStoreLoading(false);
    }
  };

  // ─── Fetch Issues ───
  const fetchIssues = async () => {
    setIssueLoading(true);
    try {
      const params = issueFilter !== 'all' ? { status: issueFilter } : {};
      const res = await api.get('/contacts', { params });
      setIssues(res.data.data);
    } catch {
      showToast('Gagal memuat data pengaduan', 'error');
    } finally {
      setIssueLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueFilter]);

  // ─── Store Actions ───
  const handleStatus = async (storeId, newStatus) => {
    setActionLoading(storeId + newStatus);
    try {
      await api.patch(`/stores/${storeId}/status`, { status: newStatus });
      showToast(
        newStatus === 'approved'
          ? 'Toko berhasil disetujui! ✅'
          : newStatus === 'rejected'
          ? 'Toko ditolak ❌'
          : 'Status toko diperbarui',
        'success'
      );
      fetchStores();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memperbarui status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Issue Actions ───
  const handleIssueStatus = async (issueId, newStatus) => {
    try {
      await api.patch(`/contacts/${issueId}`, { status: newStatus });
      showToast('Status pengaduan diperbarui ✅');
      fetchIssues();
    } catch {
      showToast('Gagal memperbarui status', 'error');
    }
  };

  const handleReplySubmit = async (issueId) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      await api.patch(`/contacts/${issueId}`, { adminReply: replyText, status: 'resolved' });
      showToast('Balasan berhasil dikirim & pengaduan diselesaikan ✅');
      setReplyingId(null);
      setReplyText('');
      fetchIssues();
    } catch {
      showToast('Gagal mengirim balasan', 'error');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!confirm('Yakin ingin menghapus pengaduan ini?')) return;
    try {
      await api.delete(`/contacts/${issueId}`);
      showToast('Pengaduan berhasil dihapus');
      fetchIssues();
    } catch {
      showToast('Gagal menghapus pengaduan', 'error');
    }
  };

  const pendingStores = stores.filter((s) => s.status === 'pending').length;
  const pendingIssues = issues.filter((i) => i.status === 'pending').length;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minHeight: '60vh' }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 10,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            fontWeight: 600,
            fontSize: '0.9rem',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
          🛠️ Admin Dashboard
        </h1>
        <p style={{ color: '#6b7280', marginTop: 4, fontSize: '0.9rem' }}>
          Kelola pengajuan toko & pengaduan pengguna
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
        <TabButton
          active={activeTab === 'stores'}
          label="Pengajuan Toko"
          icon="🏪"
          badge={pendingStores}
          onClick={() => setActiveTab('stores')}
        />
        <TabButton
          active={activeTab === 'issues'}
          label="Pengaduan User"
          icon="📩"
          badge={pendingIssues}
          onClick={() => setActiveTab('issues')}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TAB: PENGAJUAN TOKO */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'stores' && (
        <>
          {/* Stats Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 12,
              marginBottom: 24,
            }}
          >
            {[
              { label: 'Total Toko', value: stores.length, color: '#c90045', icon: '🏪' },
              { label: 'Menunggu', value: stores.filter((s) => s.status === 'pending').length, color: '#f59e0b', icon: '⏳' },
              { label: 'Disetujui', value: stores.filter((s) => s.status === 'approved').length, color: '#10b981', icon: '✅' },
              { label: 'Ditolak', value: stores.filter((s) => s.status === 'rejected').length, color: '#ef4444', icon: '❌' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: '16px 20px',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
                  borderLeft: `4px solid ${stat.color}`,
                }}
              >
                <div style={{ fontSize: '1.4rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {['all', 'pending', 'approved', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 999,
                  border: '2px solid',
                  borderColor: filterStatus === s ? '#c90045' : '#e5e7eb',
                  backgroundColor: filterStatus === s ? '#c90045' : 'white',
                  color: filterStatus === s ? 'white' : '#374151',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {s === 'all' ? 'Semua' : STATUS_LABELS[s]?.label}
                {s === 'pending' && pendingStores > 0 && (
                  <span
                    style={{
                      marginLeft: 6,
                      background: filterStatus === 'pending' ? 'white' : '#c90045',
                      color: filterStatus === 'pending' ? '#c90045' : 'white',
                      borderRadius: 999,
                      padding: '1px 7px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {pendingStores}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={fetchStores}
              style={{
                marginLeft: 'auto',
                padding: '7px 16px',
                borderRadius: 999,
                border: '2px solid #e5e7eb',
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {/* Table */}
          {storeLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: '1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
              Memuat data...
            </div>
          ) : stores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🏪</div>
              Tidak ada toko ditemukan
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: 'white',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    {['Toko', 'Pemilik', 'Kontak', 'Status', 'Terdaftar', 'Aksi'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store, idx) => (
                    <tr
                      key={store.id}
                      style={{
                        borderBottom: idx < stores.length - 1 ? '1px solid #f3f4f6' : 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fdf2f8')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {store.logoUrl ? (
                            <img
                              src={store.logoUrl}
                              alt={store.name}
                              style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 40, height: 40, borderRadius: 8,
                                background: '#fce7f3',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem',
                              }}
                            >
                              🏪
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>
                              {store.name}
                            </div>
                            <div style={{ color: '#9ca3af', fontSize: '0.78rem' }}>
                              {store.address || 'Alamat belum diisi'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 500, color: '#374151', fontSize: '0.88rem' }}>
                          {store.owner?.name || '-'}
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{store.owner?.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: '0.85rem' }}>
                        {store.phone || '-'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <BadgeStatus status={store.status} />
                      </td>
                      <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: '0.82rem' }}>
                        {new Date(store.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {store.status !== 'approved' && (
                            <button
                              disabled={!!actionLoading}
                              onClick={() => handleStatus(store.id, 'approved')}
                              style={{
                                padding: '6px 14px', borderRadius: 8, border: 'none',
                                backgroundColor: '#10b981', color: 'white',
                                fontWeight: 600, fontSize: '0.8rem',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                opacity: actionLoading === store.id + 'approved' ? 0.6 : 1,
                                transition: 'opacity 0.2s',
                              }}
                            >
                              {actionLoading === store.id + 'approved' ? '...' : '✅ Setujui'}
                            </button>
                          )}
                          {store.status !== 'rejected' && (
                            <button
                              disabled={!!actionLoading}
                              onClick={() => handleStatus(store.id, 'rejected')}
                              style={{
                                padding: '6px 14px', borderRadius: 8, border: 'none',
                                backgroundColor: '#ef4444', color: 'white',
                                fontWeight: 600, fontSize: '0.8rem',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                opacity: actionLoading === store.id + 'rejected' ? 0.6 : 1,
                                transition: 'opacity 0.2s',
                              }}
                            >
                              {actionLoading === store.id + 'rejected' ? '...' : '❌ Tolak'}
                            </button>
                          )}
                          {store.status !== 'pending' && (
                            <button
                              disabled={!!actionLoading}
                              onClick={() => handleStatus(store.id, 'pending')}
                              style={{
                                padding: '6px 14px', borderRadius: 8,
                                border: '1px solid #e5e7eb',
                                backgroundColor: 'white', color: '#6b7280',
                                fontWeight: 600, fontSize: '0.8rem',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                              }}
                            >
                              ↩ Reset
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TAB: PENGADUAN USER */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'issues' && (
        <>
          {/* Stats Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 12,
              marginBottom: 24,
            }}
          >
            {[
              { label: 'Total Pengaduan', value: issues.length, color: '#c90045', icon: '📩' },
              { label: 'Baru', value: issues.filter((i) => i.status === 'pending').length, color: '#f59e0b', icon: '🆕' },
              { label: 'Diproses', value: issues.filter((i) => i.status === 'in_progress').length, color: '#3b82f6', icon: '🔄' },
              { label: 'Selesai', value: issues.filter((i) => i.status === 'resolved').length, color: '#10b981', icon: '✅' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: '16px 20px',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
                  borderLeft: `4px solid ${stat.color}`,
                }}
              >
                <div style={{ fontSize: '1.4rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {['all', 'pending', 'in_progress', 'resolved'].map((s) => (
              <button
                key={s}
                onClick={() => setIssueFilter(s)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 999,
                  border: '2px solid',
                  borderColor: issueFilter === s ? '#c90045' : '#e5e7eb',
                  backgroundColor: issueFilter === s ? '#c90045' : 'white',
                  color: issueFilter === s ? 'white' : '#374151',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {s === 'all' ? 'Semua' : ISSUE_STATUS[s]?.label}
              </button>
            ))}
            <button
              onClick={fetchIssues}
              style={{
                marginLeft: 'auto',
                padding: '7px 16px',
                borderRadius: 999,
                border: '2px solid #e5e7eb',
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {/* Issue Cards */}
          {issueLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
              Memuat pengaduan...
            </div>
          ) : issues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📭</div>
              Tidak ada pengaduan ditemukan
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  style={{
                    background: 'white',
                    borderRadius: 14,
                    padding: '20px 24px',
                    boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
                    borderLeft: `4px solid ${
                      issue.status === 'pending' ? '#f59e0b'
                        : issue.status === 'in_progress' ? '#3b82f6' : '#10b981'
                    }`,
                  }}
                >
                  {/* Issue Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1f2937' }}>
                          {issue.subject || 'Tanpa Subjek'}
                        </span>
                        <BadgeStatus status={issue.status} type="issue" />
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: '0.82rem', color: '#9ca3af' }}>
                        <span>👤 {issue.name}</span>
                        <span>📧 {issue.email}</span>
                        <span>📅 {new Date(issue.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteIssue(issue.id)}
                      title="Hapus pengaduan"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '1.1rem', color: '#d1d5db',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.target.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.target.style.color = '#d1d5db')}
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Message */}
                  <div
                    style={{
                      background: '#f9fafb',
                      borderRadius: 10,
                      padding: '14px 18px',
                      color: '#374151',
                      fontSize: '0.9rem',
                      lineHeight: 1.7,
                      marginBottom: 14,
                    }}
                  >
                    {issue.message}
                  </div>

                  {/* Admin Reply (if exists) */}
                  {issue.adminReply && (
                    <div
                      style={{
                        background: '#ecfdf5',
                        borderRadius: 10,
                        padding: '14px 18px',
                        fontSize: '0.88rem',
                        lineHeight: 1.6,
                        marginBottom: 14,
                        borderLeft: '3px solid #10b981',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#065f46', marginBottom: 6 }}>
                        💬 Balasan Admin:
                      </div>
                      <div style={{ color: '#374151' }}>{issue.adminReply}</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {issue.status === 'pending' && (
                      <button
                        onClick={() => handleIssueStatus(issue.id, 'in_progress')}
                        style={{
                          padding: '7px 16px', borderRadius: 8, border: 'none',
                          backgroundColor: '#3b82f6', color: 'white',
                          fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                        }}
                      >
                        🔄 Tandai Diproses
                      </button>
                    )}
                    {issue.status !== 'resolved' && (
                      <button
                        onClick={() => handleIssueStatus(issue.id, 'resolved')}
                        style={{
                          padding: '7px 16px', borderRadius: 8, border: 'none',
                          backgroundColor: '#10b981', color: 'white',
                          fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                        }}
                      >
                        ✅ Selesai
                      </button>
                    )}
                    {issue.status !== 'resolved' && (
                      <button
                        onClick={() => {
                          setReplyingId(replyingId === issue.id ? null : issue.id);
                          setReplyText(issue.adminReply || '');
                        }}
                        style={{
                          padding: '7px 16px', borderRadius: 8,
                          border: '1px solid #e5e7eb',
                          backgroundColor: 'white', color: '#374151',
                          fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                        }}
                      >
                        💬 Balas
                      </button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingId === issue.id && (
                    <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Tulis balasan untuk pengguna..."
                        style={{
                          flex: 1,
                          border: '1.5px solid #e5e7eb',
                          borderRadius: 10,
                          padding: '10px 14px',
                          fontSize: '0.88rem',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          minHeight: 60,
                          outline: 'none',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#c90045')}
                        onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                      />
                      <button
                        onClick={() => handleReplySubmit(issue.id)}
                        disabled={replyLoading || !replyText.trim()}
                        style={{
                          padding: '10px 20px',
                          borderRadius: 10,
                          border: 'none',
                          background: replyText.trim() ? '#c90045' : '#e5e7eb',
                          color: replyText.trim() ? 'white' : '#9ca3af',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                          alignSelf: 'flex-end',
                        }}
                      >
                        {replyLoading ? '...' : 'Kirim'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
