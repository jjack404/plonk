import { Profile, IProfile } from '../models/Profile';
import { AppError } from '../middleware/errorHandler';

export const getProfile = async (walletAddress: string) => {
  try {
    return await Profile.findOne({ walletAddress });
  } catch (error) {
    throw new AppError('Failed to fetch profile', 500);
  }
};

export const createOrUpdateProfile = async (
  walletAddress: string,
  profileData: Partial<IProfile>
) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { walletAddress },
      { 
        ...profileData,
        walletAddress,
        updatedAt: new Date()
      },
      { 
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
    return profile;
  } catch (error) {
    throw new AppError('Failed to update profile', 500);
  }
};

export const getProfileHistory = async (walletAddress: string) => {
  try {
    const profile = await Profile.findOne({ walletAddress });
    if (!profile) {
      return [];
    }
    return profile.history || [];
  } catch (error) {
    throw new AppError('Failed to fetch profile history', 500);
  }
};
