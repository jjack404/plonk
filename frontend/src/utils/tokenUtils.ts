import { Token } from '../types';
import axios from 'axios';

export const fetchFungibleTokens = async (walletAddress: string): Promise<Token[]> => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tokens`, {
      headers: {
        'wallet-address': walletAddress
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }
}; 