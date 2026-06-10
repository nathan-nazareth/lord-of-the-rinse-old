const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Accepts E.164-ish formats: optional +, country code, area code, subscriber
// number with at most one space / dash / dot per boundary, and 7-15 digits
// total (ITU-T E.164). The previous regex let `"1234567"` through alongside
// `"1-2-3-4-5-6-7"` which is inconsistent UX.
const PHONE_REGEX = /^\+?[1-9]\d{0,2}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validatePhone(phone: string): boolean {
  const digitCount = phone.replace(/\D/g, '').length;
  return digitCount >= 7 && digitCount <= 15 && PHONE_REGEX.test(phone);
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2;
}
