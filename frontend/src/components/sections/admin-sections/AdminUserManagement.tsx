'use client';
import React, { useState } from 'react';

export default function AdminUserManagement() {
  const [users, setUsers] = useState<Array<any>>([
    { id: '1', name: 'Rajesh Kumar', role: 'Retailer', mobile: '9876543210', balance: 400.00, status: 'Active' },
    { id: '2', name: 'Amit Sharma', role: 'Distributor', mobile: '9123456789', balance: 2500.00, status: 'Active' },
    { id: '3', name: 'Manoj Verma', role: 'Super Distributor', mobile: '9988776655', balance: 12000.00, status: 'Active' },
    { id: '4', name: 'Suresh Gupta', role: 'Master Distributor', mobile: '9811223344', balance: 45000.00, status: 'Active' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Retailer', mobile: '', balance: '100' });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      id: Date.now().toString(),
      name: formData.name,
      role: formData.role,
      mobile: formData.mobile,
      balance: parseFloat(formData.balance) || 0,
      status: 'Active'
    };
    setUsers([newUser, ...users]);
    setFormData({ name: '', role: 'Retailer', mobile: '', balance: '100' });
    setShowModal(false);
    alert('User created successfully! 🎉');
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '6px' }}>User Hierarchy Management (CRUD)</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Create, edit, or delete Master, Super, Distributor, and Retailer accounts.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
        >
          + Create New User 🚀
        </button>
      </div>

      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Role / Level</th>
              <th style={{ padding: '12px' }}>Mobile No</th>
              <th style={{ padding: '12px' }}>Wallet Balance</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#fff' }}>{u.name}</td>
                <td style={{ padding: '12px', color: '#38bdf8', fontWeight: '600' }}>{u.role}</td>
                <td style={{ padding: '12px', color: '#94a3b8' }}>{u.mobile}</td>
                <td style={{ padding: '12px', color: '#4ade80', fontWeight: 'bold' }}>₹{u.balance.toFixed(2)}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '11px' }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => alert(`Edit feature for ${u.name}`)} style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Edit</button>
                  <button onClick={() => handleDeleteUser(u.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
          <div style={{ background: '#0b132b', border: '1px solid #1e293b', borderRadius: '20px', padding: '30px', width: '500px', maxWidth: '95%' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
              <h3 style={{ color: '#38bdf8', margin: 0 }}>Create Hierarchy User</h3>
              <button onClick={() => setShowModal(false)} style={{ background: '#1e293b', border: 'none', color: '#94a3b8', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name *</label>
                <input type="text" required placeholder="Enter full name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Role / Level *</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none' }}>
                  <option value="Retailer">Retailer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Super Distributor">Super Distributor</option>
                  <option value="Master Distributor">Master Distributor</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mobile Number *</label>
                <input type="tel" required placeholder="10 digit mobile number" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Initial Wallet Balance (₹)</label>
                <input type="number" required placeholder="100" value={formData.balance} onChange={(e) => setFormData({...formData, balance: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
              </div>

              <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                Create User Now 🚀
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}