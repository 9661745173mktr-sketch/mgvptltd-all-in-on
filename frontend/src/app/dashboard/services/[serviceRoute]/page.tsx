'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function DynamicServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceRoute = params.serviceRoute as string;

  const serviceTitle = serviceRoute ? serviceRoute.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Service Portal';

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleProcess = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(`Successfully processed ${serviceTitle}! Transaction completed.`);
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#fff', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      <button 
        onClick={() => router.push('/dashboard')} 
        style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}
      >
        ◀ Back to Dashboard
      </button>

      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#0f172a', padding: '30px', borderRadius: '16px', border: '1px solid #1e293b' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '10px', color: '#38bdf8' }}>{serviceTitle}</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '25px' }}>Complete your transaction securely through the enterprise gateway.</p>

        {successMsg ? (
          <div style={{ background: '#064e3b', color: '#34d399', padding: '16px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
            {successMsg}
            <br />
            <button 
              onClick={() => setSuccessMsg('')} 
              style={{ marginTop: '15px', background: '#047857', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
            >
              Perform Another Transaction
            </button>
          </div>
        ) : (
          <form onSubmit={handleProcess} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#cbd5e1' }}>Enter Details / Customer ID / Number</label>
              <input 
                type="text" 
                required
                placeholder={`Enter details for ${serviceTitle}`} 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ marginTop: '10px', background: 'linear-gradient(135deg, #0284c7, #2563eb)', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
            >
              {loading ? 'Processing via Gateway...' : `Proceed with ${serviceTitle} 🚀`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}