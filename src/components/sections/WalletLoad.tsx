'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function WalletLoadSection() {
  const [amount, setAmount] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number>(48950);

  const upiId = '9661745173mktr-1@oksbi';
  const merchantName = 'MG PVT LTD';

  useEffect(() => {
    const savedBal = localStorage.getItem('retailerWalletBalance');

    if (savedBal) {
      const balance = parseFloat(savedBal);

      if (!isNaN(balance)) {
        setWalletBalance(balance);
      }
    }

    const handleStorage = () => {
      const updatedBal = localStorage.getItem('retailerWalletBalance');

      if (updatedBal) {
        const balance = parseFloat(updatedBal);

        if (!isNaN(balance)) {
          setWalletBalance(balance);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('wallet_updated', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('wallet_updated', handleStorage);
    };
  }, []);

  /* --------------------------------
     AMOUNT
  -------------------------------- */

  const numericAmount =
    amount && !isNaN(parseFloat(amount))
      ? parseFloat(amount)
      : 100;

  /* --------------------------------
     UPI QR PAYLOAD
  -------------------------------- */

  const upiPayload =
    `upi://pay?pa=${encodeURIComponent(upiId)}` +
    `&pn=${encodeURIComponent(merchantName)}` +
    `&am=${numericAmount.toFixed(2)}` +
    `&cu=INR`;

  /* --------------------------------
     SUBMIT WALLET REQUEST
  -------------------------------- */

  const handleSubmitLoadRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      alert('कृपया वैध राशि (Amount) दर्ज करें।');
      return;
    }

    if (!utrNumber || utrNumber.length < 6) {
      alert(
        'कृपया सही UTR / Transaction Reference Number दर्ज करें।'
      );
      return;
    }

    const newRequest = {
      id: Date.now(),
      retailerName: 'SANJAY KUMAR',
      mobile: '9267916288',
      amount: parseFloat(amount),
      utr: utrNumber,
      status: 'Pending',
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString(),
    };

    try {
      const existingReqs = JSON.parse(
        localStorage.getItem('wallet_requests_db') || '[]'
      );

      const updated = [newRequest, ...existingReqs];

      localStorage.setItem(
        'wallet_requests_db',
        JSON.stringify(updated)
      );

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('wallet_updated'));

      alert(
        'वॉलेट लोड रिक्वेस्ट सफलतापूर्वक एडमिन के पास भेज दी गई है! एडमिन द्वारा अप्रूव होते ही आपके वॉलेट में राशि जोड़ दी जाएगी।'
      );

      setAmount('');
      setUtrNumber('');
    } catch (err) {
      console.error(err);
      alert('कुछ त्रुटि हुई, कृपया पुनः प्रयास करें।');
    }
  };

  /* --------------------------------
     COPY UPI
  -------------------------------- */

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      alert('UPI ID Copied!');
    } catch (error) {
      console.error(error);
      alert('UPI ID copy नहीं हो सकी।');
    }
  };

  return (
    <div
      style={{
        padding: '30px',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >

      {/* ============================
          HEADER
      ============================ */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '20px',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#38bdf8',
              margin: 0,
            }}
          >
            Wallet Load / Add Money
          </h1>

          <p
            style={{
              fontSize: '13px',
              color: '#94a3b8',
              margin: '5px 0 0 0',
            }}
          >
            Scan QR, pay via UPI and submit UTR for wallet approval.
          </p>
        </div>

        <div
          style={{
            background: '#1e293b',
            padding: '12px 20px',
            borderRadius: '12px',
            border: '1px solid #334155',
          }}
        >
          <span
            style={{
              color: '#94a3b8',
              fontSize: '12px',
            }}
          >
            Current Balance
          </span>

          <div
            style={{
              color: '#10b981',
              fontWeight: 'bold',
              fontSize: '18px',
              marginTop: '2px',
            }}
          >
            ₹{walletBalance.toFixed(2)}
          </div>
        </div>
      </div>

      {/* ============================
          MAIN GRID
      ============================ */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '25px',
          alignItems: 'start',
        }}
      >

        {/* ============================
            LEFT FORM
        ============================ */}

        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '18px',
            padding: '25px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
          }}
        >

          <h2
            style={{
              fontSize: '17px',
              fontWeight: '700',
              color: '#f8fafc',
              marginBottom: '22px',
            }}
          >
            💳 Enter Load Details
          </h2>

          <form
            onSubmit={handleSubmitLoadRequest}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '17px',
            }}
          >

            {/* AMOUNT */}

            <div>
              <label
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: '600',
                }}
              >
                Amount to Add (₹) *
              </label>

              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter amount (e.g. 1000)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '10px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#fff',
                  boxSizing: 'border-box',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  outline: 'none',
                }}
              />
            </div>

            {/* UPI ID */}

            <div>
              <label
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: '600',
                }}
              >
                Company UPI ID
              </label>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                }}
              >
                <input
                  type="text"
                  readOnly
                  value={upiId}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '10px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#38bdf8',
                    boxSizing: 'border-box',
                    fontSize: '13px',
                    fontWeight: 'bold',
                  }}
                />

                <button
                  type="button"
                  onClick={copyUpi}
                  style={{
                    background: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    padding: '0 16px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Copy
                </button>
              </div>
            </div>

            {/* UTR */}

            <div>
              <label
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: '600',
                }}
              >
                UTR / Reference Number *
              </label>

              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter UTR / UPI Ref Number after payment"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '10px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#fff',
                  boxSizing: 'border-box',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              style={{
                background:
                  'linear-gradient(90deg, #06b6d4, #2563eb)',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '15px',
                marginTop: '8px',
                boxShadow:
                  '0 4px 15px rgba(16,185,129,0.25)',
              }}
            >
              Send Wallet Request ✓
            </button>

          </form>
        </div>

        {/* ============================
            RIGHT QR CARD
        ============================ */}

        <div
          style={{
            background:
              'linear-gradient(135deg, #0f172a 0%, #111827 100%)',
            border: '1px solid #334155',
            borderRadius: '18px',
            padding: '25px',
            textAlign: 'center',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >

          {/* TOP LINE */}

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background:
                'linear-gradient(90deg, #38bdf8, #10b981, #f59e0b)',
            }}
          />

          <h3
            style={{
              fontSize: '17px',
              fontWeight: '700',
              color: '#f8fafc',
              marginBottom: '5px',
            }}
          >
            📱 Scan & Pay
          </h3>

          <p
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              marginBottom: '18px',
            }}
          >
            Google Pay • PhonePe • Paytm • BHIM
          </p>

          {/* ============================
              REAL QR CODE
          ============================ */}

          <div
            style={{
              background: '#fff',
              padding: '16px',
              borderRadius: '16px',
              display: 'inline-block',
              boxShadow:
                '0 8px 25px rgba(0,0,0,0.4)',
              marginBottom: '15px',
            }}
          >
            <QRCodeSVG
              value={upiPayload}
              size={220}
              level="M"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          {/* AMOUNT */}

          <div
            style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#38bdf8',
              marginBottom: '8px',
            }}
          >
            ₹{numericAmount.toLocaleString('en-IN')}
          </div>

          <div
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              marginBottom: '12px',
            }}
          >
            Scan this QR to pay
          </div>

          {/* UPI */}

          <div
            style={{
              background: '#020617',
              border: '1px solid #1e293b',
              borderRadius: '10px',
              padding: '10px',
              fontSize: '12px',
              color: '#38bdf8',
              fontWeight: '700',
              wordBreak: 'break-all',
            }}
          >
            UPI: {upiId}
          </div>

          {/* INFO */}

          <p
            style={{
              fontSize: '11px',
              color: '#64748b',
              lineHeight: '1.6',
              marginTop: '15px',
              marginBottom: 0,
            }}
          >
            भुगतान करने के बाद अपना UTR / Transaction Reference
            Number ऊपर दिए गए form में भरकर Submit करें।
          </p>

        </div>
      </div>

      {/* ============================
          QR PAYLOAD DEBUG
      ============================ */}

      <div
        style={{
          marginTop: '20px',
          padding: '12px',
          background: '#020617',
          borderRadius: '10px',
          border: '1px solid #1e293b',
          fontSize: '10px',
          color: '#475569',
          wordBreak: 'break-all',
        }}
      >
        {upiPayload}
      </div>

    </div>
  );
}