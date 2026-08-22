'use client';

export type WalletTxn = {
  id: string; userId: string; type: 'CREDIT'|'DEBIT'|'REFUND'|'SERVICE_FEE'|'RAZORPAY';
  amount: number; description: string; reference?: string; createdAt: string;
};

const USERS_KEY='appUsers';
const ADMIN_WALLET_KEY='adminWalletBalance';
const TXN_KEY='wallet_transactions_db';
const DEFAULT_ADMIN=0;

export function getUserId(){ return typeof window==='undefined' ? 'retailer-1' : (localStorage.getItem('user_id') || localStorage.getItem('retailer_id') || 'retailer-1'); }
export function getWallet(userId=getUserId()){
  if(typeof window==='undefined') return 0;
  const users=JSON.parse(localStorage.getItem(USERS_KEY)||'[]');
  const u=users.find((x:any)=>String(x.id)===String(userId));
  const legacy=Number(localStorage.getItem('retailerWalletBalance'));
  return Number.isFinite(Number(u?.walletBalance)) ? Number(u.walletBalance) : (Number.isFinite(legacy)?legacy:0);
}
export function setWallet(amount:number,userId=getUserId()){
  if(typeof window==='undefined') return;
  const value=Math.max(0,Number(amount)||0);
  const users=JSON.parse(localStorage.getItem(USERS_KEY)||'[]');
  let found=false;
  const updated=users.map((u:any)=>{ if(String(u.id)===String(userId)){found=true;return {...u,walletBalance:value};} return u;});
  if(found) localStorage.setItem(USERS_KEY,JSON.stringify(updated));
  if(userId===getUserId()) localStorage.setItem('retailerWalletBalance',String(value));
  window.dispatchEvent(new Event('wallet_updated'));
}
export function getAdminWallet(){ if(typeof window==='undefined') return DEFAULT_ADMIN; const n=Number(localStorage.getItem(ADMIN_WALLET_KEY)); return Number.isFinite(n)?n:DEFAULT_ADMIN; }
export function setAdminWallet(amount:number){ if(typeof window==='undefined') return; localStorage.setItem(ADMIN_WALLET_KEY,String(Math.max(0,Number(amount)||0))); window.dispatchEvent(new Event('admin_wallet_updated')); }
export function addTxn(txn:Omit<WalletTxn,'id'|'createdAt'>){ if(typeof window==='undefined') return; const all=JSON.parse(localStorage.getItem(TXN_KEY)||'[]'); all.unshift({...txn,id:`WT-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,createdAt:new Date().toISOString()}); localStorage.setItem(TXN_KEY,JSON.stringify(all)); }
export function debitService(amount:number,userId=getUserId(),description='Service charge',reference?:string){ const a=Number(amount)||0; const bal=getWallet(userId); if(a<=0) return true; if(bal<a) return false; setWallet(bal-a,userId); setAdminWallet(getAdminWallet()+a); addTxn({userId,type:'SERVICE_FEE',amount:a,description,reference}); addTxn({userId:'ADMIN',type:'CREDIT',amount:a,description:`Service fee received: ${description}`,reference}); return true; }
export function refundService(amount:number,userId,description='Service rejected - refund',reference?:string){ const a=Number(amount)||0; if(a<=0) return; const admin=getAdminWallet(); setAdminWallet(Math.max(0,admin-a)); setWallet(getWallet(userId)+a,userId); addTxn({userId,type:'REFUND',amount:a,description,reference}); addTxn({userId:'ADMIN',type:'DEBIT',amount:a,description:`Refund issued: ${description}`,reference}); }
export function creditWallet(amount:number,userId=getUserId(),description='Wallet credit',reference?:string){ const a=Number(amount)||0; if(a<=0)return; setWallet(getWallet(userId)+a,userId); addTxn({userId,type:'CREDIT',amount:a,description,reference}); }
