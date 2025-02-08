import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Token } from '../types';
import axios from 'axios';

// Use a regular RPC endpoint for SOL balance
const connection = new Connection('https://api.mainnet-beta.solana.com');
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

export const getWalletTokens = async (walletAddress: string): Promise<Token[]> => {
  try {
    // First get SOL balance
    const solBalance = await connection.getBalance(new PublicKey(walletAddress));
    const tokens: Token[] = [{
      mint: 'So11111111111111111111111111111111111111112',
      amount: solBalance / LAMPORTS_PER_SOL,
      decimals: 9,
      symbol: 'SOL',
      isNFT: false,
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
      metadata: {
        name: 'Solana',
        image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png'
      }
    }];

    // Fetch NFTs using updated Helius API
    const response = await axios.post(
      'https://mainnet.helius-rpc.com',
      {
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 1000
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HELIUS_API_KEY}`
        }
      }
    );

    console.log('Helius API Response:', response.data);

    if (response.data.error) {
      console.error('Helius API error:', response.data.error);
      return tokens;
    }

    const assets = response.data.result || [];
    console.log(`Found ${assets.length} NFTs for wallet ${walletAddress}`);
    
    const nftTokens = assets.map((asset: any) => {
      const imageUri = asset.content?.files?.[0]?.uri || 
                      asset.content?.links?.image ||
                      asset.content?.json?.image ||
                      '';

      const formattedImageUri = imageUri.startsWith('ipfs://')
        ? `https://ipfs.io/ipfs/${imageUri.slice(7)}`
        : imageUri;

      return {
        mint: asset.id,
        amount: 1,
        decimals: 0,
        isNFT: true,
        symbol: asset.content?.metadata?.symbol || 'NFT',
        logoURI: formattedImageUri,
        metadata: {
          name: asset.content?.metadata?.name || 'Unnamed NFT',
          image: formattedImageUri,
          description: asset.content?.metadata?.description || ''
        }
      };
    });

    console.log(`Successfully processed ${nftTokens.length} NFTs`);
    return [...tokens, ...nftTokens];
  } catch (error: any) {
    console.error('Error fetching wallet tokens:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};
