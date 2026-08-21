'use client';
import React, {useEffect, useState} from 'react';
import {QRCodeSVG} from 'qrcode.react';
import {createRazorpayQr, openRazorpayWalletCheckout} from '../../app/utils/razorpay';
import {readUsers, getCurrentUser, addAdminNotification} from '../../app/utils/authStore';

const UPI_ID='9661745173mktr-1@oksbi';
const COMPANY='MG PVT LTD';

export default function WalletLoadSection(){
 const [amount,setAmount]=useState(''); const [utr,setUtr]=useState(''); const [method,setMethod]=useState<'razorpay'|'razorpay_qr'|'upi'>('razorpay'); const [qr,setQr]=useState<any>(null); const [balance,setBalance]=useState(0); const [busy,setBusy]=useState(false);
 const current=()=>{try{return JSON.parse(localStorage.getItem('currentUser')||localStorage.getItem('user')||'null')}catch{return null}};
 useEffect(()=>{const load=()=>{const u=current(); const found=readUsers().find(x=>String(x.id)===String(u?.id||localStorage.getItem('user_id'))); setBalance(Number(found?.walletBalance||u?.walletBalance||0));};load(); window.addEventListener('wallet_updated',load); window.addEventListener('users_updated',load); return()=>{window.removeEventListener('wallet_updated',load);window.removeEventListener('users_updated',load)}},[]);
 const n=Number(amount||0);
 const upi=`upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(COMPANY)}&am=${n.toFixed(2)}&cu=INR`;
 const submit=async(e:React.FormEvent)=>{e.preventDefault(); if(n<=0)return alert('Valid amount enter karein.'); const u=current(); if(!u?.id)return alert('Login required.'); setBusy(true); try{
   if(method==='upi'){if(utr.trim().length<6)return alert('Payment ke baad UTR enter karein.'); const req={id:`WR-${Date.now()}`,userId:u.id,user:u.name||u.email||'User',phone:u.phone||'',email:u.email||'',amount:n,utr:utr.trim(),mode:'UPI + UTR',status:'Pending',timestamp:new Date().toISOString()}; const old=JSON.parse(localStorage.getItem('wallet_requests_db')||'[]'); localStorage.setItem('wallet_requests_db',JSON.stringify([req,...old])); addAdminNotification({type:'WALLET_LOAD',title:'New Wallet Recharge Request',message:`${req.user} requested ₹${n.toFixed(2)} wallet recharge. UTR: ${req.utr}`,userId:u.id,amount:n,utr:req.utr,status:'Unread'}); window.dispatchEvent(new Event('wallet_updated')); alert('Request Admin ko bhej di gayi hai. Approval ke baad balance add hoga.');
   } else if(method==='razorpay'){const apiBase=process.env.NEXT_PUBLIC_API_URL||'http://localhost:5000'; await openRazorpayWalletCheckout({amount:n,userId:u.id,name:u.name||'',phone:u.phone||'',email:u.email||'',apiBase,onSuccess:()=>alert('Payment successful. Wallet recharge process complete.')} as any);
   } else {const apiBase=process.env.NEXT_PUBLIC_API_URL||'http://localhost:5000'; const q=await createRazorpayQr({amount:n,userId:u.id,purpose:'WALLET_RECHARGE',apiBase,description:`Wallet recharge - ${u.name||u.email}`}); setQr(q); alert('Razorpay QR generated. Payment complete hone par wallet recharge process hoga.');}
   if(method!=='razorpay_qr'){setAmount('');setUtr('')}
 }catch(err:any){alert(err?.message||'Payment process failed')}finally{setBusy(false)}};
 return <div style={{padding:30,color:'#fff',maxWidth:1100,margin:'0 auto'}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:25}}><div><h1 style={{fontSize:24,fontWeight:800,color:'#38bdf8'}}>Wallet Load / Add Money</h1><p style={{color:'#94a3b8',fontSize:13}}>Razorpay, Razorpay QR or UPI + UTR. Admin approval ke baad wallet credit hoga.</p></div><div style={{background:'#0f172a',padding:'12px 20px',borderRadius:12}}><small>Current Balance</small><div style={{color:'#10b981',fontWeight:800,fontSize:18}}>₹{balance.toFixed(2)}</div></div></div>
  <div style={{background:'#0f172a',border:'1px solid #1e293b',borderRadius:18,padding:25,maxWidth:650}}><form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:15}}>
   <input type='number' min='1' step='0.01' placeholder='Enter amount' value={amount} onChange={e=>{setAmount(e.target.value);setQr(null)}} required style={{padding:12,borderRadius:8,background:'#1e293b',border:'1px solid #334155',color:'#fff'}}/>
   <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>{([['razorpay','💳 Razorpay'],['razorpay_qr','▦ Razorpay QR'],['upi','📱 UPI + UTR']] as const).map(([v,l])=><button type='button' key={v} onClick={()=>{setMethod(v);setQr(null)}} style={{padding:10,borderRadius:8,border:`1px solid ${method===v?'#38bdf8':'#334155'}`,background:method===v?'rgba(56,189,248,.12)':'#111827',color:'#fff',fontWeight:800}}>{l}</button>)}</div>
   {method==='upi'&&<div style={{textAlign:'center',padding:15,background:'#111827',borderRadius:12}}><div style={{fontWeight:800,color:'#38bdf8'}}>UPI QR • ₹{n.toFixed(2)}</div><div style={{fontSize:11,color:'#94a3b8',margin:'6px 0'}}>UPI: {UPI_ID}</div><div style={{background:'#fff',display:'inline-block',padding:10,borderRadius:10}}><QRCodeSVG value={upi} size={180}/></div><input placeholder='Payment ke baad UTR / Transaction No.' value={utr} onChange={e=>setUtr(e.target.value)} style={{width:'100%',marginTop:10,padding:11,borderRadius:8,background:'#1e293b',border:'1px solid #334155',color:'#fff'}} required/></div>}
   {method==='razorpay_qr'&&qr&&<div style={{background:'#fff',padding:12,borderRadius:12,textAlign:'center'}}><img src={qr.imageUrl||qr.imageContent} alt='Razorpay QR' style={{width:220,height:220,objectFit:'contain',margin:'auto'}}/><div style={{color:'#111',fontWeight:800}}>₹{n.toFixed(2)}</div></div>}
   <button disabled={busy} type='submit' style={{padding:13,border:0,borderRadius:9,background:'#10b981',color:'#fff',fontWeight:800}}>{busy?'Processing...':'Generate / Submit Payment 🚀'}</button>
  </form></div>
 </div>
}
