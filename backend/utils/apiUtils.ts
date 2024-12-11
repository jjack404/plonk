import { Connection, PublicKey } from '@solana/web3.js';
import { makeApiRequest } from '../config/cache';

const connection = new Connection('https://api.devnet.solana.com/');

export const fetchTokenAccounts = async (walletAddress: string) => {
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    new PublicKey(walletAddress),
    { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
  );

  return tokenAccounts.value.map(account => {
    const tokenInfo = account.account.data.parsed.info;
    return {
      mint: tokenInfo.mint,
      amount: tokenInfo.tokenAmount.uiAmount,
      decimals: tokenInfo.tokenAmount.decimals,
      isNFT: tokenInfo.tokenAmount.decimals === 0 && tokenInfo.tokenAmount.uiAmount === 1
    };
  }).filter(token => token.amount > 0);
};

export const fetchNFTMetadata = async (tokens: any[]) => {
  const nftTokens = tokens.filter(token => token.isNFT);
  const nftMetadataPromises = nftTokens.map(async (token) => {
    const response = await makeApiRequest(process.env.HELIUS_RPC_URL!, {
      jsonrpc: "2.0",
      id: 1,
      method: "getAsset",
      params: { id: token.mint }
    });
    const metadata = response.result?.content;
    return {
      ...token,
      metadata: {
        image: metadata?.links?.image || metadata?.files?.[0]?.uri,
        name: metadata?.metadata?.name,
        description: metadata?.metadata?.description
      }
    };
  });
  return Promise.all(nftMetadataPromises);
};

export const fetchFungibleMetadata = async (tokens: any[]) => {
  const fungibleTokens = tokens.filter(token => !token.isNFT);
  const fungibleMetadataPromises = fungibleTokens.map(async (token) => {
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
      symbol: metadata?.metadata?.symbol
    };
  });
  return Promise.all(fungibleMetadataPromises);
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
