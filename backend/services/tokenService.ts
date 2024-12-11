import { AppError } from '../middleware/errorHandler';
import { 
  fetchTokenAccounts, 
  fetchNFTMetadata, 
  fetchFungibleMetadata, 
  fetchSolBalance 
} from '../utils/apiUtils';

export const getWalletTokens = async (walletAddress: string) => {
  try {
    const tokens = await fetchTokenAccounts(walletAddress);
    const [nftMetadata, fungibleMetadata] = await Promise.all([
      fetchNFTMetadata(tokens),
      fetchFungibleMetadata(tokens)
    ]);
    const solToken = await fetchSolBalance(walletAddress);
    
    return [...nftMetadata, solToken, ...fungibleMetadata];
  } catch (error) {
    throw new AppError('Failed to fetch wallet tokens', 500);
  }
};
