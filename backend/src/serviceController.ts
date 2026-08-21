import { Request, Response } from 'express';

const serviceController = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Service processed successfully from backend!',
    txId: 'TXN-' + Math.floor(Math.random() * 1000000)
  });
};

export default serviceController;