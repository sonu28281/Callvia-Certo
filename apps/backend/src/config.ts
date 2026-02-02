import { config as dotenvConfig } from 'dotenv';
import path from 'path';

// Load .env from workspace root (not backend folder)
dotenvConfig({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  
  // Features
  mockMode: process.env.MOCK_MODE === 'true',
  
  // External Services
  kycProvider: process.env.KYC_PROVIDER || 'ONFIDO',
  voiceProvider: process.env.VOICE_PROVIDER || 'TWILIO',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
} as const;
