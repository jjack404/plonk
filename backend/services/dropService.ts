import { Drop } from '../models/Drop';
import { AppError } from '../middleware/errorHandler';

export const createDrop = async (dropData: any, walletAddress: string) => {
  try {
    console.log('Creating drop with data:', {
      ...dropData,
      walletAddress
    });
    
    const drop = new Drop({
      ...dropData,
      walletAddress,
      status: 'Active',
      txId: 'pending'
    });

    // Log validation errors if any
    const validationError = drop.validateSync();
    if (validationError) {
      console.error('Drop validation error:', validationError);
      throw new AppError(`Validation failed: ${JSON.stringify(validationError.errors)}`, 400);
    }

    const savedDrop = await drop.save();
    console.log('Drop created successfully:', savedDrop);
    return savedDrop;
  } catch (error) {
    console.error('Failed to create drop:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      dropData,
      walletAddress
    });
    
    if (error instanceof AppError) {
      throw error;
    }
    
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
  txId: string,
  status?: string
) => {
  try {
    const updateData: any = { txId };
    if (status) {
      updateData.status = status;
    }

    return await Drop.findOneAndUpdate(
      { _id: dropId },
      updateData,
      { new: true }
    );
  } catch (error) {
    throw new AppError('Failed to update transaction ID', 500);
  }
};
