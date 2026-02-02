export function isAdminSecretValid(secret: string | null) {
  if (!secret) return false;
  const expected = process.env.ADMIN_SECRET;
  return Boolean(expected && secret === expected);
}
