import { Connection, PublicKey } from '@solana/web3.js';
import { makeApiRequest } from '../config/cache';
import { Token } from '../types';
import axios from 'axios';
import NodeCache from 'node-cache';

const tokenCache = new NodeCache({ stdTTL: 300 }); // 5 minute cache
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const JUPITER_TOKEN_LIST_URL = 'https://token.jup.ag/strict';

let tokenList: { [key: string]: any } = {};

async function getJupiterTokenList() {
  if (Object.keys(tokenList).length > 0) return tokenList;
  try {
    const response = await axios.get(JUPITER_TOKEN_LIST_URL);
    tokenList = response.data.reduce((acc: any, token: any) => {
      acc[token.address] = token;
      return acc;
    }, {});
    return tokenList;
  } catch (error) {
    console.error('Error fetching Jupiter token list:', error);
    return {};
  }
}

export const getWalletTokens = async (walletAddress: string): Promise<Token[]> => {
  // Check cache first
  const cacheKey = `tokens-${walletAddress}`;
  const cachedTokens = tokenCache.get<Token[]>(cacheKey);
  if (cachedTokens) return cachedTokens;

  try {
    const jupiterTokens = await getJupiterTokenList();
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(walletAddress),
      { programId: new PublicKey(TOKEN_PROGRAM_ID) }
    );

    // 2. Process token accounts
    const tokens = tokenAccounts.value
      .map(account => {
        const tokenInfo = account.account.data.parsed.info;
        const amount = Number(tokenInfo.tokenAmount.uiAmount);
        
        if (!amount || amount <= 0) return null;

        const isNFT = tokenInfo.tokenAmount.decimals === 0 && amount === 1;
        const jupiterToken = jupiterTokens[tokenInfo.mint];

        return {
          mint: tokenInfo.mint,
          amount,
          decimals: tokenInfo.tokenAmount.decimals,
          isNFT,
          symbol: isNFT ? 'NFT' : (jupiterToken?.symbol || 'Unknown'),
          logoURI: isNFT ? undefined : jupiterToken?.logoURI,
          metadata: {
            name: isNFT ? undefined : jupiterToken?.name,
            image: isNFT ? undefined : jupiterToken?.logoURI
          }
        };
      })
      .filter((token): token is NonNullable<typeof token> => token !== null);

    // 3. Add SOL balance
    const solBalance = await connection.getBalance(new PublicKey(walletAddress));
    const solToken: Token = {
      mint: 'So11111111111111111111111111111111111111112',
      amount: solBalance / Math.pow(10, 9),
      decimals: 9,
      symbol: 'SOL',
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
      isNFT: false,
      metadata: {
        name: 'Solana',
        image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png'
      }
    };

    const result = [solToken, ...tokens];
    tokenCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error in getWalletTokens:', error);
    throw error; // Let the error handler deal with it
  }
};
