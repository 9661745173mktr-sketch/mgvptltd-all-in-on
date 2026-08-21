import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const router=Router(); const prisma=new PrismaClient();
router.get('/users', async (_req,res)=>{ try { const users=await prisma.user.findMany({orderBy:{createdAt:'desc'}}); res.json({users:users.map(({password,...u})=>u)}); } catch(e:any){res.status(500).json({error:e.message})} });
router.post('/users/:id/verify-activate', async (req,res)=>{ try { const user=await prisma.user.update({where:{id:String(req.params.id)},data:{paymentStatus:'Verified',accountStatus:'Active',approvedAt:new Date(),approvedBy:String(req.body?.adminId||'ADMIN')}}); const {password,...safe}=user; res.json({message:'Payment verified and account activated.',user:safe}); } catch(e:any){res.status(404).json({error:'User not found'})} });
export default router;
