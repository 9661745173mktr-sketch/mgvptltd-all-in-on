'use client';
import React, { useState, useEffect } from 'react';

export default function AdminUserHierarchyPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // फॉर्म स्टेट नए यूजर को जोड़ने या एडिट करने के लिए
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('Retailer');
  const [password, setPassword] = useState('');

  const loadUsers = () => {
    try {
      const saved = localStorage.getItem('admin_user_hierarchy');
      if (saved) {
        setUsers(JSON.parse(saved));
      } else {
        const initialUsers = [
          { id: 1, name: 'SANJAY KUMAR', mobile: '9267916288', role: 'Retailer', status: 'Active', balance: '₹9,100' },
          { id: 2, name: 'AMIT VERMA', mobile: '9876543210', role: 'Distributor', status: 'Active', balance: '₹25,000' },
          { id: 3, name: 'RAHUL SHARMA', mobile: '9123456789', role: 'Master Distributor', status: 'Active', balance: '₹50,000' }
        ];
        setUsers(initialUsers);
        localStorage.setItem('admin_user_hierarchy', JSON.stringify(initialUsers));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !password) {
      alert('कृपया सभी फील्ड भरें।');
      return;
    }

    const newUser = {
      id: Date.now(),
      name: name.toUpperCase(),
      mobile: mobile.trim(),
      role,
      status: 'Active',
      balance: '₹100'
    };

    const updated = [newUser, ...users];
    setUsers(updated);
    localStorage.setItem('admin_user_hierarchy', JSON.stringify(updated));

    alert(`${role} सफलतापूर्वक क्रिएट कर दिया गया है!`);
    setName('');
    setMobile('');
    setPassword('');
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('क्या आप वाकई इस यूजर को डिलीट करना चाहते हैं?')) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      localStorage.setItem('admin_user_hierarchy', JSON.stringify(updated));
    }
  };

  return (
    <div style={{ color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      
      {/* हेडर और क्रिएट यूजर बटन */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8', margin: 0 }}>User Hierarchy & Management</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '5px 0 0 0' }}>Create, edit, and control Super Distributors, Master Distributors, Distributors & Retailers.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#10b981', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
        >
          ➕ Create New User
        </button>
      </div>

      {/* यूजर लिस्ट टेबल */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '25px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b', marginBottom: '20px' }}>👥 All Registered Network Users ({users.length})</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {users.map((user: any) => (
            <div key={user.id} style={{ background: '#1e293b', padding: '18px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '16px' }}>
                  {user.name} <span style={{ color: '#38bdf8', fontSize: '13px' }}>({user.mobile})</span>
                </div>
                <div style={{ fontSize: '13px', color: '#34d399', marginTop: '4px', fontWeight: '600' }}>
                  Role: <span style={{ color: '#f59e0b' }}>{user.role}</span> | Wallet: {user.balance}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', background: '#10b98122', color: '#10b981' }}>
                  {user.status}
                </span>
                <button 
                  onClick={() => handleDelete(user.id)}
                  style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                >
                  Delete 🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* नया यूजर जोड़ने का मॉडल फॉर्म */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '30px', width: '400px', boxSizing: 'border-box' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '20px' }}>Create New Network User</h3>
            
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Full Name</label>
                <input 
                  type="text" placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} required 
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Mobile Number</label>
                <input 
                  type="text" placeholder="10 digit mobile" value={mobile} onChange={(e) => setMobile(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} required 
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Select Role</label>
                <select 
                  value={role} onChange={(e) => setRole(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="Retailer">Retailer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Master Distributor">Master Distributor</option>
                  <option value="Super Distributor">Super Distributor</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Password</label>
                <input 
                  type="password" placeholder="Set password" value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} required 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'transparent', border: '1px solid #475569', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, background: '#10b981', border: 'none', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Save User 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}