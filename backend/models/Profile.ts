import mongoose, { Document, Schema } from 'mongoose';

export interface IProfile extends Document {
  walletAddress: string;
  name: string;
  info: string;
  history: string[];
  avatar?: string;
  twitterHandle?: string;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>({
  walletAddress: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  info: { 
    type: String, 
    default: '' 
  },
  history: [{ 
    type: String 
  }],
  avatar: String,
  twitterHandle: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Profile = mongoose.model<IProfile>('Profile', profileSchema);
