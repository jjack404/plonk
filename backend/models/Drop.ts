import mongoose, { Document, Schema } from 'mongoose';
import { Position, Token } from '../types';

export interface IDrop extends Document {
  title: string;
  description: string;
  position: Position;
  tokens: Token[];
  walletAddress: string;
  status: 'Active' | 'Claimed';
  txId: string;
  createdAt: Date;
}

const dropSchema = new Schema<IDrop>({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  position: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    city: String,
    country: String
  },
  tokens: [{
    mint: { type: String, required: true },
    amount: { type: Number, required: true },
    decimals: { type: Number, required: true },
    isNFT: { type: Boolean, default: false },
    metadata: {
      image: String,
      name: String,
      description: String
    },
    logoURI: String,
    symbol: String
  }],
  walletAddress: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Claimed'], 
    default: 'Active' 
  },
  txId: { 
    type: String, 
    required: true,
    default: 'pending'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Drop = mongoose.model<IDrop>('Drop', dropSchema);
