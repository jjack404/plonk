import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { checkWalletAddress, AuthenticatedRequest } from '../middleware/auth';
import { 
  getProfile, 
  createOrUpdateProfile, 
  getProfileHistory 
} from '../services/profileService';

const router = express.Router();

const getProfileHandler: RequestHandler<{ walletAddress: string }> = async (req, res, next): Promise<void> => {
  try {
    const profile = await getProfile(req.params.walletAddress);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

const updateProfileHandler: RequestHandler = async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const profile = await createOrUpdateProfile(req.walletAddress!, req.body);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

const getHistoryHandler: RequestHandler<{ walletAddress: string }> = async (req, res, next): Promise<void> => {
  try {
    const history = await getProfileHistory(req.params.walletAddress);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

router.get('/:walletAddress', getProfileHandler);
router.put('/', checkWalletAddress, updateProfileHandler);
router.get('/:walletAddress/history', getHistoryHandler);

export default router;
