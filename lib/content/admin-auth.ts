export const ADMIN_HEADER = "x-admin-key";

export function isAdminAuthorized(headers: Headers): boolean {
  const configuredKey = process.env.ADMIN_ACCESS_KEY;
  if (!configuredKey || configuredKey.trim() === "") {
    return true;
  }

  const incomingKey = headers.get(ADMIN_HEADER);
  return incomingKey === configuredKey;
}
