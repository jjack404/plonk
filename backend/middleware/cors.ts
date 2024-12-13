import cors from 'cors';

export const corsMiddleware = cors({
  origin: ['https://plonk-frontend.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'wallet-address']
}); 