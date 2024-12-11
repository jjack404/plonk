//deprecated old server file
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const Drop = require('./models/Drop');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS
app.use(cors({
  origin: ['https://plonk-frontend.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'wallet-address']
}));

app.use(bodyParser.json());

const connection = new Connection('https://api.devnet.solana.com/');

// Connect to MongoDB
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not defined in the environment variables');
  process.exit(1);
}
mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Define Profile Schema
const profileSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  name: { type: String, default: 'Anonymous' },
  info: { type: String, default: '' },
  history: { type: [String], default: [] },
  twitterHandle: { type: String, default: '' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const Profile = mongoose.model('Profile', profileSchema);

// Middleware to check wallet address
const checkWalletAddress = (req, res, next) => {
  const walletAddress = req.headers['wallet-address'];
  if (!walletAddress) {
    return res.status(401).json({ error: 'Wallet address is required' });
  }
  req.walletAddress = walletAddress;
  next();
};

// Rate limiter middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use('/api/', apiLimiter);

// Cache setup
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

// Define makeApiRequest function with caching and retry logic
const makeApiRequest = async (url, data) => {
  const cacheKey = `${url}-${JSON.stringify(data)}`;
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  const maxRetries = 3;
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await axios.post(url, data);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Rate limit error, wait and retry
        const retryAfter = error.response.headers['retry-after'] || 1;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        attempt++;
      } else {
        console.error('Error making API request:', error);
        throw error;
      }
    }
  }
  throw new Error('Max retries reached');
};

// Fetch profile
app.get('/api/profile/:walletAddress', async (req, res) => {
  try {
    const profile = await Profile.findOne({ walletAddress: req.params.walletAddress });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
app.put('/api/profile', checkWalletAddress, async (req, res) => {
  try {
    const { name, info } = req.body;
    const profile = await Profile.findOneAndUpdate(
      { walletAddress: req.walletAddress },
      { name, info },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Create profile
app.post('/api/profile', checkWalletAddress, async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { walletAddress: req.walletAddress },
      { $setOnInsert: { name: 'Anonymous', info: '', history: [] } },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// Fetch tokens
app.get('/api/tokens', checkWalletAddress, async (req, res) => {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(req.walletAddress),
      { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
    );

    const tokens = tokenAccounts.value.map(account => {
      const tokenInfo = account.account.data.parsed.info;
      return {
        mint: tokenInfo.mint,
        amount: tokenInfo.tokenAmount.uiAmount,
        decimals: tokenInfo.tokenAmount.decimals,
        isNFT: tokenInfo.tokenAmount.decimals === 0 && tokenInfo.tokenAmount.uiAmount === 1
      };
    }).filter(token => token.amount > 0); // Filter out tokens with a true zero balance

    // Fetch metadata for NFTs
    const nftTokens = tokens.filter(token => token.isNFT);
    const nftMetadataPromises = nftTokens.map(async (token) => {
      const response = await makeApiRequest(process.env.HELIUS_RPC_URL, {
        jsonrpc: "2.0",
        id: 1,
        method: "getAsset",
        params: {
          id: token.mint
        }
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

    const nftMetadata = await Promise.all(nftMetadataPromises);

    // Fetch metadata for fungible tokens
    const fungibleTokens = tokens.filter(token => !token.isNFT);
    const fungibleMetadataPromises = fungibleTokens.map(async (token) => {
      const response = await makeApiRequest(process.env.HELIUS_RPC_URL, {
        jsonrpc: "2.0",
        id: 1,
        method: "getAsset",
        params: {
          id: token.mint
        }
      });
      const metadata = response.result?.content;
      return {
        ...token,
        logoURI: metadata?.links?.image || metadata?.files?.[0]?.uri,
        symbol: metadata?.metadata?.symbol // Fetch the ticker symbol
      };
    });

    const fungibleMetadata = await Promise.all(fungibleMetadataPromises);

    // Fetch SOL balance
    const solBalance = await connection.getBalance(new PublicKey(req.walletAddress));
    const solToken = {
      mint: 'So11111111111111111111111111111111111111112', // SOL mint address
      amount: solBalance / Math.pow(10, 9), // Convert lamports to SOL
      decimals: 9,
      symbol: 'SOL',
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png'
    };

    console.log('Fetched fungible tokens:', fungibleMetadata); // Add this line to log the fungible tokens

    const allTokens = [...nftMetadata, solToken, ...fungibleMetadata];

    console.log('Fetched all tokens:', allTokens); // Add this line to log all tokens

    res.json(allTokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
});

// Save drop
app.post('/api/drops', checkWalletAddress, async (req, res) => {
  try {
    const dropData = { 
      ...req.body, 
      walletAddress: req.walletAddress,
      status: 'Active',
      txId: 'pending' // We'll update this once we have the actual transaction
    };
    
    const drop = new Drop(dropData);
    await drop.save();
    
    res.status(201).json(drop);
  } catch (error) {
    console.error('Error saving drop:', error);
    res.status(500).json({ error: 'Failed to save drop' });
  }
});

// Add new endpoint to update txId
app.put('/api/drops/:id/transaction', checkWalletAddress, async (req, res) => {
  try {
    const { txId } = req.body;
    const drop = await Drop.findOneAndUpdate(
      { _id: req.params.id, walletAddress: req.walletAddress },
      { txId },
      { new: true }
    );
    
    if (!drop) {
      return res.status(404).json({ error: 'Drop not found' });
    }
    
    res.json(drop);
  } catch (error) {
    console.error('Error updating transaction ID:', error);
    res.status(500).json({ error: 'Failed to update transaction ID' });
  }
});

// Get all drops
app.get('/api/drops', async (req, res) => {
  try {
    const drops = await Drop.find({ status: 'Active' });
    res.json(drops);
  } catch (error) {
    console.error('Error fetching drops:', error);
    res.status(500).json({ error: 'Failed to fetch drops' });
  }
});

// Get drops by wallet address
app.get('/api/drops/wallet/:walletAddress', async (req, res) => {
  try {
    const drops = await Drop.find({ 
      walletAddress: req.params.walletAddress 
    });
    res.json(drops);
  } catch (error) {
    console.error('Error fetching wallet drops:', error);
    res.status(500).json({ error: 'Failed to fetch wallet drops' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
