import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { makeApiRequest } from '../config/cache';
import { getWalletTokens } from '../services/tokenService';

const connection = new Connection('https://api.mainnet-beta.solana.com/', 'confirmed');

export const fetchTokenAccounts = async (walletAddress: string) => {
  try {
    return await getWalletTokens(walletAddress);
  } catch (error) {
    console.error('Error fetching token accounts:', error);
    return [];
  }
};

export const fetchFungibleMetadata = async (tokens: any[]) => {
  if (!process.env.HELIUS_RPC_URL) {
    console.error('HELIUS_RPC_URL is not defined');
    return [];
  }

  const fungibleTokens = tokens.filter(token => !token.isNFT);
  const fungibleMetadataPromises = fungibleTokens.map(async (token) => {
    try {
      const response = await makeApiRequest(process.env.HELIUS_RPC_URL!, {
        jsonrpc: "2.0",
        id: 1,
        method: "getAsset",
        params: { id: token.mint }
      });
      const metadata = response.result?.content;
      return {
        ...token,
        logoURI: metadata?.links?.image || metadata?.files?.[0]?.uri,
        symbol: metadata?.metadata?.symbol || 'Unknown'
      };
    } catch (error) {
      console.error(`Error fetching token metadata for ${token.mint}:`, error);
      return null;
    }
  });
  
  const results = await Promise.all(fungibleMetadataPromises);
  return results.filter(Boolean);
};

export const fetchSolBalance = async (walletAddress: string) => {
  const solBalance = await connection.getBalance(new PublicKey(walletAddress));
  return {
    mint: 'So11111111111111111111111111111111111111112',
    amount: solBalance / Math.pow(10, 9),
    decimals: 9,
    symbol: 'SOL',
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png'
  };
};
