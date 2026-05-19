import { describe, it, expect } from 'vitest';
import { validateEmail, validatePhone, validateName } from '@/src/utils/validators';

describe('validateEmail', () => {
  it('returns true for a valid email address', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('returns true for email with subdomain', () => {
    expect(validateEmail('user@mail.example.co.uk')).toBe(true);
  });

  it('returns false for email missing @ symbol', () => {
    expect(validateEmail('testexample.com')).toBe(false);
  });

  it('returns false for email missing local part', () => {
    expect(validateEmail('@example.com')).toBe(false);
  });

  it('returns false for email missing domain', () => {
    expect(validateEmail('test@')).toBe(false);
  });

  it('returns false for email missing TLD', () => {
    expect(validateEmail('test@example')).toBe(false);
  });

  it('returns false for email with spaces', () => {
    expect(validateEmail('test @example.com')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('returns true for valid international format', () => {
    expect(validatePhone('+1-234-567-8901')).toBe(true);
  });

  it('returns true for valid national format with spaces', () => {
    expect(validatePhone('(234) 567-8901')).toBe(true);
  });

  it('returns true for simple digit sequence', () => {
    expect(validatePhone('2345678901')).toBe(true);
  });

  it('returns false for phone containing letters', () => {
    expect(validatePhone('123-ABC-7890')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(validatePhone('')).toBe(false);
  });

  it('returns false for phone that is too short', () => {
    expect(validatePhone('12345')).toBe(false);
  });
});

describe('validateName', () => {
  it('returns true for name with 2 or more characters', () => {
    expect(validateName('Jo')).toBe(true);
  });

  it('returns true for full name', () => {
    expect(validateName('John Doe')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(validateName('')).toBe(false);
  });

  it('returns false for single character', () => {
    expect(validateName('J')).toBe(false);
  });

  it('returns false for whitespace-only string', () => {
    expect(validateName('   ')).toBe(false);
  });

  it('trims whitespace before evaluating length', () => {
    expect(validateName('  AB  ')).toBe(true);
  });
});