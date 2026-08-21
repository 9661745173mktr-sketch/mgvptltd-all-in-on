'use client';
import React, { useState } from 'react';
import { refundService } from '../../../app/utils/walletStore';

export default function AdminServiceRequests({ requests }: { requests: Array<any> }) {
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [remark, setRemark] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);

  const handleAction = async (id: string, actionType: string) => {
    const all = JSON.parse(localStorage.getItem('service_requests_db') || '[]');
    const req = all.find((x:any)=>String(x.id)===String(id));
    if(!req) return;
    let slipData='';
    if(slipFile){ slipData=await new Promise<string>((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve(String(r.result||'')); r.onerror=reject; r.readAsDataURL(slipFile); }); }
    if(actionType==='Rejected' || actionType==='Refunded'){
      if(!req.refundProcessed && Number(req.amountPaid ?? req.fee ?? 0)>0){ refundService(Number(req.amountPaid ?? req.fee ?? 0), req.userId || req.retailerId || '', `Refund: ${req.serviceName || req.title || 'Service'}`, String(req.id)); req.refundProcessed=true; }
      req.status='Rejected';
    } else { req.status='Approved'; }
    req.adminRemark=remark; if(slipData){req.adminSlipData=slipData; req.adminSlipName=slipFile?.name; req.adminSlipMime=slipFile?.type;} req.updatedAt=new Date().toISOString();
    localStorage.setItem('service_requests_db',JSON.stringify(all));
    localStorage.setItem('aadhaar_correction_db',JSON.stringify(all.filter((x:any)=>x.category==='Aadhaar Correction')));
    window.dispatchEvent(new Event('service_updated')); window.dispatchEvent(new Event('wallet_updated'));
    setSelectedReq(null); setRemark(''); setSlipFile(null);
    alert(actionType==='Approved' ? 'Request approved.' : 'Request rejected और wallet refund कर दिया गया है।');
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', color: '#f8fafc' }}>
        📋 All Merged Service Requests (Retailer to Master Distributor)
      </h2>
      
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
              <th style={{ padding: '12px' }}>Service Name</th>
              <th style={{ padding: '12px' }}>Client Name</th>
              <th style={{ padding: '12px' }}>Mobile</th>
              <th style={{ padding: '12px' }}>Fee</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                  No service requests found from any panel.
                </td>
              </tr>
            ) : (
              requests.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#fff' }}>{r.title}</td>
                  <td style={{ padding: '12px' }}>{r.clientName}</td>
                  <td style={{ padding: '12px' }}>{r.mobile}</td>
                  <td style={{ padding: '12px', color: '#4ade80' }}>{r.fee}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      background: r.status === 'Approved' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                      color: r.status === 'Approved' ? '#4ade80' : '#f59e0b', 
                      padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '11px' 
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => setSelectedReq(r)} 
                      style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Review & Action
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Action Modal with Remark & Slip Upload */}
      {selectedReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
          <div style={{ background: '#0b132b', border: '1px solid #1e293b', borderRadius: '20px', padding: '30px', width: '700px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
              <h3 style={{ color: '#38bdf8', margin: 0 }}>Review: {selectedReq.title}</h3>
              <button onClick={() => setSelectedReq(null)} style={{ background: '#1e293b', border: 'none', color: '#94a3b8', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#131c31', padding: '15px', borderRadius: '10px', marginBottom: '15px', fontSize: '13px' }}>
              <strong style={{ color: '#4ade80' }}>Submitted Details:</strong>
              <ul style={{ margin: '8px 0 0 15px', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', color: '#cbd5e1' }}>
                {selectedReq.details && Object.entries(selectedReq.details).map(([k, v]: [string, any], idx) => (
                  <li key={idx}><strong>{k}:</strong> {String(v)}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Admin Remark / कारण लिखें *</label>
                <textarea rows={2} placeholder="Enter remark..." value={remark} onChange={(e) => setRemark(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Upload Slip / Document *</label>
                <input type="file" onChange={(e) => setSlipFile(e.target.files?.[0] || null)} style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleAction(selectedReq.id, 'Approved')} style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>✅ Accept & Approve</button>
              <button onClick={() => handleAction(selectedReq.id, 'Rejected')} style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>❌ Reject</button>
              <button onClick={() => handleAction(selectedReq.id, 'Refunded')} style={{ flex: 1, background: '#f59e0b', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Refund Balance</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}