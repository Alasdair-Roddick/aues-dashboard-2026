import { describe, it, expect } from 'vitest';
import { saltAndHashPassword, verifyPassword } from '@/app/utils/password';

describe('Password Utilities', () => {
  describe('saltAndHashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await saltAndHashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await saltAndHashPassword(password);
      const hash2 = await saltAndHashPassword(password);
      
      // Due to salt, hashes should be different even for same password
      expect(hash1).not.toBe(hash2);
    });

    it('should hash different passwords differently', async () => {
      const password1 = 'testPassword123';
      const password2 = 'differentPassword456';
      const hash1 = await saltAndHashPassword(password1);
      const hash2 = await saltAndHashPassword(password2);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = await saltAndHashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await saltAndHashPassword(password);
      
      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should handle empty password gracefully', async () => {
      const password = 'testPassword123';
      const hash = await saltAndHashPassword(password);
      
      const isValid = await verifyPassword('', hash);
      expect(isValid).toBe(false);
    });

    it('should handle invalid hash gracefully', async () => {
      const password = 'testPassword123';
      const invalidHash = 'not-a-valid-hash';
      
      const isValid = await verifyPassword(password, invalidHash);
      expect(isValid).toBe(false);
    });

    it('should handle empty hash gracefully', async () => {
      const password = 'testPassword123';
      
      const isValid = await verifyPassword(password, '');
      expect(isValid).toBe(false);
    });
  });

  describe('Password Security', () => {
    it('should produce bcrypt-compatible hashes', async () => {
      const password = 'testPassword123';
      const hash = await saltAndHashPassword(password);
      
      // bcrypt hashes start with $2a$, $2b$, or $2y$
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('should use strong salt rounds', async () => {
      const password = 'testPassword123';
      const hash = await saltAndHashPassword(password);
      
      // Extract salt rounds from hash (format: $2b$XX$...)
      const rounds = hash.split('$')[2];
      const roundsNum = parseInt(rounds, 10);
      
      // Should use at least 10 rounds, preferably 12+
      expect(roundsNum).toBeGreaterThanOrEqual(10);
    });
  });
});
