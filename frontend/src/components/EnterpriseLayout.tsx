'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface EnterpriseLayoutProps {
  children: React.ReactNode;
  userRole?: string;
  userEmail?: string;
  walletBalance?: number;
}

export default function EnterpriseLayout({
  children,
  userRole = 'ADMIN',
  userEmail = 'admin@enterprise.com',
  walletBalance = 54200.00
}: EnterpriseLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();

  const navigationModules = [
    { name: 'Dashboard Overview', href: '/dashboard', icon: '🏠', category: 'General' },
    { name: 'Government & Legal', href: '/dashboard/government', icon: '🏛️', category: 'Services', badge: 'Popular' },
    { name: 'Financial & AEPS', href: '/dashboard/financial', icon: '💳', category: 'Services', badge: 'Live' },
    { name: 'B2B Wholesale & RFQ', href: '/dashboard/b2b', icon: '🏭', category: 'Marketplace' },
    { name: 'E-Commerce & Retail', href: '/dashboard/ecommerce', icon: '🛒', category: 'Marketplace' },
    { name: 'Affiliate & Reseller Hub', href: '/dashboard/affiliate', icon: '🤝', category: 'Earnings' },
    { name: 'Digital Services & SaaS', href: '/dashboard/digital', icon: '💻', category: 'Tech' },
    { name: 'Print Portal & Packaging', href: '/dashboard/print', icon: '🖨️', category: 'Print' },
    { name: 'Travel & Bookings', href: '/dashboard/travel', icon: '✈️', category: 'Booking' },
    { name: 'Education & Library', href: '/dashboard/education', icon: '📚', category: 'Learning' },
    { name: 'API Management Panel', href: '/dashboard/admin/apis', icon: '🔌', category: 'Admin Only' },
    { name: 'Master ID Generator', href: '/dashboard/admin/users', icon: '👑', category: 'Admin Only' },
  ];

  return (
    <div className="flex h-screen bg-[#090d16] text-[#f8fafc] overflow-hidden selection:bg-sky-500 selection:text-white">
      
      {/* SIDEBAR */}
      <aside className={`transition-all duration-300 ease-in-out bg-[#0f172a]/90 backdrop-blur-xl border-r border-slate-800 flex flex-col z-30 ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        
        {/* Brand Logo Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-lg shadow-lg shadow-sky-500/20 shrink-0">
              MG
            </div>
            {sidebarOpen && (
              <div className="truncate">
                <h1 className="font-extrabold text-base tracking-wide bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  MG-PVT-LTD
                </h1>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Enterprise OS</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Account Privilege Badge */}
        {sidebarOpen && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Tier Privilege</p>
              <p className="text-xs font-bold text-sky-400 tracking-wider">{userRole}</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {navigationModules.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-600/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
                title={!sidebarOpen ? item.name : ''}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="truncate flex-1">{item.name}</span>}
                {sidebarOpen && item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    item.badge === 'Live' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Wallet Quick Load */}
        {sidebarOpen && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Wallet Balance</p>
                <p className="text-sm font-black text-emerald-400">₹ {walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <button 
                onClick={() => alert('Add Money Gateway Triggered')}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/30 transition"
              >
                + Add
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* STICKY HEADER */}
        <header className="h-16 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between z-20">
          
          {/* Global Search Everywhere */}
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, orders, APIs, vendors..."
                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
              />
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-4">
            
            {/* API Status Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              All APIs Online
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition relative"
              >
                🔔
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                    <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full font-semibold">3 New</span>
                  </div>
                  <div className="py-3 space-y-3">
                    <div className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition text-xs cursor-pointer">
                      <p className="font-bold text-slate-200">New API Webhook Connected</p>
                      <p className="text-slate-400 mt-0.5">Razorpay payout webhook verified successfully.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition text-xs cursor-pointer">
                      <p className="font-bold text-slate-200">Wallet Auto-Recharge</p>
                      <p className="text-slate-400 mt-0.5">₹ 10,000 added via HDFC corporate gateway.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-800/60 transition"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-sm shadow">
                  {userEmail[0].toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-200 truncate max-w-[120px]">{userEmail}</p>
                  <p className="text-[10px] text-slate-400">{userRole}</p>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl p-2 z-50">
                  <Link href="/dashboard/profile" className="block px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition">👤 My Profile & KYC</Link>
                  <Link href="/dashboard/security" className="block px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition">🔒 Security & 2FA</Link>
                  <Link href="/dashboard/settings" className="block px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition">⚙️ Portal Settings</Link>
                  <div className="my-1 border-t border-slate-800"></div>
                  <button 
                    onClick={() => { localStorage.clear(); window.location.href = '/auth/login'; }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 font-bold transition"
                  >
                    🚪 Logout Securely
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#090d16]">
          {children}
        </main>
      </div>
    </div>
  );
}