'use client';
import React, {useEffect, useState} from 'react';
import {readUsers, addAdminNotification} from '@/utils/authStore';
import {setWallet, addTxn} from '@/utils/walletStore';
export default function RetailerWalletLoadPage(){
    const [requests,setRequests]=useState<any[]>([]); const [users,setUsers]=useState<any[]>([]);
    const load=()=>try{setRequests(JSON.parse(localStorage.getItem('wallet_requests_db')||'[]'))}catch{setUsers(readUsers())};
    useEffect(()=>{load();window.addEventListener('wallet_updated',load);window.addEventListener('users_updated',load);return()=>{window.removeEventListener('wallet_updated',load);window.removeEventListener('users_updated',load)}},[])
    const action=(r:any,status:'Approved'|'Rejected')=>{const all=JSON.parse(localStorage.getItem('wallet_requests_db')||'[]'); const next=all.map((x:any)=>x.id===r.id?{...x,status,approvedAt:new Date().toISOString()}:x); localStorage.setItem('wallet_requests_db',JSON.stringify(next)); window.dispatchEvent(new Event('wallet_requests_updated'));};
    return <div style={{padding:25,color:'#fff'}}><h1>Wallet Recharge Requests</h1><p style={{color:'#94a3b8'}}>UPI/UTR requests: admin approval ke baad user wallet credit hota hai. Admin source balance par koi limit/deduction nahi.</p></div>
}