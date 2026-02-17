import { describe, it, expect } from 'vitest';
import { getSessionRole, getSessionUserId } from '@/lib/session';

describe('getSessionRole', () => {
  it('should return the role when user has a valid role', async () => {
    const user = { role: 'Admin' as const };
    expect(await getSessionRole(user)).toBe('Admin');
  });

  it('should return "General" role', async () => {
    const user = { role: 'General' as const };
    expect(await getSessionRole(user)).toBe('General');
  });

  it('should return "Treasurer" role', async () => {
    const user = { role: 'Treasurer' as const };
    expect(await getSessionRole(user)).toBe('Treasurer');
  });

  it('should return "Temporary" role', async () => {
    const user = { role: 'Temporary' as const };
    expect(await getSessionRole(user)).toBe('Temporary');
  });

  it('should return null when user has no role', async () => {
    const user = { name: 'John' };
    expect(await getSessionRole(user)).toBe(null);
  });

  it('should return null when user is undefined', async () => {
    expect(await getSessionRole(undefined)).toBe(null);
  });

  it('should return null when user is null', async () => {
    expect(await getSessionRole(null)).toBe(null);
  });

  it('should return null when user role is undefined', async () => {
    const user = { role: undefined };
    expect(await getSessionRole(user)).toBe(null);
  });

  it('should return null when user role is null', async () => {
    const user = { role: null };
    expect(await getSessionRole(user)).toBe(null);
  });

  it('should handle unknown object types gracefully', async () => {
    const user = { someOtherProp: 'value' };
    expect(await getSessionRole(user)).toBe(null);
  });
});

describe('getSessionUserId', () => {
  it('should return the user ID when present', async () => {
    const user = { id: '12345', name: 'John' };
    expect(await getSessionUserId(user)).toBe('12345');
  });

  it('should return undefined when user has no ID', async () => {
    const user = { name: 'John' };
    expect(await getSessionUserId(user)).toBe(undefined);
  });

  it('should return undefined when user is undefined', async () => {
    expect(await getSessionUserId(undefined)).toBe(undefined);
  });

  it('should return undefined when user is null', async () => {
    expect(await getSessionUserId(null)).toBe(undefined);
  });

  it('should return undefined when user ID is undefined', async () => {
    const user = { id: undefined };
    expect(await getSessionUserId(user)).toBe(undefined);
  });

  it('should handle unknown object types gracefully', async () => {
    const user = { someOtherProp: 'value' };
    expect(await getSessionUserId(user)).toBe(undefined);
  });
});
