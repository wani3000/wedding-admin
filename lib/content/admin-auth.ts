export const ADMIN_HEADER = "x-admin-key";
const DEFAULT_ADMIN_ACCESS_KEY = "123456";

export function isAdminAuthorized(headers: Headers): boolean {
  const configuredKey = process.env.ADMIN_ACCESS_KEY || DEFAULT_ADMIN_ACCESS_KEY;
  if (!configuredKey || configuredKey.trim() === "") {
    return true;
  }

  const incomingKey = headers.get(ADMIN_HEADER);
  return incomingKey === configuredKey;
}
