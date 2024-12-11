import { Request, Response, NextFunction } from 'express';
import { PublicKey } from '@solana/web3.js';

export interface AuthenticatedRequest extends Request {
  walletAddress?: string;
}

export const checkWalletAddress = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const walletAddress = req.headers['wallet-address'] as string;

  if (!walletAddress) {
    res.status(401).json({ error: 'Wallet address is required' });
    return;
  }

  try {
    new PublicKey(walletAddress);
    req.walletAddress = walletAddress;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid wallet address' });
  }
};
