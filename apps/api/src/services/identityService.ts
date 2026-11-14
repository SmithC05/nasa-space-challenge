import crypto from 'crypto';
import { EngineerRole, ParticipantSession } from '@orbital/contracts';

export interface GeneratedIdentity {
  memberId: string;
  resumeToken: string;
  tokenHash: string;
}

/**
 * Creates a cryptographically secure guest participant identity.
 * Generates a persistent UUID memberId and a 256-bit entropy resume token.
 * Stores only the SHA-256 hash of the resume token on the server.
 */
export function createMemberIdentity(): GeneratedIdentity {
  const memberId = crypto.randomUUID();
  const resumeToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashResumeToken(resumeToken);

  return {
    memberId,
    resumeToken,
    tokenHash
  };
}

/**
 * Hashes a raw resume token using SHA-256 for secure server storage.
 */
export function hashResumeToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Verifies that a client-supplied resume token matches the stored token hash
 * using a timing-safe comparison to prevent timing attacks.
 */
export function verifyResumeToken(rawToken: string, storedHash: string): boolean {
  if (!rawToken || !storedHash) return false;
  try {
    const computedHash = hashResumeToken(rawToken);
    const computedBuffer = Buffer.from(computedHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    if (computedBuffer.length !== storedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(computedBuffer, storedBuffer);
  } catch (err) {
    return false;
  }
}

/**
 * Formats session data to return to the authenticated participant.
 */
export function formatParticipantSession(
  memberId: string,
  resumeToken: string,
  roomCode: string,
  name: string,
  role: EngineerRole,
  isHost: boolean
): ParticipantSession {
  return {
    memberId,
    resumeToken,
    roomCode,
    name,
    role,
    isHost
  };
}
