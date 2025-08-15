/**
 * Email allowlist for privileged, full-permission access.
 * These users bypass standard access checks and are treated as admins.
 */
const RAW_ALLOWLIST = [
  'anna@wingspan-yoga.com',
  'anna@wingspan-yoga', // tolerate missing TLD
  'admin@wingspan-yoga.com',
  'admin@wingspan-yoga', // tolerate missing TLD
];

const ALLOWLIST = new Set(RAW_ALLOWLIST.map((e) => e.toLowerCase()));

export function isAllowlistedEmail(email?: string | null): boolean {
  if (!email) return false;
  const value = email.toLowerCase();
  if (ALLOWLIST.has(value)) return true;
  // If email is missing TLD in config, try appending .com
  if (!value.includes('.') && ALLOWLIST.has(`${value}.com`)) return true;
  return false;
}

export function getAllowlistedEmails(): string[] {
  return Array.from(ALLOWLIST);
}
