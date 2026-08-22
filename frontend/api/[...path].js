const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = global.__mgPrisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.__mgPrisma = prisma;

const ROLE_FEES = { MASTER_DISTRIBUTOR: 4999, SUPER_DISTRIBUTOR: 2999, DISTRIBUTOR: 1999, RETAILER: 999 };
const CHILD_ROLES = {
  ADMIN: Object.keys(ROLE_FEES),
  MASTER_DISTRIBUTOR: ['SUPER_DISTRIBUTOR', 'DISTRIBUTOR', 'RETAILER'],
  SUPER_DISTRIBUTOR: ['DISTRIBUTOR', 'RETAILER'],
  DISTRIBUTOR: ['RETAILER'],
  RETAILER: [],
};

function send(res, status, body) { res.status(status).json(body); }
function body(req) { return req.body && typeof req.body === 'object' ? req.body : {}; }
function normalizeRole(v) { return String(v || 'RETAILER').toUpperCase().trim().replace(/[\s-]+/g, '_'); }
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}
function verifyPassword(password, stored) {
  if (!stored) return false;
  if (!stored.startsWith('scrypt$')) return stored === password;
  const [, salt, expectedHex] = stored.split('$');
  if (!salt || !expectedHex) return false;
  const actual = crypto.scryptSync(String(password), salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}
function adminToken(id = 'ADMIN') {
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_TOKEN_SECRET || 'CHANGE-ME-IN-PRODUCTION';
  const payload = Buffer.from(JSON.stringify({ sub: id, role: 'ADMIN', exp: Date.now() + 12 * 60 * 60 * 1000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
function isAdmin(req) {
  const token = String(req.headers['x-admin-token'] || '').trim();
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_TOKEN_SECRET || 'CHANGE-ME-IN-PRODUCTION';
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(signature), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try { const p = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); return p.role === 'ADMIN' && Number(p.exp) > Date.now(); } catch { return false; }
}
function requireAdmin(req, res) { if (!isAdmin(req)) { send(res, 401, { error: 'Admin authentication required.' }); return false; } return true; }
function cleanUser(u) { if (!u) return u; const { password, ...safe } = u; return safe; }

async function authLogin(req, res) {
  const b = body(req); const identifier = String(b.email || b.identifier || '').trim();
  const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier.toLowerCase() }, { username: identifier }, { phone: identifier }] } });
  if (!user || !verifyPassword(String(b.password || ''), user.password)) return send(res, 400, { error: 'Invalid email, mobile, username or password' });
  if (user.accountStatus !== 'Active' || user.paymentStatus !== 'Verified') return send(res, 403, { error: `Account is ${user.accountStatus}. Admin payment verification and approval is required.` });
  return send(res, 200, { message: 'Login Successful', user: cleanUser(user) });
}

async function authRegister(req, res) {
  const b = body(req); const role = normalizeRole(b.role); const name = String(b.name || '').trim(); const phone = String(b.phone || '').replace(/\D/g, ''); const email = String(b.email || '').trim().toLowerCase(); const password = String(b.password || ''); const username = b.username ? String(b.username).trim() : null;
  if (!ROLE_FEES[role] || !name || phone.length !== 10 || !email || password.length < 6) return send(res, 400, { error: 'Real name, valid 10-digit mobile, email and password (6+ characters) are required.' });
  const parentId = b.parentId ? String(b.parentId) : null;
  if (parentId) {
    const parent = await prisma.user.findUnique({ where: { id: parentId } });
    if (!parent) return send(res, 400, { error: 'Parent account not found' });
    if (parent.accountStatus !== 'Active' || parent.paymentStatus !== 'Verified') return send(res, 403, { error: 'Parent account is not active.' });
    if (!(CHILD_ROLES[String(parent.role).toUpperCase()] || []).includes(role)) return send(res, 403, { error: 'Your role cannot create this level' });
  } else if (role !== 'RETAILER') return send(res, 403, { error: 'This partner level must be created by an approved parent account.' });
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }, ...(username ? [{ username }] : [])] } });
  if (existing) return send(res, 409, { error: 'Email, mobile or username already exists' });
  const user = await prisma.user.create({ data: { name, phone, email, username, password: hashPassword(password), role, parentId, walletBalance: 0, accountStatus: 'Pending', paymentStatus: 'Pending' } });
  return send(res, 201, { message: 'Registration submitted. Admin approval is required before login.', user: cleanUser(user) });
}

async function idRequestRegister(req, res) {
  const b = body(req); const role = normalizeRole(b.role); const name = String(b.name || '').trim(); const phone = String(b.phone || '').replace(/\D/g, ''); const email = String(b.email || '').trim().toLowerCase(); const password = String(b.password || ''); const parentId = b.parentId ? String(b.parentId) : null; const username = b.username ? String(b.username).trim() : null; const utr = String(b.utr || '').trim(); const paymentMethod = String(b.paymentMethod || '').toLowerCase();
  if (!ROLE_FEES[role] || !name || phone.length !== 10 || !email || password.length < 6) return send(res, 400, { error: 'Real name, valid 10-digit mobile, Gmail/email and password (6+ characters) are required.' });
  if (paymentMethod === 'upi' && !utr) return send(res, 400, { error: 'UTR is required for UPI payment.' });
  let parent = null;
  if (parentId) parent = await prisma.user.findUnique({ where: { id: parentId } });
  if (role !== 'RETAILER' && !parent) return send(res, 403, { error: 'Only an approved parent account can create this level.' });
  if (parent && (parent.accountStatus !== 'Active' || parent.paymentStatus !== 'Verified')) return send(res, 403, { error: 'Parent account is not active.' });
  if (parent && !(CHILD_ROLES[String(parent.role).toUpperCase()] || []).includes(role)) return send(res, 403, { error: 'Your role cannot create this level.' });
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }, ...(username ? [{ username }] : [])] } });
  if (existing) return send(res, 409, { error: 'This mobile, email or username is already registered.' });
  const amount = ROLE_FEES[role];
  const result = await prisma.$transaction(async tx => {
    const user = await tx.user.create({ data: { name, phone, email, username, password: hashPassword(password), role, parentId, walletBalance: 0, accountStatus: 'Pending', paymentStatus: paymentMethod === 'upi' ? 'Pending' : 'Payment Pending' } });
    const request = await tx.idCreationRequest.create({ data: { creatorId: user.id, requestedRole: role, applicantName: name, applicantMobile: phone, applicantEmail: email, username: user.username || `${role.toLowerCase()}-${user.id.slice(0, 8)}`, passwordHash: user.password, amount, utr: utr || null, paymentStatus: paymentMethod === 'upi' ? 'PENDING_VERIFICATION' : 'PAYMENT_PENDING', status: 'PENDING' } });
    return { user, request };
  });
  return send(res, 201, { success: true, message: 'ID creation request submitted. Admin verification is required before login.', user: cleanUser(result.user), request: result.request });
}

async function adminLogin(req, res) {
  const b = body(req); const identifier = String(b.identifier || b.email || b.username || '').trim().toLowerCase(); const password = String(b.password || '');
  const configuredEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase(); const configuredName = String(process.env.ADMIN_NAME || 'admin').trim().toLowerCase(); const configuredPassword = String(process.env.ADMIN_PASSWORD || '');
  if (!configuredPassword) return send(res, 503, { error: 'ADMIN_PASSWORD is not configured on the server.' });
  if (!password || password !== configuredPassword || (identifier !== configuredEmail && identifier !== configuredName)) return send(res, 401, { error: 'Invalid admin credentials.' });
  return send(res, 200, { message: 'Admin login successful.', token: adminToken(configuredEmail || configuredName), admin: { name: process.env.ADMIN_NAME || 'Master Admin', email: process.env.ADMIN_EMAIL || '' } });
}

async function idRequests(req, res, actionParts) {
  if (!requireAdmin(req, res)) return;
  const method = req.method; const id = actionParts[0]; const action = actionParts[1];
  if (method === 'GET') {
    const status = req.query && req.query.status ? String(req.query.status).toUpperCase() : undefined;
    const requests = await prisma.idCreationRequest.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: 'desc' } });
    const userIds = requests.map(r => r.creatorId); const users = userIds.length ? await prisma.user.findMany({ where: { id: { in: userIds } } }) : []; const map = new Map(users.map(u => [u.id, u]));
    return send(res, 200, { requests: requests.map(r => ({ ...r, passwordHash: undefined, user: cleanUser(map.get(r.creatorId)) })) });
  }
  if (method !== 'POST' || !id || !action) return send(res, 405, { error: 'Method not allowed' });
  const b = body(req);
  if (action === 'approve') {
    const result = await prisma.$transaction(async tx => {
      const request = await tx.idCreationRequest.findUnique({ where: { id } }); if (!request) throw new Error('ID creation request not found.'); if (request.status !== 'PENDING') throw new Error(`Request is already ${request.status}.`); if (request.paymentStatus === 'PAYMENT_PENDING') throw new Error('Payment has not been completed yet. Verify payment before activation.');
      const user = await tx.user.update({ where: { id: request.creatorId }, data: { accountStatus: 'Active', paymentStatus: 'Verified', approvedAt: new Date(), approvedBy: String(b.adminId || 'ADMIN') } });
      const updatedRequest = await tx.idCreationRequest.update({ where: { id }, data: { status: 'APPROVED', paymentStatus: 'VERIFIED' } }); return { user, request: updatedRequest };
    });
    return send(res, 200, { success: true, message: 'Payment verified and ID activated.', user: cleanUser(result.user), request: result.request });
  }
  if (action === 'reject') {
    const result = await prisma.$transaction(async tx => {
      const request = await tx.idCreationRequest.findUnique({ where: { id } }); if (!request) throw new Error('ID creation request not found.'); if (request.status !== 'PENDING') throw new Error(`Request is already ${request.status}.`);
      const user = await tx.user.update({ where: { id: request.creatorId }, data: { accountStatus: 'Rejected', paymentStatus: 'Rejected' } }); const updatedRequest = await tx.idCreationRequest.update({ where: { id }, data: { status: 'REJECTED', paymentStatus: 'REJECTED' } }); return { user, request: updatedRequest, remark: String(b.remark || 'ID creation request rejected by admin') };
    });
    return send(res, 200, { success: true, message: 'ID request rejected.', user: cleanUser(result.user), request: result.request, remark: result.remark });
  }
  return send(res, 404, { error: 'Unknown action' });
}

async function adminUsers(req, res, rest) {
  if (!requireAdmin(req, res)) return;
  const [first, second] = rest;
  if (req.method === 'GET' && first === 'stats') {
    const [users, pendingUsers, activeUsers, requests, pendingRequests, approvedRequests, rejectedRequests, walletTransactions] = await Promise.all([
      prisma.user.count(), prisma.user.count({ where: { accountStatus: 'Pending' } }), prisma.user.count({ where: { accountStatus: 'Active' } }), prisma.serviceRequest.count(), prisma.serviceRequest.count({ where: { status: 'PENDING' } }), prisma.serviceRequest.count({ where: { status: 'APPROVED' } }), prisma.serviceRequest.count({ where: { status: 'REJECTED' } }), prisma.walletTransaction.findMany({ where: { status: { in: ['SUCCESS', 'APPROVED'] } }, select: { amount: true } })
    ]);
    const totalWallet = (await prisma.user.aggregate({ _sum: { walletBalance: true } }))._sum.walletBalance || 0; const totalRevenue = (await prisma.serviceRequest.aggregate({ where: { status: 'APPROVED' }, _sum: { amountPaid: true } }))._sum.amountPaid || 0; const totalWalletTransactions = walletTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return send(res, 200, { stats: { users, pendingUsers, activeUsers, requests, pendingRequests, approvedRequests, rejectedRequests, totalWallet, totalRevenue, totalWalletTransactions } });
  }
  if (req.method === 'GET' && first === 'users') { const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } }); return send(res, 200, { users: users.map(cleanUser) }); }
  if (req.method === 'POST' && first === 'users' && !second) {
    const b = body(req); const name=String(b.name||'').trim(); const phone=String(b.phone||'').replace(/\D/g,''); const email=String(b.email||'').trim().toLowerCase(); const password=String(b.password||''); const username=String(b.username||'').trim()||null; const role=normalizeRole(b.role); const walletBalance=Number(b.walletBalance||0);
    if(!name||phone.length!==10||!email||password.length<6||!ROLE_FEES[role]||!Number.isFinite(walletBalance)||walletBalance<0) return send(res,400,{error:'Invalid user details.'});
    const existing=await prisma.user.findFirst({where:{OR:[{email},{phone},...(username?[{username}]:[])]}}); if(existing)return send(res,409,{error:'This mobile, email or username is already registered.'});
    const user=await prisma.user.create({data:{name,phone,email,username,password:hashPassword(password),role,walletBalance,accountStatus:'Active',paymentStatus:'Verified',approvedAt:new Date(),approvedBy:'ADMIN'}}); return send(res,201,{success:true,message:'User created and activated.',user:cleanUser(user)});
  }
  if (first === 'users' && second) {
    if (req.method === 'DELETE') { await prisma.user.delete({ where:{id:second} }); return send(res,200,{success:true,message:'User deleted.'}); }
    if (req.method === 'POST') { const b=body(req); const user=await prisma.user.update({where:{id:second},data: b.action==='reject'?{accountStatus:'Rejected',paymentStatus:'Rejected'}:{paymentStatus:'Verified',accountStatus:'Active',approvedAt:new Date(),approvedBy:String(b.adminId||'ADMIN')}}); return send(res,200,{message:b.action==='reject'?'Account request rejected.':'Payment verified and account activated.',user:cleanUser(user)}); }
  }
  return send(res,404,{error:'Admin user route not found'});
}

async function services(req,res,rest){
  if(req.method==='GET' && rest[0]==='requests' && rest[1]){ const requests=await prisma.serviceRequest.findMany({where:{userId:String(rest[1])},include:{service:true},orderBy:{createdAt:'desc'}}); return send(res,200,{success:true,requests}); }
  if(req.method==='GET'){const services=await prisma.serviceItem.findMany({where:{status:true},include:{category:true},orderBy:{createdAt:'desc'}});return send(res,200,{success:true,services});}
  if(req.method==='POST'&&rest[0]==='request'){const b=body(req);if(!b.userId||!b.serviceId)return send(res,400,{error:'userId and serviceId are required'});const service=await prisma.serviceItem.findUnique({where:{id:String(b.serviceId)}});if(!service||!service.status)return send(res,404,{error:'Service is not active'});const user=await prisma.user.findUnique({where:{id:String(b.userId)}});if(!user)return send(res,404,{error:'User not found'});if(user.accountStatus!=='Active')return send(res,403,{error:'Account is not active'});const amount=Number(service.price);if(!Number.isFinite(amount)||amount<0)return send(res,400,{error:'Invalid service price'});if(user.walletBalance<amount)return send(res,400,{error:'Insufficient wallet balance'});const request=await prisma.$transaction(async tx=>{await tx.user.update({where:{id:user.id},data:{walletBalance:{decrement:amount}}});await tx.walletTransaction.create({data:{userId:user.id,type:'SERVICE_DEBIT',amount:-amount,reference:service.id,description:`Service request: ${service.title}`,status:'SUCCESS'}});return tx.serviceRequest.create({data:{userId:user.id,serviceId:service.id,inputData:typeof b.inputData==='string'?b.inputData:JSON.stringify(b.inputData||{}),amountPaid:amount,commission:service.commission,status:'PENDING'},include:{service:true,user:true}})});return send(res,200,{success:true,message:'Request submitted. Amount reserved from wallet.',request});}
  return send(res,405,{error:'Method not allowed'});
}

async function payments(req,res,rest){
  if(req.method!=='POST') return send(res,405,{error:'Method not allowed'});
  const keyId=process.env.RAZORPAY_KEY_ID||'', keySecret=process.env.RAZORPAY_KEY_SECRET||''; if(!keyId||!keySecret)return send(res,503,{error:'Razorpay live keys are not configured on server'});
  const b=body(req); const action=rest[0];
  if(action==='order'){const n=Number(b.amount);if(!b.userId||!Number.isFinite(n)||n<10)return send(res,400,{error:'Invalid user or amount'});const user=await prisma.user.findUnique({where:{id:String(b.userId)}});if(!user)return send(res,404,{error:'User not found'});const purpose=String(b.purpose||'WALLET_RECHARGE').toUpperCase();const auth=Buffer.from(`${keyId}:${keySecret}`).toString('base64');const rr=await fetch('https://api.razorpay.com/v1/orders',{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/json'},body:JSON.stringify({amount:Math.round(n*100),currency:'INR',receipt:`${purpose.toLowerCase()}_${user.id}_${Date.now()}`,notes:{userId:user.id,purpose}})});const order=await rr.json();if(!rr.ok)return send(res,rr.status,{error:order?.error?.description||'Razorpay order creation failed'});await prisma.razorpayPayment.create({data:{userId:user.id,orderId:order.id,amount:n,purpose,status:'CREATED'}});return send(res,200,{keyId,orderId:order.id,amount:Math.round(n*100),currency:'INR'});}
  if(action==='verify'){const {razorpay_order_id,razorpay_payment_id,razorpay_signature,userId}=b;if(!razorpay_order_id||!razorpay_payment_id||!razorpay_signature||!userId)return send(res,400,{error:'Incomplete payment verification data'});const expected=crypto.createHmac('sha256',keySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');if(!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(String(razorpay_signature))))return send(res,400,{error:'Invalid Razorpay signature'});const payment=await prisma.razorpayPayment.findUnique({where:{orderId:razorpay_order_id}});if(!payment||payment.userId!==String(userId))return send(res,404,{error:'Payment order not found'});if(payment.status==='CAPTURED')return send(res,200,{success:true,alreadyProcessed:true,amount:payment.amount,purpose:payment.purpose});if(payment.purpose==='ID_CREATION'){const request=await prisma.$transaction(async tx=>{await tx.razorpayPayment.update({where:{id:payment.id},data:{paymentId:razorpay_payment_id,status:'CAPTURED'}});const r=await tx.idCreationRequest.findFirst({where:{creatorId:String(userId),status:'PENDING'},orderBy:{createdAt:'desc'}});if(r)await tx.idCreationRequest.update({where:{id:r.id},data:{paymentStatus:'PAID'}});await tx.user.update({where:{id:String(userId)},data:{paymentStatus:'Paid'}});return r;});return send(res,200,{success:true,purpose:'ID_CREATION',amount:payment.amount,requestId:request?.id||null});}const updated=await prisma.$transaction(async tx=>{await tx.razorpayPayment.update({where:{id:payment.id},data:{paymentId:razorpay_payment_id,status:'CAPTURED'}});const u=await tx.user.update({where:{id:String(userId)},data:{walletBalance:{increment:payment.amount}}});await tx.walletTransaction.create({data:{userId:String(userId),type:'RAZORPAY',amount:payment.amount,description:'Razorpay wallet recharge',razorpayOrderId:razorpay_order_id,razorpayPaymentId:razorpay_payment_id,status:'SUCCESS'}});return{balance:u.walletBalance,amount:payment.amount}});return send(res,200,{success:true,purpose:'WALLET_RECHARGE',...updated});}
  if(action==='qr'){const n=Number(b.amount);if(!b.userId||!Number.isFinite(n)||n<10)return send(res,400,{error:'Invalid user or amount'});const user=await prisma.user.findUnique({where:{id:String(b.userId)}});if(!user)return send(res,404,{error:'User not found'});const purpose=String(b.purpose||'WALLET_RECHARGE').toUpperCase();const auth=Buffer.from(`${keyId}:${keySecret}`).toString('base64');const rr=await fetch('https://api.razorpay.com/v1/payment_links',{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/json'},body:JSON.stringify({amount:Math.round(n*100),currency:'INR',description:String(b.description||`MG PVT LTD ${purpose}`),customer:{name:user.name||undefined,email:user.email||undefined,contact:user.phone||undefined},notes:{userId:user.id,purpose},expire_by:Math.floor(Date.now()/1000)+3600})});const link=await rr.json();if(!rr.ok)return send(res,rr.status,{error:link?.error?.description||'Razorpay QR/payment link creation failed'});await prisma.razorpayPayment.create({data:{userId:user.id,orderId:link.id,amount:n,purpose,status:'CREATED'}});return send(res,200,{id:link.id,short_url:link.short_url,imageContent:link.short_url,amount:n});}
  return send(res,404,{error:'Unknown payment action'});
}

module.exports = async function handler(req,res){
  try{
    const pathname=new URL(req.url,`http://${req.headers.host||'localhost'}`).pathname.replace(/^\/api\/?/,'').replace(/\/+$/,'');
    const parts=pathname?pathname.split('/') : [];
    if(parts[0]==='auth'&&parts[1]==='login')return await authLogin(req,res);
    if(parts[0]==='auth'&&parts[1]==='register')return await authRegister(req,res);
    if(parts[0]==='auth'&&parts[1]==='admin-login')return await adminLogin(req,res);
    if(parts[0]==='id-requests'&&parts[1]==='register')return await idRequestRegister(req,res);
    if(parts[0]==='admin'&&parts[1]==='id-requests')return await idRequests(req,res,parts.slice(2));
    if(parts[0]==='admin'&&parts[1]==='users')return await adminUsers(req,res,parts.slice(2));
    if(parts[0]==='services')return await services(req,res,parts.slice(1));
    if(parts[0]==='payments'&&parts[1]==='razorpay')return await payments(req,res,parts.slice(2));
    return send(res,404,{error:'API route not found',path:`/api/${parts.join('/')}`});
  }catch(e){console.error('MG API error',e);return send(res,500,{error:e?.message||'Internal server error'});}
};
