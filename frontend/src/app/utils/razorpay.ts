'use client';

declare global { interface Window { Razorpay?: any } }

export async function loadRazorpay(){
  if(typeof window==='undefined') return false;
  if(window.Razorpay) return true;
  await new Promise<void>((resolve,reject)=>{ const s=document.createElement('script'); s.src='https://checkout.razorpay.com/v1/checkout.js'; s.onload=()=>resolve(); s.onerror=()=>reject(new Error('Razorpay Checkout load failed')); document.body.appendChild(s); });
  return !!window.Razorpay;
}

export async function openRazorpayCheckout(opts:{amount:number;userId:string;name:string;phone?:string;email?:string;apiBase:string;onSuccess:()=>void;}){
  const ok=await loadRazorpay(); if(!ok) throw new Error('Razorpay Checkout उपलब्ध नहीं है');
  const r=await fetch(`${opts.apiBase}/api/payments/razorpay/order`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:opts.amount,userId:opts.userId})});
  const order=await r.json(); if(!r.ok) throw new Error(order.error||'Order create failed');
  const checkout=new window.Razorpay({key:order.keyId,amount:order.amount,currency:'INR',name:'MG PVT LTD',description:'Wallet Recharge',order_id:order.orderId,prefill:{name:opts.name,contact:opts.phone,email:opts.email},theme:{color:'#2563eb'},handler:async(response:any)=>{ const vr=await fetch(`${opts.apiBase}/api/payments/razorpay/verify`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...response,userId:opts.userId})}); const data=await vr.json(); if(!vr.ok) throw new Error(data.error||'Payment verification failed'); opts.onSuccess(); }});
  checkout.on('payment.failed',(response:any)=>alert(response?.error?.description||'Payment failed'));
  checkout.open();
}
