'use client';

import React, {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

import ServiceRequestModal from '../../components/ServiceRequestModal';
import CreateIdPanel from '../../components/CreateIdPanel';

import {
  allServices,
  serviceCategories,
  aadhaarServices,
  type PortalService,
} from '../utils/serviceCatalog';

/* =========================================================
   CONSTANTS
========================================================= */

const CHAT_DB_KEY = 'super_chat_db';

const COMPANY_UPI_ID = '9661745173mktr-1@oksbi';
const COMPANY_NAME = 'MG PVT LTD';

/* =========================================================
   MENU
========================================================= */

const menuItems = [
  { id: 'dashboard', name: 'Dashboard Overview', icon: '📊' },
  { id: 'create-id', name: 'Create Partner ID', icon: '🪪' },
  { id: 'wallet', name: 'Wallet Load / Add Money', icon: '💰' },
  { id: 'aadhaar', name: 'Aadhaar Correction', icon: '🆔' },
  { id: 'government', name: 'Government & Legal', icon: '⚖️' },
  { id: 'financial', name: 'Financial & AEPS', icon: '💳' },
  { id: 'b2b', name: 'B2B Wholesale', icon: '📦' },
  { id: 'ecommerce', name: 'E-Commerce', icon: '🛒' },
  { id: 'affiliate', name: 'Affiliate Hub', icon: '🤝' },
  { id: 'saas', name: 'Digital SaaS', icon: '💻' },
  { id: 'print', name: 'Print Portal Services', icon: '🖨️' },
  { id: 'wallet-history', name: 'Wallet History', icon: '📜' },
  { id: 'service-history', name: 'Service History', icon: '📋' },
  { id: 'travel', name: 'Travel Bookings', icon: '✈️' },
  { id: 'support', name: 'Support Chat', icon: '💬' },
  { id: 'settings', name: 'Settings Password', icon: '🔒' },
];

const sectionMap: Record<string, string> = {
  government: 'Government & Legal',
  financial: 'Financial & AEPS',
  b2b: 'B2B Wholesale',
  ecommerce: 'E-Commerce',
  affiliate: 'Affiliate Hub',
  saas: 'Digital SaaS',
  print: 'Print Portal',
  travel: 'Travel Bookings',
};

/* =========================================================
   CHAT TYPES
========================================================= */

type ChatMessage = {
  id: number;
  sender: 'retailer' | 'admin';
  text: string;
  timestamp: string;
};

type RetailerChat = {
  retailerId: string;
  retailerName: string;
  mobile: string;
  messages: ChatMessage[];
  updatedAt: string;
  adminUnreadCount?: number;
  retailerUnreadCount?: number;
};

/* =========================================================
   MAIN
========================================================= */

export default function RetailerDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('dashboard');

  const [walletBalance, setWalletBalance] = useState(48950);

  const [selectedService, setSelectedService] =
    useState<PortalService | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  /* =======================================================
     WALLET
  ======================================================= */

  const [walletAmount, setWalletAmount] = useState('');
  const [utr, setUtr] = useState('');

  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);

  const [serviceStatuses, setServiceStatuses] =
    useState<Record<string, boolean>>({});

  /* =======================================================
     CHAT
  ======================================================= */

  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState('');
  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([]);
  const [retailerId, setRetailerId] = useState('');

  /* =======================================================
     PROFILE
  ======================================================= */

  const [profileName, setProfileName] =
    useState('SANJAY KUMAR');

  const [profileMobile, setProfileMobile] =
    useState('9267916288');

  const [profileEmail, setProfileEmail] =
    useState('sanjay@mgpvtltd.com');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  /* =======================================================
     RETAILER ID
  ======================================================= */

  useEffect(() => {
    let id = localStorage.getItem('retailer_id');

    if (!id) {
      id = localStorage.getItem('user_id');
    }

    if (!id) {
      id = 'retailer-1';

      localStorage.setItem(
        'retailer_id',
        id
      );
    }

    setRetailerId(id);
  }, []);

  /* =========================================================
     LOAD CHAT
  ========================================================= */

  const loadChat = () => {
    try {
      if (!retailerId) {
        setChatLogs([]);
        return;
      }

      const raw = localStorage.getItem(CHAT_DB_KEY);

      if (!raw) {
        setChatLogs([]);
        return;
      }

      const parsed: unknown = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        setChatLogs([]);
        return;
      }

      const myChat = parsed.find(
        (chat: RetailerChat) =>
          String(chat.retailerId) === String(retailerId)
      );

      if (!myChat) {
        setChatLogs([]);
        return;
      }

      setChatLogs(
        Array.isArray(myChat.messages)
          ? myChat.messages
          : []
      );
    } catch (error) {
      console.error('Chat load error:', error);
      setChatLogs([]);
    }
  };

  /* =========================================================
     MARK ADMIN REPLIES AS READ
  ========================================================= */

  const markAdminMessagesAsRead = () => {
    if (!retailerId) {
      return;
    }

    try {
      const raw = localStorage.getItem(CHAT_DB_KEY);

      if (!raw) {
        return;
      }

      const parsed: unknown = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return;
      }

      const index = parsed.findIndex(
        (chat: RetailerChat) =>
          String(chat.retailerId) === String(retailerId)
      );

      if (index < 0) {
        return;
      }

      const chat = parsed[index];

      if (
        Number(chat.retailerUnreadCount || 0) === 0
      ) {
        return;
      }

      parsed[index] = {
        ...chat,
        retailerUnreadCount: 0,
      };

      localStorage.setItem(
        CHAT_DB_KEY,
        JSON.stringify(parsed)
      );

      window.dispatchEvent(
        new Event('super_chat_updated')
      );
    } catch (error) {
      console.error(
        'Mark retailer chat read error:',
        error
      );
    }
  };

  /* =========================================================
     OPEN SUPPORT CHAT
  ========================================================= */

  const openSupportChat = () => {
    setActiveTab('support');
    setChatOpen(true);

    loadChat();
    markAdminMessagesAsRead();
  };

  /* =========================================================
     LOAD ALL DATA
  ========================================================= */

  const loadData = () => {
    try {
      const bal = localStorage.getItem(
        'retailerWalletBalance'
      );

      if (bal !== null) {
        const parsed = Number(bal);

        if (Number.isFinite(parsed)) {
          setWalletBalance(parsed);
        }
      }

      const walletRaw = localStorage.getItem(
        'wallet_requests_db'
      );

      const serviceRaw = localStorage.getItem(
        'service_requests_db'
      );

      const statusRaw = localStorage.getItem(
        'master_service_statuses'
      );

      let walletParsed: any[] = [];
      let serviceParsed: any[] = [];
      let statusParsed: Record<string, boolean> = {};

      try {
        const parsed = JSON.parse(
          walletRaw || '[]'
        );

        if (Array.isArray(parsed)) {
          walletParsed = parsed;
        }
      } catch {
        walletParsed = [];
      }

      try {
        const parsed = JSON.parse(
          serviceRaw || '[]'
        );

        if (Array.isArray(parsed)) {
          serviceParsed = parsed;
        }
      } catch {
        serviceParsed = [];
      }

      try {
        const parsed = JSON.parse(
          statusRaw || '{}'
        );

        if (
          parsed &&
          typeof parsed === 'object' &&
          !Array.isArray(parsed)
        ) {
          statusParsed =
            parsed as Record<string, boolean>;
        }
      } catch {
        statusParsed = {};
      }

      setWalletHistory(walletParsed);
      setServiceHistory(serviceParsed);
      setServiceStatuses(statusParsed);
    } catch (error) {
      console.error(
        'Dashboard load error:',
        error
      );
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadData();
  }, []);

  /* =========================================================
     EVENTS
  ========================================================= */

  useEffect(() => {
    if (!retailerId) {
      return;
    }

    loadChat();

    const handleStorage = (
      event: StorageEvent
    ) => {
      if (
        !event.key ||
        event.key === CHAT_DB_KEY
      ) {
        loadChat();
      }

      if (
        event.key ===
          'retailerWalletBalance' ||
        event.key ===
          'wallet_requests_db' ||
        event.key ===
          'service_requests_db' ||
        event.key ===
          'master_service_statuses'
      ) {
        loadData();
      }
    };

    const handleChatUpdate = () => {
      loadChat();
    };

    const handleWalletUpdate = () => {
      loadData();
    };

    window.addEventListener(
      'storage',
      handleStorage
    );

    window.addEventListener(
      'super_chat_updated',
      handleChatUpdate
    );

    window.addEventListener(
      'wallet_updated',
      handleWalletUpdate
    );

    window.addEventListener(
      'service_updated',
      loadData
    );

    const interval = window.setInterval(
      () => {
        loadChat();
      },
      1000
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorage
      );

      window.removeEventListener(
        'super_chat_updated',
        handleChatUpdate
      );

      window.removeEventListener(
        'wallet_updated',
        handleWalletUpdate
      );

      window.removeEventListener(
        'service_updated',
        loadData
      );

      window.clearInterval(interval);
    };
  }, [retailerId]);

  /* =========================================================
     SERVICE
  ========================================================= */

  const openService = (
    service: PortalService
  ) => {
    setSelectedService(service);
  };

  /*
   * IMPORTANT:
   * useMemo हटाया गया है ताकि create-id conditional return
   * से पहले/बाद Hooks order की problem न आए।
   */

  let visibleServices =
    allServices.filter(
      (s) =>
        s.active !== false &&
        serviceStatuses[s.id] !== false
    );

  if (category !== 'All') {
    visibleServices =
      visibleServices.filter(
        (s) =>
          s.category === category
      );
  }

  if (search.trim()) {
    const q = search.toLowerCase();

    visibleServices =
      visibleServices.filter((s) =>
        `${s.title} ${s.category} ${s.description}`
          .toLowerCase()
          .includes(q)
      );
  }

  const categoryForTab =
    sectionMap[activeTab];

  const sectionServices =
    categoryForTab
      ? allServices.filter(
          (s) =>
            s.category ===
              categoryForTab &&
            serviceStatuses[s.id] !== false
        )
      : [];

  /* =======================================================
     WALLET REQUEST
  ======================================================= */

  const submitWalletRequest = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const amount = Number(walletAmount);

    if (
      !Number.isFinite(amount) ||
      amount < 10
    ) {
      alert(
        'Minimum wallet load amount ₹10 है।'
      );
      return;
    }

    const cleanUtr = utr.trim();

    if (cleanUtr.length < 6) {
      alert(
        'कृपया सही UTR / Transaction Reference Number दर्ज करें।'
      );
      return;
    }

    const req = {
      id: Date.now(),
      retailerId,
      retailerName: profileName,
      mobile: profileMobile,
      amount: Number(
        amount.toFixed(2)
      ),
      utr: cleanUtr,
      status: 'Pending',
      date: new Date().toLocaleDateString(
        'en-IN'
      ),
      timestamp: new Date().toISOString(),
    };

    try {
      const oldRaw =
        localStorage.getItem(
          'wallet_requests_db'
        );

      let old: any[] = [];

      try {
        const parsed = JSON.parse(
          oldRaw || '[]'
        );

        if (Array.isArray(parsed)) {
          old = parsed;
        }
      } catch {
        old = [];
      }

      localStorage.setItem(
        'wallet_requests_db',
        JSON.stringify([
          req,
          ...old,
        ])
      );

      window.dispatchEvent(
        new Event('wallet_updated')
      );

      setWalletAmount('');
      setUtr('');

      alert(
        'Wallet load request admin के पास भेज दी गई है। Approval के बाद राशि wallet में add होगी।'
      );

      loadData();
    } catch (error) {
      console.error(
        'Wallet request error:',
        error
      );

      alert(
        'कुछ त्रुटि हुई। कृपया दोबारा प्रयास करें।'
      );
    }
  };

  /* =======================================================
     SEND RETAILER CHAT
  ======================================================= */

  const sendChat = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const cleanText =
      chatText.trim();

    if (!cleanText) {
      return;
    }

    if (!retailerId) {
      alert(
        'Retailer ID नहीं मिली। कृपया दोबारा login करें।'
      );
      return;
    }

    const now =
      new Date().toISOString();

    const newMessage: ChatMessage = {
      id:
        Date.now() +
        Math.floor(
          Math.random() * 1000
        ),
      sender: 'retailer',
      text: cleanText,
      timestamp: now,
    };

    try {
      const raw =
        localStorage.getItem(
          CHAT_DB_KEY
        );

      let chats: RetailerChat[] = [];

      try {
        const parsed =
          JSON.parse(
            raw || '[]'
          );

        if (Array.isArray(parsed)) {
          chats =
            parsed as RetailerChat[];
        }
      } catch {
        chats = [];
      }

      const existingIndex =
        chats.findIndex(
          (chat) =>
            String(
              chat.retailerId
            ) ===
            String(retailerId)
        );

      let updatedChat:
        RetailerChat;

      if (existingIndex >= 0) {
        const oldChat =
          chats[
            existingIndex
          ];

        const oldMessages =
          Array.isArray(
            oldChat.messages
          )
            ? oldChat.messages
            : [];

        const oldUnread =
          Number(
            oldChat.adminUnreadCount || 0
          );

        updatedChat = {
          ...oldChat,
          retailerId,
          retailerName:
            profileName,
          mobile:
            profileMobile,
          messages: [
            ...oldMessages,
            newMessage,
          ],
          updatedAt: now,
          adminUnreadCount:
            oldUnread + 1,
          retailerUnreadCount:
            Number(
              oldChat.retailerUnreadCount ||
                0
            ),
        };

        chats[
          existingIndex
        ] = updatedChat;
      } else {
        updatedChat = {
          retailerId,
          retailerName:
            profileName,
          mobile:
            profileMobile,
          messages: [
            newMessage,
          ],
          updatedAt: now,
          adminUnreadCount: 1,
          retailerUnreadCount: 0,
        };

        chats.unshift(
          updatedChat
        );
      }

      localStorage.setItem(
        CHAT_DB_KEY,
        JSON.stringify(chats)
      );

      setChatLogs(
        updatedChat.messages
      );

      setChatText('');

      window.dispatchEvent(
        new Event(
          'super_chat_updated'
        )
      );
    } catch (error) {
      console.error(
        'Send chat error:',
        error
      );

      alert(
        'Message send नहीं हुआ।'
      );
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = () => {
    localStorage.removeItem(
      'retailer_logged_in'
    );

    router.push(
      '/auth/login'
    );
  };

  /* =======================================================
     CREATE PARTNER ID
     
     IMPORTANT:
     अब यह return सभी Hooks के बाद है।
  ======================================================= */

  if (activeTab === 'create-id') {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#060b14',
          color: '#fff',
          padding: '28px 18px',
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              marginBottom: 22,
              padding: 24,
              borderRadius: 24,
              border:
                '1px solid rgba(34,211,238,.18)',
              background:
                'linear-gradient(135deg,#0b1220,#111827)',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 2,
                color: '#67e8f9',
              }}
            >
              MG PVT LTD • PARTNER NETWORK
            </div>

            <h1
              style={{
                margin: '8px 0 4px',
                fontSize: 32,
                fontWeight: 900,
              }}
            >
              Create Partner ID
            </h1>

            <p
              style={{
                margin: 0,
                color: '#94a3b8',
                fontSize: 13,
              }}
            >
              Role-based hierarchy • Dynamic UPI QR • Fixed creation fee
            </p>
          </div>

          <CreateIdPanel />
        </div>
      </main>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#050914] text-white selection:bg-cyan-500/30">

      {/* SIDEBAR */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] border-r border-white/5 bg-[#081126]/95 px-3 py-4 shadow-2xl shadow-black/30 lg:flex lg:flex-col">

        <div className="mb-4 rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-slate-800/70 to-slate-950/90 p-4">

          <div className="text-lg font-black tracking-wide text-cyan-300">
            MG-PVT-LTD
          </div>

          <div className="text-[10px] font-semibold tracking-[.22em] text-slate-500">
            ENTERPRISE PORTAL
          </div>

          <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            ALL SERVICES ONLINE
          </div>

        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">

          {menuItems.map(
            (item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (
                    item.id ===
                    'support'
                  ) {
                    openSupportChat();
                  } else {
                    setActiveTab(
                      item.id
                    );
                  }
                }}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  activeTab ===
                  item.id
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                }`}
              >

                <span className="text-lg">
                  {item.icon}
                </span>

                <span className="truncate">
                  {item.name}
                </span>

                {item.id ===
                  'support' &&
                  chatLogs.some(
                    (m) =>
                      m.sender ===
                      'admin'
                  ) && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
                  )}

              </button>
            )
          )}

        </nav>

        <div className="border-t border-white/5 pt-3">

          <div className="mb-2 rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-3">

            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Wallet Balance
            </div>

            <div className="mt-1 text-lg font-black text-emerald-300">
              ₹
              {walletBalance.toLocaleString(
                'en-IN',
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </div>

          </div>

          <button
            onClick={logout}
            className="w-full rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm font-bold text-rose-300"
          >
            🚪 Logout
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="min-h-screen lg:ml-[250px]">

        <header className="sticky top-0 z-30 border-b border-white/5 bg-[#071020]/85 px-4 py-3 backdrop-blur-xl md:px-7">

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="text-xl font-black text-cyan-300">
                Welcome, {profileName}! 🌟
              </div>

              <div className="text-xs text-slate-500">
                27+ digital services • glossy enterprise service desk
              </div>

            </div>

            <div className="flex items-center gap-2">

              <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300 md:block">
                ● APIs Online
              </div>

              <div className="rounded-xl border border-emerald-400/20 bg-slate-900/80 px-4 py-2">

                <div className="text-[10px] text-slate-500">
                  Available Wallet
                </div>

                <div className="font-black text-emerald-300">
                  ₹
                  {walletBalance.toFixed(
                    2
                  )}
                </div>

              </div>

            </div>

          </div>

        </header>

        <div className="px-4 py-6 md:px-7">

          {/* DASHBOARD */}

          {activeTab ===
            'dashboard' && (
            <>
              <section className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-900/70 to-blue-950/20 p-6 shadow-2xl md:p-8">

                <div className="relative">

                  <div className="mb-2 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-300">
                    Enterprise Digital Service Hub
                  </div>

                  <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                    One Portal. All Services.{' '}
                    <span className="text-cyan-300">
                      One Beautiful Workflow.
                    </span>
                  </h1>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                    Aadhaar correction, PAN, government certificates, AEPS, DMT, BBPS, recharge, print portal, B2B and travel services — all presented in a single glossy service desk.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">

                    <a
                      href="https://wa.me/919267916288"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-[#25d366] px-4 py-2.5 text-xs font-black"
                    >
                      💬 WhatsApp Support
                    </a>

                    <button
                      onClick={() =>
                        setActiveTab(
                          'aadhaar'
                        )
                      }
                      className="rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2.5 text-xs font-black text-cyan-200"
                    >
                      🆔 Open Aadhaar Forms
                    </button>

                    <button
                      onClick={
                        openSupportChat
                      }
                      className="rounded-xl border border-blue-400/25 bg-blue-400/10 px-4 py-2.5 text-xs font-black text-blue-200"
                    >
                      💬 Open Super Chat
                    </button>

                  </div>

                </div>

              </section>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">

                <Stat
                  label="Active Services"
                  value={`${allServices.length}+`}
                  icon="⚡"
                />

                <Stat
                  label="Categories"
                  value={`${serviceCategories.length}`}
                  icon="🧩"
                />

                <Stat
                  label="Pending Requests"
                  value={`${serviceHistory.filter(
                    (x) =>
                      x.status ===
                      'Pending'
                  ).length}`}
                  icon="⏳"
                />

                <Stat
                  label="Wallet"
                  value={`₹${walletBalance.toFixed(
                    0
                  )}`}
                  icon="💰"
                />

              </div>

              <section className="mt-7">

                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

                  <div>

                    <h2 className="text-xl font-black">
                      All Active Services
                    </h2>

                    <p className="text-xs text-slate-500">
                      Click any card to open its complete form.
                    </p>

                  </div>

                  <div className="flex w-full gap-2 md:w-auto">

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search service..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs outline-none md:w-64"
                    />

                    <select
                      value={category}
                      onChange={(e) =>
                        setCategory(
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs"
                    >

                      <option>
                        All
                      </option>

                      {serviceCategories.map(
                        (c) => (
                          <option key={c}>
                            {c}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>

                <ServiceGrid
                  services={
                    visibleServices
                  }
                  onOpen={
                    openService
                  }
                />

              </section>
            </>
          )}

          {/* AADHAAR */}

          {activeTab ===
            'aadhaar' && (
            <section>

              <SectionTitle
                title="Aadhaar Correction & Update"
                subtitle="Detailed service forms."
                count={
                  aadhaarServices.length
                }
              />

              <ServiceGrid
                services={
                  aadhaarServices
                }
                onOpen={
                  openService
                }
              />

            </section>
          )}

          {/* CATEGORY */}

          {sectionServices.length >
            0 && (
            <section>

              <SectionTitle
                title={
                  menuItems.find(
                    (x) =>
                      x.id ===
                      activeTab
                  )?.name || ''
                }
                subtitle="All listed services are active."
                count={
                  sectionServices.length
                }
              />

              <ServiceGrid
                services={
                  sectionServices
                }
                onOpen={
                  openService
                }
              />

            </section>
          )}

          {/* WALLET */}

          {activeTab ===
            'wallet' && (
            <WalletPanel
              amount={
                walletAmount
              }
              setAmount={
                setWalletAmount
              }
              utr={utr}
              setUtr={setUtr}
              submit={
                submitWalletRequest
              }
            />
          )}

          {/* WALLET HISTORY */}

          {activeTab ===
            'wallet-history' && (
            <History
              title="Wallet Load History"
              rows={
                walletHistory
              }
              amountKey="amount"
            />
          )}

          {/* SERVICE HISTORY */}

          {activeTab ===
            'service-history' && (
            <History
              title="Service Request History"
              rows={
                serviceHistory
              }
              amountKey="fee"
            />
          )}

          {/* SETTINGS */}

          {activeTab ===
            'settings' && (
            <Settings
              profileName={
                profileName
              }
              setProfileName={
                setProfileName
              }
              profileMobile={
                profileMobile
              }
              setProfileMobile={
                setProfileMobile
              }
              profileEmail={
                profileEmail
              }
              setProfileEmail={
                setProfileEmail
              }
              oldPassword={
                oldPassword
              }
              setOldPassword={
                setOldPassword
              }
              newPassword={
                newPassword
              }
              setNewPassword={
                setNewPassword
              }
            />
          )}

          {/* SUPPORT */}

          {activeTab ===
            'support' && (
            <Support
              retailerId={
                retailerId
              }
              retailerName={
                profileName
              }
              retailerMobile={
                profileMobile
              }
              chatLogs={
                chatLogs
              }
              chatText={
                chatText
              }
              setChatText={
                setChatText
              }
              sendChat={
                sendChat
              }
            />
          )}

        </div>

      </main>

      {/* FLOATING BUTTONS */}

      <div className="fixed bottom-5 right-5 z-50 flex gap-3">

        <a
          href="https://wa.me/919267916288"
          target="_blank"
          rel="noreferrer"
          className="grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-2xl shadow-2xl"
        >
          💬
        </a>

        <button
          onClick={() => {
            if (!chatOpen) {
              markAdminMessagesAsRead();
            }

            setChatOpen(
              !chatOpen
            );
          }}
          className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-2xl shadow-2xl"
        >

          🎧

          {chatLogs.some(
            (m) =>
              m.sender ===
              'admin'
          ) && (
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-emerald-400" />
          )}

        </button>

      </div>

      {/* FLOATING CHAT */}

      {chatOpen && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[480px] w-[350px] flex-col overflow-hidden rounded-3xl border border-cyan-400/25 bg-[#0b1324] shadow-2xl">

          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 font-black">

            💬 MG-PVT-LTD Support

            <button
              onClick={() =>
                setChatOpen(
                  false
                )
              }
              className="float-right text-xl"
            >
              ×
            </button>

            <div className="mt-1 text-[9px] font-normal opacity-75">
              Live Admin Support
            </div>

          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-4">

            {chatLogs.length ===
            0 ? (
              <div className="py-16 text-center text-xs text-slate-500">

                <div className="mb-2 text-4xl">
                  💬
                </div>

                Admin को अपना message भेजें।

              </div>
            ) : (
              chatLogs.map(
                (
                  x
                ) => (
                  <div
                    key={
                      x.id
                    }
                    className={`max-w-[82%] ${
                      x.sender ===
                      'retailer'
                        ? 'ml-auto'
                        : ''
                    }`}
                  >

                    <div
                      className={`rounded-2xl px-3 py-2 text-xs ${
                        x.sender ===
                        'retailer'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      {x.text}
                    </div>

                    <div
                      className={`mt-1 text-[8px] text-slate-600 ${
                        x.sender ===
                        'retailer'
                          ? 'text-right'
                          : ''
                      }`}
                    >

                      {x.sender ===
                      'admin'
                        ? 'Admin'
                        : 'You'}{' '}
                      •{' '}

                      {new Date(
                        x.timestamp
                      ).toLocaleString(
                        'en-IN',
                        {
                          dateStyle:
                            'short',
                          timeStyle:
                            'short',
                        }
                      )}

                    </div>

                  </div>
                )
              )
            )}

          </div>

          <form
            onSubmit={
              sendChat
            }
            className="flex gap-2 border-t border-slate-700 p-3"
          >

            <input
              value={
                chatText
              }
              onChange={(e) =>
                setChatText(
                  e.target.value
                )
              }
              className="min-w-0 flex-1 rounded-xl bg-slate-900 px-3 py-2 text-xs outline-none"
              placeholder="Type your query..."
            />

            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-3 text-xs font-black"
            >
              Send
            </button>

          </form>

        </div>
      )}

      <ServiceRequestModal
        service={
          selectedService
        }
        onClose={() =>
          setSelectedService(
            null
          )
        }
        retailerName={
          profileName
        }
        retailerMobile={
          profileMobile
        }
        onSubmitted={
          loadData
        }
      />

    </div>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/65 p-4 shadow-lg">

      <div className="text-lg">
        {icon}
      </div>

      <div className="mt-2 text-xl font-black">
        {value}
      </div>

      <div className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>

    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle: string;
  count: number;
}) {
  return (
    <div className="mb-5 flex items-end justify-between">

      <div>

        <h2 className="text-2xl font-black text-cyan-300">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {subtitle}
        </p>

      </div>

      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-300">
        {count} Active
      </span>

    </div>
  );
}

/* =========================================================
   SERVICE GRID
========================================================= */

function ServiceGrid({
  services,
  onOpen,
}: {
  services: PortalService[];
  onOpen: (
    s: PortalService
  ) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

      {services.map(
        (s) => (
          <div
            key={s.id}
            className="group relative overflow-hidden rounded-2xl border border-white/7 bg-gradient-to-br from-slate-900/95 to-[#0a1120] p-5 shadow-xl transition hover:-translate-y-1"
          >

            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{
                background:
                  s.accent,
              }}
            />

            <div className="flex items-start justify-between gap-3">

              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                {s.icon}
              </div>

              <div className="flex items-center gap-2">

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-black uppercase text-emerald-300">
                  ● Active
                </span>

                {s.badge && (
                  <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[9px] font-black text-cyan-300">
                    {s.badge}
                  </span>
                )}

              </div>

            </div>

            <h3 className="mt-4 text-base font-black">
              {s.title}
            </h3>

            <p className="mt-2 min-h-[42px] text-xs leading-5 text-slate-500">
              {s.description}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">

              <div>

                <div className="text-[10px] text-slate-500">
                  Service Fee
                </div>

                <div className="font-black text-emerald-300">
                  ₹
                  {Number(
                    s.fee || 0
                  ).toFixed(2)}
                </div>

              </div>

              <button
                onClick={() =>
                  onOpen(s)
                }
                className="rounded-xl px-4 py-2.5 text-xs font-black"
                style={{
                  background: `linear-gradient(135deg, ${s.accent}, #2563eb)`,
                }}
              >
                Open Form 🚀
              </button>

            </div>

          </div>
        )
      )}

    </div>
  );
}

/* =========================================================
   WALLET PANEL
========================================================= */

function WalletPanel({
  amount,
  setAmount,
  utr,
  setUtr,
  submit,
}: {
  amount: string;
  setAmount: (
    v: string
  ) => void;
  utr: string;
  setUtr: (
    v: string
  ) => void;
  submit: (
    e: React.FormEvent
  ) => void;
}) {
  const numericAmount =
    Number(amount);

  const validAmount =
    Number.isFinite(
      numericAmount
    ) &&
    numericAmount >= 10;

  const upiPayload =
    validAmount
      ? `upi://pay?pa=${encodeURIComponent(
          COMPANY_UPI_ID
        )}&pn=${encodeURIComponent(
          COMPANY_NAME
        )}&am=${numericAmount.toFixed(
          2
        )}&cu=INR`
      : `upi://pay?pa=${encodeURIComponent(
          COMPANY_UPI_ID
        )}&pn=${encodeURIComponent(
          COMPANY_NAME
        )}&cu=INR`;

  const copyUpi =
    async () => {
      try {
        await navigator.clipboard.writeText(
          COMPANY_UPI_ID
        );

        alert(
          'UPI ID copied successfully.'
        );
      } catch {
        alert(
          'UPI ID copy नहीं हो पाया।'
        );
      }
    };

  const openUpi =
    () => {
      if (!validAmount) {
        alert(
          'पहले ₹10 या उससे अधिक amount दर्ज करें।'
        );
        return;
      }

      window.location.href =
        upiPayload;
    };

  return (
    <div className="mx-auto max-w-5xl">

      <SectionTitle
        title="Wallet Load / Add Money"
        subtitle="Amount → Dynamic QR → Payment → UTR → Admin Approval"
        count={1}
      />

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 to-[#071020] p-6">

          <h3 className="mb-6 text-lg font-black">
            💳 Enter Wallet Load Details
          </h3>

          <form
            onSubmit={
              submit
            }
            className="space-y-5"
          >

            <div>

              <label className="mb-2 block text-xs font-bold text-cyan-300">
                Amount to Add (₹) *
              </label>

              <input
                type="number"
                min="10"
                step="0.01"
                value={
                  amount
                }
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
                placeholder="Enter amount"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-lg font-black outline-none"
              />

            </div>

            <div>

              <label className="mb-2 block text-xs font-bold text-cyan-300">
                Company UPI ID
              </label>

              <div className="flex gap-2">

                <input
                  readOnly
                  value={
                    COMPANY_UPI_ID
                  }
                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-black text-cyan-300"
                />

                <button
                  type="button"
                  onClick={
                    copyUpi
                  }
                  className="rounded-xl bg-cyan-600 px-4 text-xs font-black"
                >
                  Copy
                </button>

              </div>

            </div>

            <div>

              <label className="mb-2 block text-xs font-bold text-cyan-300">
                UTR / Transaction Reference *
              </label>

              <input
                value={
                  utr
                }
                maxLength={40}
                onChange={(e) =>
                  setUtr(
                    e.target.value
                  )
                }
                placeholder="Enter UTR"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3"
              />

            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3.5 text-sm font-black"
            >
              Send Wallet Request ✓
            </button>

          </form>

        </div>

        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-[#0b1324] to-[#071020] p-6 text-center">

          <h3 className="text-xl font-black">
            📱 Dynamic UPI QR
          </h3>

          <div className="mt-6 flex justify-center">

            <div className="rounded-3xl bg-white p-4">

              <QRCodeSVG
                value={
                  upiPayload
                }
                size={280}
                level="M"
                includeMargin
              />

            </div>

          </div>

          <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">

            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Payment Amount
            </div>

            <div className="mt-1 text-3xl font-black text-emerald-300">
              ₹
              {validAmount
                ? numericAmount.toLocaleString(
                    'en-IN',
                    {
                      minimumFractionDigits: 2,
                    }
                  )
                : '0.00'}
            </div>

          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3">

            <div className="text-[10px] text-slate-500">
              Pay To
            </div>

            <div className="mt-1 break-all text-sm font-black text-cyan-300">
              {COMPANY_UPI_ID}
            </div>

            <div className="text-[10px] text-slate-600">
              {COMPANY_NAME}
            </div>

          </div>

          <button
            type="button"
            onClick={
              openUpi
            }
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-black"
          >
            📲 Open UPI Payment App
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   HISTORY
========================================================= */

function History({
  title,
  rows,
  amountKey,
}: {
  title: string;
  rows: any[];
  amountKey: string;
}) {
  return (
    <div className="rounded-3xl border border-white/5 bg-slate-900/70 p-5">

      <SectionTitle
        title={title}
        subtitle="Latest requests and their verification status."
        count={
          rows.length
        }
      />

      {rows.length ===
      0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-500">
          No records yet.
        </div>
      ) : (
        <div className="space-y-2">

          {rows.map(
            (r) => (
              <div
                key={
                  r.id
                }
                className="grid gap-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 md:grid-cols-[1.5fr_1fr_120px_120px]"
              >

                <div>

                  <div className="font-bold">
                    {r.serviceName ||
                      'Wallet Load'}
                  </div>

                  <div className="text-xs text-slate-500">
                    {r.retailerName} •{' '}
                    {r.date}
                  </div>

                </div>

                <div className="text-sm text-slate-300">
                  ID: {r.id}
                </div>

                <div className="font-black text-emerald-300">
                  ₹
                  {Number(
                    r[
                      amountKey
                    ] || 0
                  ).toFixed(
                    2
                  )}
                </div>

                <div>

                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-[10px] font-black text-amber-300">
                    {r.status ||
                      'Pending'}
                  </span>

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function Settings(
  p: any
) {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/5 bg-slate-900/70 p-6">

      <SectionTitle
        title="Profile & Password"
        subtitle="Update retailer profile details."
        count={1}
      />

      <div className="grid gap-4">

        <input
          value={
            p.profileName
          }
          onChange={(e) =>
            p.setProfileName(
              e.target.value
            )
          }
          className="rounded-xl bg-slate-800 px-4 py-3"
          placeholder="Full Name"
        />

        <input
          value={
            p.profileMobile
          }
          onChange={(e) =>
            p.setProfileMobile(
              e.target.value
            )
          }
          className="rounded-xl bg-slate-800 px-4 py-3"
          placeholder="Mobile"
        />

        <input
          value={
            p.profileEmail
          }
          onChange={(e) =>
            p.setProfileEmail(
              e.target.value
            )
          }
          className="rounded-xl bg-slate-800 px-4 py-3"
          placeholder="Email"
        />

        <input
          type="password"
          value={
            p.oldPassword
          }
          onChange={(e) =>
            p.setOldPassword(
              e.target.value
            )
          }
          className="rounded-xl bg-slate-800 px-4 py-3"
          placeholder="Old Password"
        />

        <input
          type="password"
          value={
            p.newPassword
          }
          onChange={(e) =>
            p.setNewPassword(
              e.target.value
            )
          }
          className="rounded-xl bg-slate-800 px-4 py-3"
          placeholder="New Password"
        />

        <button
          onClick={() =>
            alert(
              'Profile settings saved.'
            )
          }
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-black"
        >
          Save Changes ✓
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   SUPPORT
========================================================= */

function Support({
  retailerId,
  retailerName,
  retailerMobile,
  chatLogs,
  chatText,
  setChatText,
  sendChat,
}: {
  retailerId: string;
  retailerName: string;
  retailerMobile: string;
  chatLogs: ChatMessage[];
  chatText: string;
  setChatText: (v: string) => void;
  sendChat: (
    e: React.FormEvent
  ) => void;
}) {
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-900/70">

      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-5">

        <div className="text-lg font-black">
          💬 MG-PVT-LTD Support Chat
        </div>

        <div className="mt-1 text-[10px] opacity-75">
          Retailer ID: {retailerId}
          {' • '}
          {retailerName}
          {' • '}
          {retailerMobile}
        </div>

      </div>

      <div className="h-[500px] space-y-3 overflow-y-auto p-5">

        {chatLogs.length ===
        0 ? (
          <div className="flex h-full items-center justify-center text-center text-slate-500">

            <div>

              <div className="mb-3 text-5xl">
                💬
              </div>

              <div className="font-bold text-slate-400">
                Admin Support
              </div>

              <div className="mt-1 text-xs">
                अपना message नीचे भेजें।
              </div>

            </div>

          </div>
        ) : (
          chatLogs.map(
            (
              x: ChatMessage
            ) => (
              <div
                key={
                  x.id
                }
                className={`max-w-[80%] ${
                  x.sender ===
                  'retailer'
                    ? 'ml-auto'
                    : ''
                }`}
              >

                <div
                  className={`rounded-2xl p-3 text-sm ${
                    x.sender ===
                    'retailer'
                      ? 'bg-cyan-600'
                      : 'bg-slate-800'
                  }`}
                >
                  {x.text}
                </div>

                <div
                  className={`mt-1 text-[9px] text-slate-600 ${
                    x.sender ===
                    'retailer'
                      ? 'text-right'
                      : ''
                  }`}
                >

                  {x.sender ===
                  'admin'
                    ? 'Admin'
                    : 'You'}

                  {' • '}

                  {new Date(
                    x.timestamp
                  ).toLocaleString(
                    'en-IN',
                    {
                      dateStyle:
                        'short',
                      timeStyle:
                        'short',
                    }
                  )}

                </div>

              </div>
            )
          )
        )}

      </div>

      <form
        onSubmit={
          sendChat
        }
        className="flex gap-2 border-t border-slate-800 p-4"
      >

        <input
          value={
            chatText
          }
          onChange={(e) =>
            setChatText(
              e.target.value
            )
          }
          className="flex-1 rounded-xl bg-slate-800 px-4 py-3 text-sm outline-none"
          placeholder="Type message..."
        />

        <button
          type="submit"
          className="rounded-xl bg-emerald-500 px-5 font-black"
        >
          Send
        </button>

      </form>

    </div>
  );
}
