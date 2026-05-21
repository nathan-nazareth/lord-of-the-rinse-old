const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX =
  /^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validatePhone(phone: string): boolean {
  const digitCount = phone.replace(/\D/g, '').length;
  return digitCount >= 7 && PHONE_REGEX.test(phone);
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2;
}
