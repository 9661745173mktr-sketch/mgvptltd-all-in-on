import { Router } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
const router=Router(); const prisma=new PrismaClient();
const keyId=process.env.RAZORPAY_KEY_ID||''; const keySecret=process.env.RAZORPAY_KEY_SECRET||''; const apiBase='https://api.razorpay.com/v1';
const authHeader=()=>`Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

router.post('/razorpay/order', async(req,res)=>{try{
 const {amount,userId,purpose='WALLET_RECHARGE'}=req.body||{}; const n=Number(amount);
 if(!keyId||!keySecret)return res.status(500).json({error:'Razorpay live keys are not configured on server'});
 if(!userId||!Number.isFinite(n)||n<10)return res.status(400).json({error:'Invalid user or amount'});
 const user=await prisma.user.findUnique({where:{id:String(userId)}}); if(!user)return res.status(404).json({error:'User not found'});
 const rr=await fetch(`${apiBase}/orders`,{method:'POST',headers:{Authorization:authHeader(),'Content-Type':'application/json'},body:JSON.stringify({amount:Math.round(n*100),currency:'INR',receipt:`${String(purpose).toLowerCase()}_${user.id}_${Date.now()}`,notes:{userId:user.id,purpose:String(purpose)}})}); const order:any=await rr.json(); if(!rr.ok)return res.status(rr.status).json({error:order?.error?.description||'Razorpay order creation failed'});
 await prisma.razorpayPayment.create({data:{userId:user.id,orderId:order.id,amount:n,purpose:String(purpose),status:'CREATED'}}); res.json({keyId,orderId:order.id,amount:Math.round(n*100),currency:'INR'});
}catch(e:any){res.status(500).json({error:e.message})}});

router.post('/razorpay/qr', async(req,res)=>{try{
 const {amount,userId,purpose='WALLET_RECHARGE',description}=req.body||{}; const n=Number(amount);
 if(!keyId||!keySecret)return res.status(500).json({error:'Razorpay live keys are not configured on server'});
 if(!userId||!Number.isFinite(n)||n<1)return res.status(400).json({error:'Invalid user or amount'});
 const user=await prisma.user.findUnique({where:{id:String(userId)}}); if(!user)return res.status(404).json({error:'User not found'});
 const rr=await fetch(`${apiBase}/payments/qr_codes`,{method:'POST',headers:{Authorization:authHeader(),'Content-Type':'application/json'},body:JSON.stringify({type:'upi_qr',name:`MG-${String(purpose)}-${String(user.id).slice(0,12)}`,usage:'single_use',fixed_amount:true,payment_amount:Math.round(n*100),description:description||`MG PVT LTD ${purpose}`,close_by:Math.floor(Date.now()/1000)+7200,notes:{userId:String(user.id),purpose:String(purpose)}})}); const qr:any=await rr.json(); if(!rr.ok)return res.status(rr.status).json({error:qr?.error?.description||'Razorpay QR creation failed'});
 await prisma.razorpayPayment.create({data:{userId:user.id,orderId:`QR:${qr.id}`,amount:n,purpose:String(purpose),qrId:qr.id,status:'QR_CREATED'}}); res.json({success:true,qrId:qr.id,imageUrl:qr.image_url,imageContent:qr.image_content,amount:Math.round(n*100),currency:'INR'});
}catch(e:any){res.status(500).json({error:e.message})}});

async function settlePayment(payment:any, mode:'ORDER'|'QR'){
 return prisma.$transaction(async(tx)=>{
  const p=mode==='QR'?await tx.razorpayPayment.findFirst({where:{qrId:String(payment.qrId)}}):await tx.razorpayPayment.findUnique({where:{orderId:String(payment.orderId)}});
  if(!p||p.status==='CAPTURED')return null;
  await tx.razorpayPayment.update({where:{id:p.id},data:{paymentId:String(payment.paymentId),status:'CAPTURED'}});
  if(String(p.purpose)==='ID_CREATION'){
   const u=await tx.user.update({where:{id:p.userId},data:{paymentStatus:'Paid'}});
   await tx.walletTransaction.create({data:{userId:p.userId,type:'ID_CREATION_PAYMENT',amount:p.amount,purpose:'ID_CREATION',description:`Razorpay ${mode==='QR'?'QR':'Checkout'} ID creation payment received; awaiting admin activation`,razorpayOrderId:mode==='ORDER'?p.orderId:null,razorpayPaymentId:String(payment.paymentId),razorpayQrId:mode==='QR'?p.qrId:null,status:'SUCCESS'}}); return {balance:u.walletBalance,amount:p.amount,purpose:'ID_CREATION',paymentStatus:'Paid'};
  }
  const u=await tx.user.update({where:{id:p.userId},data:{walletBalance:{increment:p.amount}}});
  await tx.walletTransaction.create({data:{userId:p.userId,type:mode==='QR'?'RAZORPAY_QR':'RAZORPAY',amount:p.amount,purpose:'WALLET_RECHARGE',description:`Razorpay ${mode==='QR'?'QR':'Checkout'} wallet recharge`,razorpayOrderId:mode==='ORDER'?p.orderId:null,razorpayPaymentId:String(payment.paymentId),razorpayQrId:mode==='QR'?p.qrId:null,status:'SUCCESS'}}); return {balance:u.walletBalance,amount:p.amount,purpose:'WALLET_RECHARGE'};
 });
}

router.post('/razorpay/verify', async(req,res)=>{try{
 const {razorpay_order_id,razorpay_payment_id,razorpay_signature,userId}=req.body||{}; if(!keySecret||!razorpay_order_id||!razorpay_payment_id||!razorpay_signature||!userId)return res.status(400).json({error:'Incomplete payment verification data'});
 const expected=crypto.createHmac('sha256',keySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex'); if(!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(String(razorpay_signature))))return res.status(400).json({error:'Invalid Razorpay signature'});
 const payment=await prisma.razorpayPayment.findUnique({where:{orderId:razorpay_order_id}}); if(!payment||payment.userId!==String(userId))return res.status(404).json({error:'Payment order not found'}); if(payment.status==='CAPTURED')return res.json({success:true,alreadyProcessed:true,amount:payment.amount,purpose:payment.purpose});
 const updated=await settlePayment({orderId:razorpay_order_id,paymentId:razorpay_payment_id},'ORDER'); res.json({success:true,...updated});
}catch(e:any){res.status(500).json({error:e.message})}});

router.post('/razorpay/webhook', async(req,res)=>{try{
 const secret=process.env.RAZORPAY_WEBHOOK_SECRET||''; const signature=String(req.headers['x-razorpay-signature']||''); if(!secret)return res.status(500).json({error:'Webhook secret not configured'});
 const raw=Buffer.isBuffer(req.body)?req.body.toString('utf8'):JSON.stringify(req.body); const expected=crypto.createHmac('sha256',secret).update(raw).digest('hex'); if(expected!==signature)return res.status(400).json({error:'Invalid webhook signature'});
 const body=Buffer.isBuffer(req.body)?JSON.parse(req.body.toString('utf8')):req.body; const event=body?.event; const paymentEntity=body?.payload?.payment?.entity;
 if(event==='payment.captured'&&paymentEntity?.order_id) await settlePayment({orderId:paymentEntity.order_id,paymentId:paymentEntity.id},'ORDER');
 if(event==='qr_code.credited'&&paymentEntity?.id&&body?.payload?.qr_code?.entity?.id) await settlePayment({qrId:body.payload.qr_code.entity.id,paymentId:paymentEntity.id},'QR');
 res.json({ok:true});
}catch(e:any){res.status(500).json({error:e.message})}});
export default router;
