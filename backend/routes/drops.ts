import express, { RequestHandler } from 'express';
import { checkWalletAddress, AuthenticatedRequest } from '../middleware/auth';
import { locationCheckLimiter } from '../middleware/rateLimiter';
import { 
  createDrop, 
  getAllDrops, 
  getDropsByWallet,
  updateDropTransaction 
} from '../services/dropService';
import { createClaimTransaction } from '../services/claimService';
import { Drop } from '../models/Drop';

const router = express.Router();

const createDropHandler: RequestHandler = async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const drop = await createDrop(req.body, req.walletAddress!);
    res.status(201).json(drop);
  } catch (error) {
    next(error);
  }
};

const getAllDropsHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const drops = await getAllDrops();
    res.json(drops);
  } catch (error) {
    next(error);
  }
};

const getWalletDropsHandler: RequestHandler<{ walletAddress: string }> = async (req, res, next): Promise<void> => {
  try {
    const drops = await getDropsByWallet(req.params.walletAddress);
    res.json(drops);
  } catch (error) {
    next(error);
  }
};

const updateTransactionHandler: RequestHandler = async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const drop = await updateDropTransaction(
      req.params.id,
      req.walletAddress!,
      req.body.txId,
      req.body.status
    );
    if (!drop) {
      res.status(404).json({ error: 'Drop not found' });
      return;
    }
    res.json(drop);
  } catch (error) {
    next(error);
  }
};

router.post('/', checkWalletAddress, createDropHandler);
router.get('/', getAllDropsHandler);
router.get('/wallet/:walletAddress', getWalletDropsHandler);
router.put('/:id/transaction', checkWalletAddress, updateTransactionHandler);
router.post('/:id/claim', checkWalletAddress, locationCheckLimiter, async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const drop = await Drop.findOne({ _id: req.params.id, status: 'Active' });
    
    if (!drop) {
      res.status(404).json({ error: 'Drop not found or already claimed' });
      return;
    }

    const transaction = await createClaimTransaction(drop, req.walletAddress!);
    
    res.json({
      transaction: transaction.serialize({ verifySignatures: false }).toString('base64'),
      drop
    });
  } catch (error) {
    next(error);
  }
});

export default router;
