import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDb, saveDb, resultToObjects } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'orbinex_mbccet_super_secure_secret_2026';

export interface AuthenticatedUser {
  id: number;
  username?: string;
  name: string;
  email?: string;
  phone?: string;
  college_id?: string;
  role: 'ADMIN' | 'STUDENT';
  institution_id: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

// Generate JWT Token
export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      college_id: user.college_id,
      email: user.email,
      username: user.username,
      institution_id: user.institution_id || 'MBCCET',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// In-memory brute force protection: track failed login attempts
interface RateLimitRecord {
  attempts: number;
  lockUntil: number;
}
const loginAttempts = new Map<string, RateLimitRecord>();

export function checkLoginRateLimit(ipOrIdentifier: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ipOrIdentifier);
  if (!record) return { allowed: true };

  if (record.lockUntil > now) {
    const waitSeconds = Math.ceil((record.lockUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  if (record.attempts >= 5 && record.lockUntil <= now) {
    // Reset after lock expires
    loginAttempts.delete(ipOrIdentifier);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(ipOrIdentifier: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ipOrIdentifier) || { attempts: 0, lockUntil: 0 };
  record.attempts += 1;
  if (record.attempts >= 5) {
    record.lockUntil = now + 5 * 60 * 1000; // lock for 5 minutes after 5 failed tries
  }
  loginAttempts.set(ipOrIdentifier, record);
}

export function clearFailedLogin(ipOrIdentifier: string): void {
  loginAttempts.delete(ipOrIdentifier);
}

// Middleware: Authenticate via Bearer header or cookie
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.orbinex_token) {
    token = req.cookies.orbinex_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }
}

// Middleware: Require Admin role
export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Administrator privileges required.' });
  }

  next();
}

// Helper to record audit logs
export async function recordAudit(
  adminId: number | undefined,
  adminName: string | undefined,
  action: string,
  targetType: string,
  targetId: string,
  details: string = '',
  institutionId: string = 'MBCCET'
) {
  try {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO audit_logs (institution_id, admin_id, admin_name, action, target_type, target_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run([institutionId, adminId || null, adminName || 'System', action, targetType, targetId, details]);
    stmt.free();
    saveDb();
  } catch (err) {
    console.error('Audit log error:', err);
  }
}
