import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { makeApiRequest } from '../config/cache';

const connection = new Connection('https://api.mainnet-beta.solana.com/', 'confirmed');

export const fetchTokenAccounts = async (walletAddress: string) => {
  try {
    console.log('Fetching token accounts for:', walletAddress);
    
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(walletAddress),
      { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
    );

    console.log('Raw token accounts response:', tokenAccounts);

    const tokens = tokenAccounts.value
      .map(account => {
        const tokenInfo = account.account.data.parsed.info;
        const amount = Number(tokenInfo.tokenAmount.uiAmount);
        
        if (!amount || amount <= 0) return null;

        return {
          mint: tokenInfo.mint,
          amount: amount,
          decimals: tokenInfo.tokenAmount.decimals,
          isNFT: tokenInfo.tokenAmount.decimals === 0 && amount === 1
        };
      })
      .filter(Boolean);

    console.log('Processed tokens:', tokens);
    return tokens;
  } catch (error) {
    console.error('Error in fetchTokenAccounts:', error);
    return [];
  }
};

export const fetchNFTMetadata = async (tokens: any[]) => {
  if (!process.env.HELIUS_RPC_URL) {
    console.error('HELIUS_RPC_URL is not defined');
    return [];
  }

  const nftTokens = tokens.filter(token => token.isNFT);
  console.log('NFT tokens found:', nftTokens);
  
  const nftMetadataPromises = nftTokens.map(async (token) => {
    try {
      const response = await makeApiRequest(process.env.HELIUS_RPC_URL!, {
        jsonrpc: "2.0",
        id: 1,
        method: "getAsset",
        params: { id: token.mint }
      });
      
      const metadata = response.result?.content;
      console.log('NFT metadata response for', token.mint, ':', metadata);

      if (!metadata) {
        console.error('No metadata found for NFT:', token.mint);
        return null;
      }

      // Extract URI from metadata
      const uri = metadata.json_uri || metadata.metadata?.uri;
      const image = metadata.links?.image || 
                   metadata.files?.[0]?.uri || 
                   (metadata.metadata?.data?.uri) ||
                   '';

      return {
        ...token,
        uri,
        metadata: {
          image,
          name: metadata.metadata?.name || 'Unnamed NFT',
          description: metadata.metadata?.description || '',
          symbol: metadata.metadata?.symbol || 'NFT'
        }
      };
    } catch (error) {
      console.error(`Error fetching NFT metadata for ${token.mint}:`, error);
      return null;
    }
  });
  
  const results = await Promise.all(nftMetadataPromises);
  const validResults = results.filter(Boolean);
  console.log('Final NFT list:', validResults);
  return validResults;
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
