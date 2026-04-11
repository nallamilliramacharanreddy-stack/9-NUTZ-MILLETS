import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from './mongodb';
import SecurityLog from '@/models/SecurityLog';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; lastRequest: number }>();

export const rateLimit = (ip: string, limit: number = 10, windowMs: number = 60000) => {
  const now = Date.now();
  const userData = rateLimitMap.get(ip) || { count: 0, lastRequest: now };

  if (now - userData.lastRequest > windowMs) {
    userData.count = 1;
    userData.lastRequest = now;
  } else {
    userData.count++;
  }

  rateLimitMap.set(ip, userData);

  if (userData.count > limit) {
    // Highly suspicious behavior logged automatically
    if (userData.count > limit * 3) {
      logSecurityEvent({
        event: 'RATE_LIMIT_EXCEEDED_CRITICAL',
        severity: 'WARN',
        ip,
        metadata: { count: userData.count, limit }
      });
    }
    return false;
  }
  return true;
};

// Advanced security logging
export const logSecurityEvent = async (data: {
  event: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  ip: string;
  userId?: string;
  metadata?: any;
}) => {
  try {
    await connectDB();
    await SecurityLog.create(data);
    
    if (data.severity === 'CRITICAL') {
      console.error(`🚨 CRITICAL SECURITY EVENT: ${data.event} from ${data.ip}`);
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

export const securityResponse = (message: string = 'Unauthorized access detected', status: number = 401) => {
  return NextResponse.json({ message, status: 'error' }, { status });
};

// Input validation schemas
export const schemas = {
  login: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  forgotPassword: z.object({
    email: z.string().email(),
  }),
  resetPassword: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    newPassword: z.string().min(8),
  }),
  product: z.object({
    name: z.string().min(3).max(100),
    description: z.string().min(10),
    price: z.number().positive(),
    category: z.enum(['cookies', 'laddus', 'snacks', 'grains', 'flours', 'flakes', 'noodles-pasta', 'ready-to-mix', 'others']),
    stock: z.number().int().min(0),
    featured: z.boolean().optional(),
    images: z.array(z.string()).optional(),
  }),
  profileUpdate: z.object({
    name: z.string().min(3).max(50),
    phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  }),
};
