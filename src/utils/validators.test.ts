import { describe, it, expect } from 'vitest';
import { validateEmail, validatePhone, validateName } from './validators';

describe('validateEmail', () => {
  it('returns true for a valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('returns false for missing @ sign', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('returns false for missing domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('returns false for whitespace-only input', () => {
    expect(validateEmail('   ')).toBe(false);
  });

  it('returns true for email with subdomain', () => {
    expect(validateEmail('user@mail.example.com')).toBe(true);
  });
});

describe('validatePhone', () => {
  it('returns true for a valid 10-digit phone number', () => {
    expect(validatePhone('1234567890')).toBe(true);
  });

  it('returns true for phone with dashes', () => {
    expect(validatePhone('123-456-7890')).toBe(true);
  });

  it('returns true for phone with country code', () => {
    expect(validatePhone('+1 (234) 567-8901')).toBe(true);
  });

  it('returns false for fewer than 7 digits', () => {
    expect(validatePhone('123456')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(validatePhone('')).toBe(false);
  });

  it('returns true for exactly 7 digits', () => {
    expect(validatePhone('1234567')).toBe(true);
  });
});

describe('validateName', () => {
  it('returns true for a name with 2+ characters', () => {
    expect(validateName('Jo')).toBe(true);
  });

  it('returns true for a full name', () => {
    expect(validateName('John Doe')).toBe(true);
  });

  it('returns false for a single character', () => {
    expect(validateName('J')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(validateName('')).toBe(false);
  });

  it('returns false for whitespace-only string', () => {
    expect(validateName('   ')).toBe(false);
  });

  it('returns true after trimming leading/trailing whitespace', () => {
    expect(validateName('  Jo  ')).toBe(true);
  });
});
