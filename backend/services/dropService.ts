import { Drop } from '../models/Drop';
import { AppError } from '../middleware/errorHandler';

export const createDrop = async (dropData: any, walletAddress: string) => {
  try {
    const drop = new Drop({
      ...dropData,
      walletAddress,
      status: 'Active',
      txId: 'pending'
    });
    return await drop.save();
  } catch (error) {
    throw new AppError('Failed to create drop', 500);
  }
};

export const getAllDrops = async () => {
  try {
    return await Drop.find({ status: 'Active' });
  } catch (error) {
    throw new AppError('Failed to fetch drops', 500);
  }
};

export const getDropsByWallet = async (walletAddress: string) => {
  try {
    return await Drop.find({ walletAddress });
  } catch (error) {
    throw new AppError('Failed to fetch wallet drops', 500);
  }
};

export const updateDropTransaction = async (
  dropId: string,
  walletAddress: string,
  txId: string
) => {
  try {
    return await Drop.findOneAndUpdate(
      { _id: dropId, walletAddress },
      { txId },
      { new: true }
    );
  } catch (error) {
    throw new AppError('Failed to update transaction ID', 500);
  }
};
