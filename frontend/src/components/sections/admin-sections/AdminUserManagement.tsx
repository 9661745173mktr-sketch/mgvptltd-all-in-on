'use client';
import React, { useEffect, useState } from 'react';
import { apiFetch, getAdminToken } from '../../../app/utils/api';

const ROLE_OPTIONS = [
  { value: 'MASTER_DISTRIBUTOR', label: 'Master Distributor' },
  { value: 'SUPER_DISTRIBUTOR', label: 'Super Distributor' },
  { value: 'DISTRIBUTOR', label: 'Distributor' },
  { value: 'RETAILER', label: 'Retailer' },
];

export default function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'RETAILER', mobile: '', email: '', username: '', password: '', balance: '0' });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/users', { headers: { 'x-admin-token': getAdminToken() } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to load users');
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error: any) {
      alert(error?.message || 'Unable to load live users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'x-admin-token': getAdminToken() },
        body: JSON.stringify({
          name: formData.name.trim(),
          role: formData.role,
          phone: formData.mobile.replace(/\D/g, ''),
          email: formData.email.trim().toLowerCase(),
          username: formData.username.trim() || undefined,
          password: formData.password,
          walletBalance: Number(formData.balance || 0),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to create user');
      alert('User created and activated successfully.');
      setFormData({ name: '', role: 'RETAILER', mobile: '', email: '', username: '', password: '', balance: '0' });
      setShowModal(false);
      await loadUsers();
    } catch (error: any) {
      alert(error?.message || 'Unable to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: { 'x-admin-token': getAdminToken() } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to delete user');
      await loadUsers();
    } catch (error: any) {
      alert(error?.message || 'Unable to delete user');
    }
  };

  const roleLabel = (role: string) => ROLE_OPTIONS.find(x => x.value === String(role).toUpperCase())?.label || role;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: 15 }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '6px' }}>User Hierarchy Management</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Live database users: Master, Super, Distributor and Retailer.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>+ Create New User 🚀</button>
      </div>

      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', minWidth: 900 }}>
          <thead><tr style={{ background: '#1e293b', color: '#94a3b8' }}><th style={{ padding: '12px' }}>Name</th><th style={{ padding: '12px' }}>Role / Level</th><th style={{ padding: '12px' }}>Mobile</th><th style={{ padding: '12px' }}>Email</th><th style={{ padding: '12px' }}>Wallet</th><th style={{ padding: '12px' }}>Status</th><th style={{ padding: '12px' }}>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>Loading live users…</td></tr> : users.length === 0 ? <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>No users found in the live database.</td></tr> : users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#fff' }}>{u.name || '—'}</td>
                <td style={{ padding: '12px', color: '#38bdf8', fontWeight: '600' }}>{roleLabel(u.role)}</td>
                <td style={{ padding: '12px', color: '#94a3b8' }}>{u.phone || '—'}</td>
                <td style={{ padding: '12px', color: '#94a3b8' }}>{u.email || '—'}</td>
                <td style={{ padding: '12px', color: '#4ade80', fontWeight: 'bold' }}>₹{Number(u.walletBalance || 0).toFixed(2)}</td>
                <td style={{ padding: '12px' }}><span style={{ background: u.accountStatus === 'Active' ? 'rgba(74,222,128,.1)' : 'rgba(234,179,8,.1)', color: u.accountStatus === 'Active' ? '#4ade80' : '#fbbf24', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '11px' }}>{u.accountStatus || 'Pending'}</span></td>
                <td style={{ padding: '12px' }}><button onClick={() => handleDeleteUser(String(u.id))} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: 20 }}>
          <div style={{ background: '#0b132b', border: '1px solid #1e293b', borderRadius: '20px', padding: '30px', width: '520px', maxWidth: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}><h3 style={{ color: '#38bdf8', margin: 0 }}>Create Live Network User</h3><button onClick={() => setShowModal(false)} style={{ background: '#1e293b', border: 'none', color: '#94a3b8', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button></div>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="text" required placeholder="Real Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
              <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none' }}>{ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
              <input type="tel" required placeholder="10 digit mobile number" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
              <input type="email" required placeholder="Gmail / Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
              <input type="text" placeholder="Username (optional)" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
              <input type="password" required minLength={6} placeholder="Password (6+ characters)" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
              <input type="number" min="0" step="0.01" placeholder="Initial Wallet Balance" value={formData.balance} onChange={e => setFormData({ ...formData, balance: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
              <button type="submit" disabled={saving} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: saving ? 'wait' : 'pointer', marginTop: '8px' }}>{saving ? 'Creating…' : 'Create & Activate User 🚀'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
