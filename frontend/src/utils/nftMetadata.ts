import { Connection } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { publicKey } from '@metaplex-foundation/umi';
import { fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata';

export async function fetchNFTMetadata(
  connection: Connection,
  mintAddress: string
) {
  try {
    // Create UMI instance
    const umi = createUmi(connection.rpcEndpoint);

    // Fetch the digital asset data
    const asset = await fetchDigitalAsset(umi, publicKey(mintAddress));
    
    if (!asset) {
      throw new Error('NFT not found');
    }

    // Fetch JSON metadata if uri exists
    let jsonMetadata = null;
    if (asset.metadata.uri) {
      try {
        const response = await fetch(asset.metadata.uri);
        jsonMetadata = await response.json();
      } catch (error) {
        console.error('Error fetching JSON metadata:', error);
      }
    }

    return {
      name: asset.metadata.name || 'Unnamed NFT',
      symbol: asset.metadata.symbol,
      image: jsonMetadata?.image || asset.metadata.uri,
      description: jsonMetadata?.description,
      attributes: jsonMetadata?.attributes,
    };
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
} 