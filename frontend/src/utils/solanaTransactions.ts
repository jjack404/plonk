import { 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Connection
} from '@solana/web3.js';
import { 
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import { Token } from '../types';

const VAULT_ADDRESS = import.meta.env.VITE_VAULT_WALLET_ADDRESS;

// Hardcode Helius RPC URL with API key
const connection = new Connection(
  'https://mainnet.helius-rpc.com/?api-key=1d9e4738-997d-41a7-b80b-a9c3423e6375',
  'confirmed'
);

export async function createDropTransaction(
  fromPubkey: PublicKey,
  tokens: { token: Token; amount: number }[]
): Promise<Transaction> {
  const transaction = new Transaction();
  const toPubkey = new PublicKey(VAULT_ADDRESS);

  try {
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = fromPubkey;

    for (const { token, amount } of tokens) {
      if (token.mint === 'So11111111111111111111111111111111111111112') {
        // Native SOL transfer
        transaction.add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: amount * LAMPORTS_PER_SOL
          })
        );
      } else {
        // SPL Token transfer
        const mintPubkey = new PublicKey(token.mint);
        const fromATA = await getAssociatedTokenAddress(mintPubkey, fromPubkey);
        const toATA = await getAssociatedTokenAddress(mintPubkey, toPubkey);

        // Check if destination ATA exists
        try {
          await connection.getAccountInfo(toATA);
        } catch {
          // If not, create it
          transaction.add(
            createAssociatedTokenAccountInstruction(
              fromPubkey,  // payer
              toATA,       // ata
              toPubkey,    // owner
              mintPubkey   // mint
            )
          );
        }

        transaction.add(
          createTransferInstruction(
            fromATA,
            toATA,
            fromPubkey,
            amount * Math.pow(10, token.decimals)
          )
        );
      }
    }

    return transaction;
  } catch (error) {
    console.error('Transaction creation error:', error);
    throw new Error('Failed to create transaction');
  }
}