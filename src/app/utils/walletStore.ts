// यह एक ग्लोबल मेमोरी स्टोर है जो कभी फेल नहीं होगा
let globalRequests: any[] = [];

export const setWalletData = (data: any[]) => {
  globalRequests = data;
  if (typeof window !== 'undefined') {
    localStorage.setItem('master_wallet_requests', JSON.stringify(data));
  }
};

export const getWalletData = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('master_wallet_requests');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) { return globalRequests; }
    }
  }
  return globalRequests;
};