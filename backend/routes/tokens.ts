import express from 'express';
import { checkWalletAddress, AuthenticatedRequest } from '../middleware/auth';
import { getWalletTokens } from '../services/tokenService';
import { Response, NextFunction } from 'express';

const router = express.Router();

router.get('/', checkWalletAddress, async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokens = await getWalletTokens(req.walletAddress!);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

export default router;
