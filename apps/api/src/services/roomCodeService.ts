import crypto from 'crypto';

// Unambiguous character set (no 0/O, 1/I/L)
const CODE_CHARACTERS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const DEFAULT_CODE_LENGTH = 4;

/**
 * Normalizes a user-input room code (trims and converts to uppercase).
 */
export function normalizeRoomCode(code: string): string {
  if (!code) return '';
  return code.trim().toUpperCase();
}

/**
 * Validates whether a room code has an acceptable syntax.
 */
export function isValidRoomCodeSyntax(code: string): boolean {
  const normalized = normalizeRoomCode(code);
  return /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4,6}$/.test(normalized);
}

/**
 * Generates a random human-readable room code using cryptographic randomness.
 */
export function generateRawRoomCode(length = DEFAULT_CODE_LENGTH): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, CODE_CHARACTERS.length);
    result += CODE_CHARACTERS[randomIndex];
  }
  return result;
}

/**
 * Generates a unique room code, ensuring no collision with active rooms.
 * If collision occurs, retries up to maxAttempts, increasing length if saturated.
 */
export function generateUniqueRoomCode(
  isCodeTaken: (code: string) => boolean,
  maxAttempts = 50
): string {
  let length = DEFAULT_CODE_LENGTH;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 20) length = 5;
    if (attempt > 40) length = 6;

    const candidate = generateRawRoomCode(length);
    if (!isCodeTaken(candidate)) {
      return candidate;
    }
  }

  // Fallback with timestamp salt if extremely saturated
  const fallback = (
    generateRawRoomCode(3) +
    Date.now().toString(36).slice(-3)
  ).toUpperCase();
  return fallback;
}
