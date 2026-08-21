'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('RETAILER');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
    const payload = isLogin ? { email, password } : { email, password, role };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (isLogin) {
        if (String(data.user?.accountStatus || 'Active').toLowerCase() !== 'active') {
          throw new Error('Your ID is pending admin verification. Payment verify hone ke baad admin ID activate karega.');
        }
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Login Successful! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else {
        setMessage('Registration Successful! Please login.');
        setTimeout(() => {
          setIsLogin(true);
        }, 1000);
      }
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '60px auto', padding: '30px', fontFamily: 'sans-serif', background: '#1e293b', color: '#fff', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', border: '1px solid #334155' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#38bdf8', margin: '0 0 5px 0', fontSize: '26px' }}>MG-PVT-LTD</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>B2B & Digital Services Enterprise Portal</p>
      </div>

      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px', color: '#f8fafc' }}>{isLogin ? 'Sign In to Portal' : 'Create B2B Account'}</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {!isLogin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#cbd5e1' }}>Select Business Role:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
            >
              <option value="RETAILER">Retailer</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="SUPER_DISTRIBUTOR">Super Distributor</option>
              <option value="ADMIN">Master Admin</option>
            </select>
          </div>
        )}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
        />
        <button type="submit" style={{ padding: '12px', fontSize: '16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
          {isLogin ? 'Login Securely' : 'Register Account'}
        </button>
      </form>

      {message && <p style={{ textAlign: 'center', marginTop: '15px', color: message.includes('Successful') ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>{message}</p>}

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#94a3b8' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
          style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold', fontSize: '14px' }}
        >
          {isLogin ? 'Register Now' : 'Login'}
        </button>
      </p>
    </div>
  );
}