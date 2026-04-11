import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || '9-nutzz-millets-secure-2024-placeholder';
const REFRESH_SECRET = process.env.REFRESH_SECRET || '9-nutzz-millets-refresh-secure-2024-placeholder';

export interface UserToken {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

// Access tokens are short-lived (15 minutes)
export const signAccessToken = (user: UserToken): string => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Refresh tokens are long-lived (7 days)
export const signRefreshToken = (user: { id: string }): string => {
  return jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyAccessToken = (token: string): UserToken | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as UserToken;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): { id: string } | null => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { id: string };
  } catch (error) {
    return null;
  }
};

// Hash token for secure storage in DB
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Simplified verifyToken for backward compatibility during transition
export const verifyToken = verifyAccessToken;
