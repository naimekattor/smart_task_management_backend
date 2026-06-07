import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_collaboration_secret_key_2026_xyz';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'smart_collaboration_refresh_secret_key_2026_abc';

export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }); // 1 day for dashboard convenience, standard is 15m but 1d is very common.
}

export function generateRefreshToken(payload: { id: string }): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): { id: string } {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
}
