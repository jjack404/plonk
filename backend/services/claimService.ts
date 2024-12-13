import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';
import { IDrop } from '../models/Drop';
import bs58 from 'bs58';

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
const vaultKeypair = Keypair.fromSecretKey(bs58.decode(process.env.VAULT_PRIVATE_KEY!));

export async function createClaimTransaction(
  drop: IDrop,
  claimerAddress: string
): Promise<Transaction> {
  const transaction = new Transaction();
  const token = drop.tokens[0];
  const claimerPubkey = new PublicKey(claimerAddress);

  // Get recent blockhash first
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = claimerPubkey;

  if (token.mint === 'So11111111111111111111111111111111111111112') {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: vaultKeypair.publicKey,
        toPubkey: claimerPubkey,
        lamports: token.amount * LAMPORTS_PER_SOL
      })
    );
  } else {
    // Handle SPL token transfer
    const fromATA = await getAssociatedTokenAddress(
      new PublicKey(token.mint),
      vaultKeypair.publicKey
    );
    
    const toATA = await getAssociatedTokenAddress(
      new PublicKey(token.mint),
      claimerPubkey
    );

    transaction.add(
      createTransferInstruction(
        fromATA,
        toATA,
        vaultKeypair.publicKey,
        token.amount * Math.pow(10, token.decimals)
      )
    );
  }

  // Partially sign with vault wallet
  transaction.partialSign(vaultKeypair);
  
  return transaction;
} 