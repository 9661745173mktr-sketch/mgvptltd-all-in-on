'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/* =========================================================
   TYPES
========================================================= */

type ChatMessage = {
  id: number;
  sender: 'retailer' | 'admin';
  text: string;
  timestamp: string;
};

type RetailerChat = {
  retailerId: string;
  retailerName?: string;
  mobile?: string;
  messages?: ChatMessage[];
  updatedAt?: string;

  /*
   * true  = Admin के लिए नया message
   * false = Admin ने chat read कर लिया
   */
  unreadByAdmin?: boolean;
};

/* =========================================================
   CONSTANTS
========================================================= */

const CHAT_DB_KEY = 'super_chat_db';

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

export default function AdminDashboardPage() {
  const router = useRouter();

  /* =======================================================
     DASHBOARD STATES
  ======================================================= */

  const [walletBalance, setWalletBalance] =
    useState<number>(5000000);

  const [totalUsers, setTotalUsers] =
    useState<number>(142);

  const [pendingUtr, setPendingUtr] =
    useState<number>(0);

  const [superChatCount, setSuperChatCount] =
    useState<number>(0);

  /* =======================================================
     LOAD MASTER WALLET
  ======================================================= */

  const loadMasterWallet = () => {
    try {
      const savedBal =
        localStorage.getItem(
          'masterAdminWallet'
        );

      if (savedBal !== null) {
        const parsed =
          parseFloat(savedBal);

        if (
          Number.isFinite(parsed)
        ) {
          setWalletBalance(parsed);
        }
      }
    } catch (error) {
      console.error(
        'Master wallet load error:',
        error
      );
    }
  };

  /* =======================================================
     LOAD PENDING UTR COUNT
  ======================================================= */

  const loadPendingCount = () => {
    try {
      const raw =
        localStorage.getItem(
          'wallet_requests_db'
        ) || '[]';

      const utrReqs =
        JSON.parse(raw);

      if (!Array.isArray(utrReqs)) {
        setPendingUtr(0);
        return;
      }

      const pending =
        utrReqs.filter(
          (r: any) =>
            r.status === 'Pending' ||
            !r.status
        ).length;

      setPendingUtr(pending);
    } catch (error) {
      console.error(
        'Pending UTR load error:',
        error
      );

      setPendingUtr(0);
    }
  };

  /* =======================================================
     LOAD SUPER CHAT UNREAD COUNT
  ======================================================= */

  const loadSuperChatCount = () => {
    try {
      const raw =
        localStorage.getItem(
          CHAT_DB_KEY
        ) || '[]';

      const chats =
        JSON.parse(raw);

      if (!Array.isArray(chats)) {
        setSuperChatCount(0);
        return;
      }

      /*
       * केवल वही retailer chats count होंगी
       * जिनमें unreadByAdmin === true है।
       */
      const unreadCount =
        chats.filter(
          (chat: RetailerChat) =>
            chat.unreadByAdmin === true
        ).length;

      setSuperChatCount(
        unreadCount
      );
    } catch (error) {
      console.error(
        'Super chat count error:',
        error
      );

      setSuperChatCount(0);
    }
  };

  /* =======================================================
     LOAD ALL DASHBOARD DATA
  ======================================================= */

  const loadDashboardData = () => {
    loadMasterWallet();
    loadPendingCount();
    loadSuperChatCount();
  };

  /* =======================================================
     INITIAL LOAD + LIVE UPDATE
  ======================================================= */

  useEffect(() => {
    loadDashboardData();

    /* =====================================================
       STORAGE EVENT
    ===================================================== */

    const handleStorage = (
      event: StorageEvent
    ) => {
      /*
       * दूसरे browser tab/window से localStorage
       * change होने पर यह event आएगा।
       */
      if (
        event.key === null ||
        event.key === CHAT_DB_KEY ||
        event.key ===
          'wallet_requests_db' ||
        event.key ===
          'masterAdminWallet'
      ) {
        loadDashboardData();
      }
    };

    /* =====================================================
       CUSTOM CHAT EVENT
    ===================================================== */

    const handleChatUpdate = () => {
      loadSuperChatCount();
    };

    /* =====================================================
       CUSTOM WALLET EVENT
    ===================================================== */

    const handleWalletUpdate = () => {
      loadMasterWallet();
      loadPendingCount();
    };

    /* =====================================================
       EVENTS
    ===================================================== */

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
      loadDashboardData
    );

    /* =====================================================
       BACKUP POLLING
       
       Same browser tab में localStorage बदलने पर
       native "storage" event नहीं आता।
       इसलिए 1 second polling भी रखी गई है।
    ===================================================== */

    const interval =
      window.setInterval(() => {
        loadSuperChatCount();
        loadPendingCount();
      }, 1000);

    /* =====================================================
       CLEANUP
    ===================================================== */

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
        loadDashboardData
      );

      window.clearInterval(
        interval
      );
    };
  }, []);

  /* =======================================================
     ADD MASTER WALLET MONEY
  ======================================================= */

  const handleAddMoney = () => {
    const amountStr =
      prompt(
        'Enter amount to add in Master Admin Liquidity Wallet:',
        '1000000'
      );

    if (!amountStr) {
      return;
    }

    const addAmt =
      parseFloat(amountStr);

    if (
      !Number.isFinite(addAmt) ||
      addAmt <= 0
    ) {
      alert(
        'Please enter a valid amount.'
      );

      return;
    }

    const newBal =
      walletBalance + addAmt;

    setWalletBalance(
      newBal
    );

    localStorage.setItem(
      'masterAdminWallet',
      newBal.toString()
    );

    /*
     * Same tab के दूसरे components को
     * wallet update की जानकारी।
     */
    window.dispatchEvent(
      new Event(
        'wallet_updated'
      )
    );

    alert(
      `सफलतापूर्वक ₹${addAmt.toLocaleString(
        'en-IN'
      )} मास्टर वॉलेट में जोड़ दिए गए हैं!`
    );
  };

  /* =======================================================
     OPEN SUPER CHAT
  ======================================================= */

  const openSuperChat = () => {
    router.push(
      '/admin/super-chat'
    );
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '25px',
        color: '#fff',
        fontFamily:
          'Inter, Arial, sans-serif',
        background: '#050914',
      }}
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        style={{
          marginBottom: '25px',
        }}
      >

        <h1
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#f8fafc',
            margin: 0,
          }}
        >
          Master Admin Control Center
        </h1>

        <p
          style={{
            fontSize: '12px',
            color: '#94a3b8',
            margin:
              '4px 0 0',
          }}
        >
          Manage master wallet liquidity,
          network users, and service
          operations securely.
        </p>

      </div>

      {/* ===================================================
          STATUS CARDS
      =================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}
      >

        {/* =================================================
            MASTER WALLET
        ================================================= */}

        <div
          style={{
            background:
              'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            border:
              '1px solid #38bdf8',
            borderRadius: '16px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >

          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '.5px',
              color: '#e0f2fe',
              textTransform:
                'uppercase',
            }}
          >
            MASTER ADMIN LIQUIDITY WALLET
          </div>

          <div
            style={{
              fontSize: '30px',
              fontWeight: 800,
              color: '#fff',
              margin:
                '10px 0',
            }}
          >
            ₹
            {walletBalance.toLocaleString(
              'en-IN'
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems:
                'center',
              marginTop: '15px',
              gap: '10px',
            }}
          >

            <span
              style={{
                fontSize: '11px',
                color: '#bae6fd',
              }}
            >
              🔓 Unlimited Balance Control
            </span>

            <button
              onClick={
                handleAddMoney
              }
              style={{
                background:
                  '#fff',
                color:
                  '#0369a1',
                border:
                  'none',
                padding:
                  '7px 14px',
                borderRadius:
                  '8px',
                fontWeight:
                  'bold',
                fontSize:
                  '12px',
                cursor:
                  'pointer',
              }}
            >
              + Add Money
            </button>

          </div>

        </div>

        {/* =================================================
            TOTAL USERS
        ================================================= */}

        <div
          style={{
            background:
              '#0f172a',
            border:
              '1px solid #1e293b',
            borderRadius:
              '16px',
            padding:
              '24px',
            display:
              'flex',
            flexDirection:
              'column',
            justifyContent:
              'space-between',
          }}
        >

          <div>

            <div
              style={{
                fontSize:
                  '11px',
                fontWeight:
                  800,
                letterSpacing:
                  '.5px',
                color:
                  '#94a3b8',
                textTransform:
                  'uppercase',
              }}
            >
              TOTAL REGISTERED USERS
            </div>

            <div
              style={{
                fontSize:
                  '32px',
                fontWeight:
                  800,
                color:
                  '#fff',
                margin:
                  '10px 0',
              }}
            >
              {totalUsers}
            </div>

          </div>

          <div
            style={{
              fontSize:
                '12px',
              color:
                '#10b981',
              fontWeight:
                600,
            }}
          >
            🟢 Live Network Active
          </div>

        </div>

        {/* =================================================
            PENDING UTR
        ================================================= */}

        <div
          style={{
            background:
              '#0f172a',
            border:
              '1px solid #1e293b',
            borderRadius:
              '16px',
            padding:
              '24px',
            display:
              'flex',
            flexDirection:
              'column',
            justifyContent:
              'space-between',
          }}
        >

          <div>

            <div
              style={{
                fontSize:
                  '11px',
                fontWeight:
                  800,
                letterSpacing:
                  '.5px',
                color:
                  '#94a3b8',
                textTransform:
                  'uppercase',
              }}
            >
              PENDING UTR REQUESTS
            </div>

            <div
              style={{
                fontSize:
                  '32px',
                fontWeight:
                  800,
                color:
                  '#f59e0b',
                margin:
                  '10px 0',
              }}
            >
              {pendingUtr}
            </div>

          </div>

          <div
            style={{
              fontSize:
                '12px',
              color:
                '#f59e0b',
              fontWeight:
                600,
            }}
          >
            ⚠️ Action Required
          </div>

        </div>

      </div>

      {/* ===================================================
          QUICK NAVIGATION
      =================================================== */}

      <div>

        <h2
          style={{
            fontSize:
              '15px',
            fontWeight:
              700,
            color:
              '#f8fafc',
            marginBottom:
              '15px',
          }}
        >
          🚀 Quick Navigation & Management
        </h2>

        <div
          style={{
            display:
              'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(280px, 1fr))',
            gap:
              '20px',
          }}
        >

          {/* =================================================
              WALLET REQUESTS
          ================================================= */}

          <div
            onClick={() =>
              router.push(
                '/admin/wallet-requests'
              )
            }
            style={{
              background:
                '#0f172a',
              border:
                '1px solid #1e293b',
              borderRadius:
                '14px',
              padding:
                '20px',
              cursor:
                'pointer',
            }}
          >

            <div
              style={{
                fontSize:
                  '14px',
                fontWeight:
                  'bold',
                color:
                  '#38bdf8',
                marginBottom:
                  '6px',
              }}
            >
              💰 Wallet Requests
            </div>

            <p
              style={{
                fontSize:
                  '12px',
                color:
                  '#94a3b8',
                margin:
                  0,
              }}
            >
              Approve or reject retailer
              UTR loads
            </p>

          </div>

          {/* =================================================
              USER HIERARCHY
          ================================================= */}

          <div
            onClick={() =>
              router.push(
                '/admin/user-hierarchy'
              )
            }
            style={{
              background:
                '#0f172a',
              border:
                '1px solid #1e293b',
              borderRadius:
                '14px',
              padding:
                '20px',
              cursor:
                'pointer',
            }}
          >

            <div
              style={{
                fontSize:
                  '14px',
                fontWeight:
                  'bold',
                color:
                  '#38bdf8',
                marginBottom:
                  '6px',
              }}
            >
              👥 User Hierarchy
            </div>

            <p
              style={{
                fontSize:
                  '12px',
                color:
                  '#94a3b8',
                margin:
                  0,
              }}
            >
              Manage distributors &
              retailers
            </p>

          </div>

          {/* =================================================
              TRANSACTIONS
          ================================================= */}

          <div
            onClick={() =>
              router.push(
                '/admin/wallet-transactions'
              )
            }
            style={{
              background:
                '#0f172a',
              border:
                '1px solid #1e293b',
              borderRadius:
                '14px',
              padding:
                '20px',
              cursor:
                'pointer',
            }}
          >

            <div
              style={{
                fontSize:
                  '14px',
                fontWeight:
                  'bold',
                color:
                  '#38bdf8',
                marginBottom:
                  '6px',
              }}
            >
              📊 All Transactions
            </div>

            <p
              style={{
                fontSize:
                  '12px',
                color:
                  '#94a3b8',
                margin:
                  0,
              }}
            >
              View portal-wide financial
              logs
            </p>

          </div>

          {/* =================================================
              SUPER CHAT
          ================================================= */}

          <div
            onClick={
              openSuperChat
            }
            style={{
              background:
                superChatCount > 0
                  ? 'linear-gradient(135deg, #172033, #111c32)'
                  : 'linear-gradient(135deg, #0f172a, #111c32)',

              border:
                superChatCount > 0
                  ? '1px solid rgba(239,68,68,.65)'
                  : '1px solid rgba(34,211,238,.45)',

              borderRadius:
                '14px',

              padding:
                '20px',

              cursor:
                'pointer',

              boxShadow:
                superChatCount > 0
                  ? '0 10px 35px rgba(239,68,68,.12)'
                  : '0 10px 30px rgba(0,0,0,.25)',

              position:
                'relative',

              transition:
                'all .2s ease',
            }}
          >

            {/* =============================================
                UNREAD COUNT BADGE
            ============================================= */}

            {superChatCount > 0 && (
              <div
                style={{
                  position:
                    'absolute',

                  top:
                    '12px',

                  right:
                    '12px',

                  minWidth:
                    '22px',

                  height:
                    '22px',

                  borderRadius:
                    '999px',

                  background:
                    '#ef4444',

                  color:
                    '#fff',

                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  fontSize:
                    '10px',

                  fontWeight:
                    900,

                  padding:
                    '0 6px',

                  boxShadow:
                    '0 0 0 4px rgba(239,68,68,.10)',

                  animation:
                    'pulse 1.5s infinite',
                }}
              >
                {superChatCount}
              </div>
            )}

            {/* =============================================
                CHAT TITLE
            ============================================= */}

            <div
              style={{
                fontSize:
                  '14px',

                fontWeight:
                  'bold',

                color:
                  superChatCount > 0
                    ? '#f87171'
                    : '#22d3ee',

                marginBottom:
                  '6px',
              }}
            >
              💬 Super Chat
            </div>

            {/* =============================================
                DESCRIPTION
            ============================================= */}

            <p
              style={{
                fontSize:
                  '12px',

                color:
                  '#94a3b8',

                margin:
                  0,

                lineHeight:
                  1.6,
              }}
            >
              Retailer support messages
              और admin replies manage करें
            </p>

            {/* =============================================
                STATUS BADGE
            ============================================= */}

            <div
              style={{
                marginTop:
                  '12px',

                display:
                  'inline-flex',

                alignItems:
                  'center',

                gap:
                  '6px',

                padding:
                  '5px 9px',

                borderRadius:
                  '999px',

                background:
                  superChatCount > 0
                    ? 'rgba(239,68,68,.10)'
                    : 'rgba(16,185,129,.10)',

                border:
                  superChatCount > 0
                    ? '1px solid rgba(239,68,68,.25)'
                    : '1px solid rgba(16,185,129,.20)',

                color:
                  superChatCount > 0
                    ? '#f87171'
                    : '#34d399',

                fontSize:
                  '10px',

                fontWeight:
                  800,
              }}
            >
              {superChatCount > 0
                ? `🔴 ${superChatCount} UNREAD`
                : '● ALL READ'}
            </div>

          </div>

        </div>

      </div>

      {/* ===================================================
          INLINE ANIMATION
      =================================================== */}

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }

          50% {
            transform: scale(1.08);
            opacity: 0.85;
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

    </div>
  );
}