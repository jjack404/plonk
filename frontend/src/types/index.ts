export interface Position {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  x?: number;
  y?: number;
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
}

export interface WalletContextType {
  walletAddress: string | null;
  profile: Profile | null;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
}

export interface NavBarProps {
  onProfileClick: () => void;
}

export interface UserProfileProps {
  walletAddress: string | null;
  profile: Profile | null;
  onClose: () => void;
}

export interface LootFormProps {
  position: Position;
  onClose: () => void;
  onSubmit: (data: Drop) => Promise<void>;
  setTxStatus: (status: { type: 'pending' | 'success', txId?: string } | null) => void;
}

export interface MapProps {}

export interface MapStyler {
  saturation?: number;
  color?: string;
  lightness?: number;
  visibility?: string;
  weight?: number;
}

export interface MapStyle {
  featureType: string;
  elementType: string;
  stylers: MapStyler[];
}

export interface Marker extends Drop {
  position: Position;
}

export interface MapRef {
  getZoom: () => number;
  getBounds: () => google.maps.LatLngBounds;
  getProjection: () => google.maps.Projection;
}
