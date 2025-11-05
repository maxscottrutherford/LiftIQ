import type { NextConfig } from "next";
import { readFileSync } from 'fs';
import { join } from 'path';

// Force load .env.local to override system env vars
try {
  const envLocalPath = join(process.cwd(), '.env.local');
  const envContent = readFileSync(envLocalPath, 'utf-8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    const match = line.match(/^OPENAI_API_KEY=(.+)$/);
    if (match) {
      // Override process.env with value from .env.local
      process.env.OPENAI_API_KEY = match[1].trim();
      break;
    }
  }
} catch (error) {
  console.warn('Could not read .env.local:', error);
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
