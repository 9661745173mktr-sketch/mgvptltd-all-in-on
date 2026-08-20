'use client';

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

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
  retailerName: string;
  mobile: string;
  messages: ChatMessage[];
  updatedAt: string;

  /*
   * true  = retailer का नया message आया है
   * false = admin ने chat पढ़ ली है
   */
  unreadByAdmin?: boolean;
};

const CHAT_DB_KEY = 'super_chat_db';

/* =========================================================
   PAGE
========================================================= */

export default function SuperChatPage() {
  const router = useRouter();

  const [chats, setChats] =
    useState<RetailerChat[]>([]);

  const [selectedRetailerId, setSelectedRetailerId] =
    useState('');

  const [reply, setReply] =
    useState('');

  /* =========================================================
     LOAD CHATS
  ========================================================= */

  const loadChats = () => {
    try {
      const raw =
        localStorage.getItem(CHAT_DB_KEY);

      if (!raw) {
        setChats([]);
        return;
      }

      const parsed =
        JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        setChats([]);
        return;
      }

      /*
       * पुराने chats को भी safely normalize करें
       */
      const normalizedChats: RetailerChat[] =
        parsed.map((chat: any) => ({
          retailerId:
            String(chat?.retailerId || ''),

          retailerName:
            String(
              chat?.retailerName ||
              'Retailer'
            ),

          mobile:
            String(
              chat?.mobile ||
              ''
            ),

          messages:
            Array.isArray(
              chat?.messages
            )
              ? chat.messages
              : [],

          updatedAt:
            String(
              chat?.updatedAt ||
              ''
            ),

          /*
           * Existing unread value preserve होगी
           */
          unreadByAdmin:
            chat?.unreadByAdmin === true,
        }));

      setChats(normalizedChats);
    } catch (error) {
      console.error(
        'Super Chat load error:',
        error
      );

      setChats([]);
    }
  };

  /* =========================================================
     INITIAL LOAD + LIVE UPDATE
  ========================================================= */

  useEffect(() => {
    loadChats();

    const handleUpdate = () => {
      loadChats();
    };

    window.addEventListener(
      'storage',
      handleUpdate
    );

    window.addEventListener(
      'super_chat_updated',
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleUpdate
      );

      window.removeEventListener(
        'super_chat_updated',
        handleUpdate
      );
    };
  }, []);

  /* =========================================================
     SELECTED CHAT
  ========================================================= */

  const selectedChat = useMemo(() => {
    return chats.find(
      (chat) =>
        chat.retailerId ===
        selectedRetailerId
    );
  }, [
    chats,
    selectedRetailerId,
  ]);

  /* =========================================================
     MARK CHAT AS READ
  ========================================================= */

  const markChatAsRead = (
    retailerId: string
  ) => {
    if (!retailerId) {
      return;
    }

    try {
      const raw =
        localStorage.getItem(
          CHAT_DB_KEY
        ) || '[]';

      const parsed =
        JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return;
      }

      const updatedChats =
        parsed.map(
          (chat: RetailerChat) => {
            if (
              chat.retailerId !==
              retailerId
            ) {
              return chat;
            }

            return {
              ...chat,
              unreadByAdmin: false,
            };
          }
        );

      localStorage.setItem(
        CHAT_DB_KEY,
        JSON.stringify(
          updatedChats
        )
      );

      setChats(
        updatedChats
      );

      window.dispatchEvent(
        new Event(
          'super_chat_updated'
        )
      );
    } catch (error) {
      console.error(
        'Mark chat read error:',
        error
      );
    }
  };

  /* =========================================================
     SELECT RETAILER
  ========================================================= */

  const selectRetailer = (
    retailerId: string
  ) => {
    setSelectedRetailerId(
      retailerId
    );

    /*
     * Admin ने chat खोल दी
     * इसलिए unread false
     */
    markChatAsRead(
      retailerId
    );
  };

  /* =========================================================
     SEND ADMIN REPLY
  ========================================================= */

  const sendReply = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const cleanReply =
      reply.trim();

    if (!cleanReply) {
      return;
    }

    if (!selectedRetailerId) {
      alert(
        'पहले retailer chat select करें।'
      );

      return;
    }

    const now =
      new Date().toISOString();

    const newMessage: ChatMessage = {
      id: Date.now(),

      sender: 'admin',

      text: cleanReply,

      timestamp: now,
    };

    const updatedChats =
      chats.map((chat) => {
        if (
          chat.retailerId !==
          selectedRetailerId
        ) {
          return chat;
        }

        return {
          ...chat,

          messages: [
            ...(Array.isArray(
              chat.messages
            )
              ? chat.messages
              : []),

            newMessage,
          ],

          updatedAt: now,

          /*
           * Admin का message है,
           * इसलिए Admin के लिए unread नहीं होगा।
           */
          unreadByAdmin: false,
        };
      });

    setChats(
      updatedChats
    );

    localStorage.setItem(
      CHAT_DB_KEY,
      JSON.stringify(
        updatedChats
      )
    );

    window.dispatchEvent(
      new Event(
        'super_chat_updated'
      )
    );

    setReply('');
  };

  /* =========================================================
     DELETE CHAT
  ========================================================= */

  const deleteChat = () => {
    if (!selectedRetailerId) {
      return;
    }

    const ok = confirm(
      'क्या आप यह पूरा chat delete करना चाहते हैं?'
    );

    if (!ok) {
      return;
    }

    const updatedChats =
      chats.filter(
        (chat) =>
          chat.retailerId !==
          selectedRetailerId
      );

    setChats(
      updatedChats
    );

    localStorage.setItem(
      CHAT_DB_KEY,
      JSON.stringify(
        updatedChats
      )
    );

    setSelectedRetailerId('');

    window.dispatchEvent(
      new Event(
        'super_chat_updated'
      )
    );
  };

  /* =========================================================
     RETAILER MESSAGE COUNT
  ========================================================= */

  const retailerMessageCount = (
    chat: RetailerChat
  ) => {
    return (
      chat.messages || []
    ).filter(
      (message) =>
        message.sender ===
        'retailer'
    ).length;
  };

  /* =========================================================
     FORMAT TIME
  ========================================================= */

  const formatTime = (
    timestamp: string
  ) => {
    try {
      return new Date(
        timestamp
      ).toLocaleString(
        'en-IN',
        {
          dateStyle: 'short',
          timeStyle: 'short',
        }
      );
    } catch {
      return '';
    }
  };

  /* =========================================================
     TOTAL UNREAD
  ========================================================= */

  const unreadChatCount =
    chats.filter(
      (chat) =>
        chat.unreadByAdmin === true
    ).length;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#050914',
        color: '#fff',
        padding: '25px',
        fontFamily:
          'Inter, Arial, sans-serif',
      }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '25px',
          paddingBottom: '18px',
          borderBottom:
            '1px solid #1e293b',
        }}
      >
        <div>
          <div
            style={{
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing:
                '.15em',
              marginBottom: '6px',
            }}
          >
            MASTER ADMIN
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '25px',
              fontWeight: 900,
            }}
          >
            💬 Super Chat
          </h1>

          <p
            style={{
              margin:
                '6px 0 0',
              color: '#64748b',
              fontSize: '12px',
            }}
          >
            Retailer support messages
            and live admin replies
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {unreadChatCount > 0 && (
            <div
              style={{
                background:
                  '#ef4444',
                color: '#fff',
                padding:
                  '8px 12px',
                borderRadius:
                  '999px',
                fontSize: '11px',
                fontWeight: 900,
              }}
            >
              🔴 {unreadChatCount} NEW
            </div>
          )}

          <button
            onClick={() =>
              router.push(
                '/admin/dashboard'
              )
            }
            style={{
              border:
                '1px solid #334155',
              background:
                '#0f172a',
              color:
                '#cbd5e1',
              padding:
                '10px 15px',
              borderRadius:
                '10px',
              cursor:
                'pointer',
              fontWeight:
                800,
            }}
          >
            ← Dashboard
          </button>
        </div>
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '300px 1fr',
          gap: '20px',
          minHeight: '650px',
        }}
      >

        {/* ===================================================
            RETAILER LIST
        =================================================== */}

        <section
          style={{
            background:
              'linear-gradient(145deg,#0f172a,#0b1324)',
            border:
              '1px solid #26354a',
            borderRadius:
              '18px',
            overflow:
              'hidden',
          }}
        >
          <div
            style={{
              padding:
                '17px',
              borderBottom:
                '1px solid #1e293b',
              fontWeight:
                900,
              color:
                '#38bdf8',
            }}
          >
            Retailer Chats

            <span
              style={{
                float: 'right',
                background:
                  unreadChatCount >
                  0
                    ? '#ef4444'
                    : '#0ea5e9',
                color:
                  '#fff',
                borderRadius:
                  '999px',
                padding:
                  '3px 8px',
                fontSize:
                  '10px',
              }}
            >
              {chats.length}
            </span>
          </div>

          <div
            style={{
              maxHeight:
                '580px',
              overflowY:
                'auto',
            }}
          >
            {chats.length ===
            0 ? (
              <div
                style={{
                  padding:
                    '30px 15px',
                  textAlign:
                    'center',
                  color:
                    '#64748b',
                  fontSize:
                    '12px',
                }}
              >
                अभी कोई retailer
                chat नहीं है।
              </div>
            ) : (
              chats.map(
                (chat) => (
                  <button
                    key={
                      chat.retailerId
                    }
                    onClick={() =>
                      selectRetailer(
                        chat.retailerId
                      )
                    }
                    style={{
                      width:
                        '100%',
                      textAlign:
                        'left',
                      border:
                        'none',
                      borderBottom:
                        '1px solid #1e293b',
                      background:
                        selectedRetailerId ===
                        chat.retailerId
                          ? '#0c4a6e'
                          : chat.unreadByAdmin
                          ? '#172033'
                          : 'transparent',
                      color:
                        '#fff',
                      padding:
                        '15px',
                      cursor:
                        'pointer',
                      position:
                        'relative',
                    }}
                  >
                    <div
                      style={{
                        display:
                          'flex',
                        justifyContent:
                          'space-between',
                        gap:
                          '8px',
                        alignItems:
                          'center',
                      }}
                    >
                      <strong>
                        {chat.retailerName ||
                          'Retailer'}
                      </strong>

                      <div
                        style={{
                          display:
                            'flex',
                          alignItems:
                            'center',
                          gap:
                            '5px',
                        }}
                      >
                        {chat.unreadByAdmin && (
                          <span
                            style={{
                              background:
                                '#ef4444',
                              color:
                                '#fff',
                              borderRadius:
                                '999px',
                              fontSize:
                                '8px',
                              fontWeight:
                                900,
                              padding:
                                '3px 6px',
                            }}
                          >
                            NEW
                          </span>
                        )}

                        {retailerMessageCount(
                          chat
                        ) >
                          0 && (
                          <span
                            style={{
                              background:
                                '#10b981',
                              color:
                                '#022c22',
                              borderRadius:
                                '999px',
                              fontSize:
                                '9px',
                              fontWeight:
                                900,
                              padding:
                                '3px 7px',
                            }}
                          >
                            {retailerMessageCount(
                              chat
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop:
                          '4px',
                        color:
                          '#94a3b8',
                        fontSize:
                          '10px',
                      }}
                    >
                      {chat.mobile ||
                        'No mobile'}
                    </div>

                    <div
                      style={{
                        marginTop:
                          '7px',
                        color:
                          chat.unreadByAdmin
                            ? '#cbd5e1'
                            : '#64748b',
                        fontSize:
                          '10px',
                        whiteSpace:
                          'nowrap',
                        overflow:
                          'hidden',
                        textOverflow:
                          'ellipsis',
                        fontWeight:
                          chat.unreadByAdmin
                            ? 700
                            : 400,
                      }}
                    >
                      {chat.messages?.[
                        chat.messages.length -
                          1
                      ]?.text ||
                        'No messages'}
                    </div>
                  </button>
                )
              )
            )}
          </div>
        </section>

        {/* ===================================================
            CHAT WINDOW
        =================================================== */}

        <section
          style={{
            display:
              'flex',
            flexDirection:
              'column',
            background:
              'linear-gradient(145deg,#0f172a,#071020)',
            border:
              '1px solid #26354a',
            borderRadius:
              '18px',
            overflow:
              'hidden',
          }}
        >

          {!selectedChat ? (
            <div
              style={{
                flex: 1,
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                color:
                  '#64748b',
                textAlign:
                  'center',
                padding:
                  '30px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize:
                      '45px',
                    marginBottom:
                      '12px',
                  }}
                >
                  💬
                </div>

                <div
                  style={{
                    fontWeight:
                      800,
                    color:
                      '#94a3b8',
                  }}
                >
                  Retailer chat
                  select करें
                </div>

                <div
                  style={{
                    fontSize:
                      '11px',
                    marginTop:
                      '5px',
                  }}
                >
                  Left side से
                  retailer select
                  करें।
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* =============================================
                  CHAT HEADER
              ============================================= */}

              <div
                style={{
                  padding:
                    '16px 18px',
                  background:
                    'linear-gradient(90deg,#0284c7,#2563eb)',
                  display:
                    'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                }}
              >
                <div>
                  <div
                    style={{
                      display:
                        'flex',
                      alignItems:
                        'center',
                      gap:
                        '8px',
                    }}
                  >
                    <div
                      style={{
                        fontWeight:
                          900,
                        fontSize:
                          '15px',
                      }}
                    >
                      {selectedChat.retailerName ||
                        'Retailer'}
                    </div>

                    {!selectedChat.unreadByAdmin && (
                      <span
                        style={{
                          fontSize:
                            '9px',
                          background:
                            'rgba(255,255,255,.15)',
                          padding:
                            '3px 6px',
                          borderRadius:
                            '999px',
                        }}
                      >
                        READ
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize:
                        '10px',
                      opacity:
                        0.8,
                      marginTop:
                        '3px',
                    }}
                  >
                    {selectedChat.mobile ||
                      'No mobile'}
                  </div>
                </div>

                <button
                  onClick={
                    deleteChat
                  }
                  style={{
                    background:
                      'rgba(127,29,29,.5)',
                    border:
                      '1px solid rgba(254,202,202,.2)',
                    color:
                      '#fecaca',
                    padding:
                      '7px 10px',
                    borderRadius:
                      '8px',
                    cursor:
                      'pointer',
                    fontSize:
                      '10px',
                    fontWeight:
                      800,
                  }}
                >
                  Delete Chat
                </button>
              </div>

              {/* =============================================
                  MESSAGES
              ============================================= */}

              <div
                style={{
                  flex: 1,
                  padding:
                    '20px',
                  overflowY:
                    'auto',
                  minHeight:
                    '480px',
                  display:
                    'flex',
                  flexDirection:
                    'column',
                  gap:
                    '10px',
                }}
              >
                {selectedChat.messages?.map(
                  (message) => (
                    <div
                      key={
                        message.id
                      }
                      style={{
                        maxWidth:
                          '75%',
                        alignSelf:
                          message.sender ===
                          'admin'
                            ? 'flex-end'
                            : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          background:
                            message.sender ===
                            'admin'
                              ? 'linear-gradient(135deg,#0284c7,#2563eb)'
                              : '#1e293b',
                          padding:
                            '11px 14px',
                          borderRadius:
                            '14px',
                          fontSize:
                            '12px',
                          lineHeight:
                            1.5,
                        }}
                      >
                        {message.text}
                      </div>

                      <div
                        style={{
                          marginTop:
                            '4px',
                          fontSize:
                            '9px',
                          color:
                            '#64748b',
                          textAlign:
                            message.sender ===
                            'admin'
                              ? 'right'
                              : 'left',
                        }}
                      >
                        {message.sender ===
                        'admin'
                          ? 'Admin'
                          : 'Retailer'}
                        {' • '}
                        {formatTime(
                          message.timestamp
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* =============================================
                  REPLY
              ============================================= */}

              <form
                onSubmit={
                  sendReply
                }
                style={{
                  display:
                    'flex',
                  gap:
                    '10px',
                  padding:
                    '14px',
                  borderTop:
                    '1px solid #1e293b',
                  background:
                    '#080f1e',
                }}
              >
                <input
                  value={reply}
                  onChange={(e) =>
                    setReply(
                      e.target.value
                    )
                  }
                  placeholder="Type admin reply..."
                  style={{
                    flex: 1,
                    minWidth:
                      0,
                    padding:
                      '12px 14px',
                    borderRadius:
                      '11px',
                    border:
                      '1px solid #334155',
                    background:
                      '#0f172a',
                    color:
                      '#fff',
                    outline:
                      'none',
                    fontSize:
                      '12px',
                  }}
                />

                <button
                  type="submit"
                  style={{
                    background:
                      'linear-gradient(90deg,#10b981,#059669)',
                    border:
                      'none',
                    color:
                      '#fff',
                    padding:
                      '0 18px',
                    borderRadius:
                      '11px',
                    fontWeight:
                      900,
                    cursor:
                      'pointer',
                  }}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}