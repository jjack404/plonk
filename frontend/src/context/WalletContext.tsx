import React, { createContext, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletContextType, Profile } from '../types';
import axios from 'axios';

export const WalletContext = createContext<WalletContextType>({
  walletAddress: null,
  profile: null,
  updateProfile: async () => {},
});

const WalletContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { publicKey, disconnect } = useWallet();

  useEffect(() => {
    const initializeProfile = async (address: string) => {
      try {
        // Try to fetch existing profile
        const response = await axios.get<Profile>(
          `${import.meta.env.VITE_BACKEND_URL}/api/profile/${address}`
        );
        setProfile(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // Profile doesn't exist, create new one
          const newProfile = await axios.post<Profile>(
            `${import.meta.env.VITE_BACKEND_URL}/api/profile`,
            {},
            { headers: { 'wallet-address': address } }
          );
          setProfile(newProfile.data);
        } else {
          console.error('Error initializing profile:', error);
        }
      }
    };

    if (publicKey) {
      const address = publicKey.toString();
      setWalletAddress(address);
      initializeProfile(address);
    } else {
      setWalletAddress(null);
      setProfile(null);
    }
  }, [publicKey]);

  const updateProfile = async (updatedProfile: Partial<Profile>): Promise<void> => {
    if (!walletAddress) return;
    try {
      const response = await axios.put<Profile>(
        `${import.meta.env.VITE_BACKEND_URL}/api/profile`,
        updatedProfile,
        {
          headers: {
            'wallet-address': walletAddress
          }
        }
      );
      setProfile(response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <WalletContext.Provider value={{ 
      walletAddress, 
      profile, 
      updateProfile
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const WalletProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter()
  ];
  
  const endpoint = import.meta.env.VITE_RPC_URL;
  const validEndpoint = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `https://${endpoint}`;

  return (
    <ConnectionProvider endpoint={validEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextProvider>{children}</WalletContextProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
