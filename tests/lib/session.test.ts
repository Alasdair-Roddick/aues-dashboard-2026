import { describe, it, expect } from 'vitest';
import { getSessionRole, getSessionUserId } from '@/lib/session';

describe('getSessionRole', () => {
  it('should return the role when user has a valid role', () => {
    const user = { role: 'Admin' as const };
    expect(getSessionRole(user)).toBe('Admin');
  });

  it('should return "General" role', () => {
    const user = { role: 'General' as const };
    expect(getSessionRole(user)).toBe('General');
  });

  it('should return "Treasurer" role', () => {
    const user = { role: 'Treasurer' as const };
    expect(getSessionRole(user)).toBe('Treasurer');
  });

  it('should return "Temporary" role', () => {
    const user = { role: 'Temporary' as const };
    expect(getSessionRole(user)).toBe('Temporary');
  });

  it('should return null when user has no role', () => {
    const user = { name: 'John' };
    expect(getSessionRole(user)).toBe(null);
  });

  it('should return null when user is undefined', () => {
    expect(getSessionRole(undefined)).toBe(null);
  });

  it('should return null when user is null', () => {
    expect(getSessionRole(null)).toBe(null);
  });

  it('should return null when user role is undefined', () => {
    const user = { role: undefined };
    expect(getSessionRole(user)).toBe(null);
  });

  it('should return null when user role is null', () => {
    const user = { role: null };
    expect(getSessionRole(user)).toBe(null);
  });

  it('should handle unknown object types gracefully', () => {
    const user = { someOtherProp: 'value' };
    expect(getSessionRole(user)).toBe(null);
  });
});

describe('getSessionUserId', () => {
  it('should return the user ID when present', () => {
    const user = { id: '12345', name: 'John' };
    expect(getSessionUserId(user)).toBe('12345');
  });

  it('should return undefined when user has no ID', () => {
    const user = { name: 'John' };
    expect(getSessionUserId(user)).toBe(undefined);
  });

  it('should return undefined when user is undefined', () => {
    expect(getSessionUserId(undefined)).toBe(undefined);
  });

  it('should return undefined when user is null', () => {
    expect(getSessionUserId(null)).toBe(undefined);
  });

  it('should return undefined when user ID is undefined', () => {
    const user = { id: undefined };
    expect(getSessionUserId(user)).toBe(undefined);
  });

  it('should handle unknown object types gracefully', () => {
    const user = { someOtherProp: 'value' };
    expect(getSessionUserId(user)).toBe(undefined);
  });
});
