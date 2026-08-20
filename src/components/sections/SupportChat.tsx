'use client';
import React, { useState } from 'react';

export default function SupportChat() {
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'support'; text: string; time: string }>>([
    { sender: 'support', text: 'Hello! Welcome to MG-PVT-LTD Support. How can we help you today?', time: '10:00 AM' }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'user' as const, text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      const replyMsg = { sender: 'support' as const, text: 'Thank you for reaching out. Our support agent will resolve your query shortly.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatMessages(prev => [...prev, replyMsg]);
    }, 1000);
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '25px', maxWidth: '700px', display: 'flex', flexDirection: 'column', height: '500px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💬</div>
        <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', margin: 0 }}>Live Support Chat</h2>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '15px' }}>
        {chatMessages.map((msg, idx) => (
          <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
            <div style={{ background: msg.sender === 'user' ? '#2563eb' : '#1e293b', color: '#fff', padding: '12px 16px', borderRadius: '12px', fontSize: '13px' }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Type message..." 
          value={chatInput} 
          onChange={(e) => setChatInput(e.target.value)} 
          style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none' }} 
        />
        <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
      </form>
    </div>
  );
}