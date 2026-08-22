export const ServiceTypes = {
  WALLET: 'WALLET_LOAD',
  AADHAAR: 'AADHAAR_UPDATE',
  PAN: 'PAN_UPDATE'
};

export const saveRequest = (type: string, data: any) => {
  const newReq = {
    id: Date.now(),
    type: type,
    ...data,
    status: 'Pending',
    timestamp: new Date().toISOString()
  };

  const allReqs = JSON.parse(localStorage.getItem('all_services_data') || '[]');
  localStorage.setItem('all_services_data', JSON.stringify([newReq, ...allReqs]));
  
  // सभी टैब्स को सिंक करने के लिए
  const channel = new BroadcastChannel('main_admin_sync');
  channel.postMessage({ type: 'REFRESH_REQUESTS' });
};