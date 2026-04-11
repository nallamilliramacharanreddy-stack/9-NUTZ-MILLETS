import { logSecurityEvent } from './security';

export type SecurityEvent = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGIN_FAILURE_UNKNOWN_USER'
  | 'LOGIN_ATTEMPT_LOCKED_ACCOUNT'
  | 'ACCOUNT_LOCKED'
  | 'REFRESH_TOKEN_SUCCESS'
  | 'REFRESH_TOKEN_FAILURE'
  | 'REFRESH_TOKEN_REUSE_DETECTED'
  | 'ADMIN_ACTION_UNAUTHORIZED'
  | 'API_ABUSE_DETECTED'
  | 'RATE_LIMIT_EXCEEDED_CRITICAL'
  | 'CSRF_ATTEMPT_DETECTED';

export class Logger {
  static async security(
    event: SecurityEvent, 
    ip: string, 
    severity: 'INFO' | 'WARN' | 'CRITICAL' = 'INFO',
    userId?: string,
    metadata?: any
  ) {
    console.log(`[SECURITY][${severity}][${new Date().toISOString()}] ${event} | IP: ${ip} | User: ${userId || 'anonymous'}`);
    
    // Persist to DB
    await logSecurityEvent({
      event,
      severity,
      ip,
      userId,
      metadata
    });
  }

  static info(message: string, context?: any) {
    console.log(`[INFO][${new Date().toISOString()}] ${message}`, context || '');
  }

  static warn(message: string, context?: any) {
    console.warn(`[WARN][${new Date().toISOString()}] ${message}`, context || '');
  }

  static error(message: string, error?: any) {
    console.error(`[ERROR][${new Date().toISOString()}] ${message}`, error || '');
  }
}
