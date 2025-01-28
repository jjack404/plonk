import express, { RequestHandler } from 'express';
import { getWalletTokens } from '../services/tokenService';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Add rate limiting
const tokenRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many requests, please try again later' }
});

const getTokensHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const walletAddress = req.headers['wallet-address'] as string;
    if (!walletAddress) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }
    
    const tokens = await getWalletTokens(walletAddress);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
};

router.get('/', tokenRateLimiter, getTokensHandler);

export default router;