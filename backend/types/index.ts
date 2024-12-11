export interface Position {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

export interface TokenMetadata {
  image?: string;
  name?: string;
  description?: string;
}

export interface Token {
  mint: string;
  amount: number;
  decimals: number;
  isNFT?: boolean;
  metadata?: TokenMetadata;
  logoURI?: string;
  symbol?: string;
}

export interface Drop {
  _id?: string;
  title: string;
  description: string;
  position: Position;
  tokens: Token[];
  walletAddress: string;
  status?: 'Active' | 'Claimed';
  txId?: string;
  createdAt?: Date;
}

export interface Profile {
  walletAddress: string;
  name: string;
  info: string;
  history: string[];
  avatar?: string;
  twitterHandle?: string;
  createdAt: Date;
  updatedAt?: Date;
}
