import { Router } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const router=Router();
const prisma=new PrismaClient();
const keyId=process.env.RAZORPAY_KEY_ID||'';
const keySecret=process.env.RAZORPAY_KEY_SECRET||'';
const apiBase='https://api.razorpay.com/v1';

router.post('/razorpay/order', async(req,res)=>{
  try{
    const {amount,userId}=req.body||{}; const n=Number(amount);
    if(!keyId||!keySecret) return res.status(500).json({error:'Razorpay live keys are not configured on server'});
    if(!userId||!Number.isFinite(n)||n<10) return res.status(400).json({error:'Invalid user or amount'});
    const user=await prisma.user.findUnique({where:{id:String(userId)}}); if(!user) return res.status(404).json({error:'User not found'});
    const auth=Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const rr=await fetch(`${apiBase}/orders`,{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/json'},body:JSON.stringify({amount:Math.round(n*100),currency:'INR',receipt:`wallet_${user.id}_${Date.now()}`,notes:{userId:user.id}})});
    const order:any=await rr.json(); if(!rr.ok) return res.status(rr.status).json({error:order?.error?.description||'Razorpay order creation failed'});
    await prisma.razorpayPayment.create({data:{userId:user.id,orderId:order.id,amount:n,status:'CREATED'}});
    res.json({keyId,orderId:order.id,amount:Math.round(n*100),currency:'INR'});
  }catch(e:any){res.status(500).json({error:e.message});}
});

router.post('/razorpay/verify', async(req,res)=>{
  try{
    const {razorpay_order_id,razorpay_payment_id,razorpay_signature,userId}=req.body||{};
    if(!keySecret||!razorpay_order_id||!razorpay_payment_id||!razorpay_signature||!userId) return res.status(400).json({error:'Incomplete payment verification data'});
    const expected=crypto.createHmac('sha256',keySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if(!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(String(razorpay_signature)))) return res.status(400).json({error:'Invalid Razorpay signature'});
    const payment=await prisma.razorpayPayment.findUnique({where:{orderId:razorpay_order_id}}); if(!payment||payment.userId!==String(userId)) return res.status(404).json({error:'Payment order not found'});
    if(payment.status==='CAPTURED') return res.json({success:true,alreadyProcessed:true,amount:payment.amount});
    const updated=await prisma.$transaction(async(tx)=>{
      const p=await tx.razorpayPayment.update({where:{id:payment.id},data:{paymentId:razorpay_payment_id,status:'CAPTURED'}});
      const u=await tx.user.update({where:{id:String(userId)},data:{walletBalance:{increment:payment.amount}}});
      await tx.walletTransaction.create({data:{userId:String(userId),type:'RAZORPAY',amount:payment.amount,description:'Razorpay wallet recharge',razorpayOrderId:razorpay_order_id,razorpayPaymentId:razorpay_payment_id,status:'SUCCESS'}});
      return {balance:u.walletBalance,amount:payment.amount};
    });
    res.json({success:true,...updated});
  }catch(e:any){res.status(500).json({error:e.message});}
});

router.post('/razorpay/webhook', async(req,res)=>{
  try{
    const secret=process.env.RAZORPAY_WEBHOOK_SECRET||''; const signature=String(req.headers['x-razorpay-signature']||'');
    if(!secret) return res.status(500).json({error:'Webhook secret not configured'});
    const raw=Buffer.isBuffer(req.body)?req.body.toString('utf8'):JSON.stringify(req.body); const expected=crypto.createHmac('sha256',secret).update(raw).digest('hex');
    if(expected!==signature) return res.status(400).json({error:'Invalid webhook signature'});
    const body=Buffer.isBuffer(req.body)?JSON.parse(req.body.toString('utf8')):req.body; const event=body?.event; const entity=body?.payload?.payment?.entity; if(event==='payment.captured'&&entity?.order_id){
      const p=await prisma.razorpayPayment.findUnique({where:{orderId:entity.order_id}});
      if(p&&p.status!=='CAPTURED'){await prisma.$transaction(async(tx)=>{await tx.razorpayPayment.update({where:{id:p.id},data:{paymentId:entity.id,status:'CAPTURED'}}); await tx.user.update({where:{id:p.userId},data:{walletBalance:{increment:p.amount}}}); await tx.walletTransaction.create({data:{userId:p.userId,type:'RAZORPAY',amount:p.amount,description:'Razorpay webhook wallet recharge',razorpayOrderId:p.orderId,razorpayPaymentId:entity.id,status:'SUCCESS'}});});}
    }
    res.json({ok:true});
  }catch(e:any){res.status(500).json({error:e.message});}
});
export default router;
