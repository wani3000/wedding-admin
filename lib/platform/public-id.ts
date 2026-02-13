export function createNumericPublicId(length = 8): string {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    const digit = Math.floor(Math.random() * 10);
    result += String(digit);
  }

  // leading zero 방지
  if (result.startsWith("0")) {
    return `1${result.slice(1)}`;
  }

  return result;
}

export async function generateUniquePublicId(
  exists: (id: string) => Promise<boolean>,
  attempts = 10,
): Promise<string> {
  for (let i = 0; i < attempts; i += 1) {
    const candidate = createNumericPublicId(8);
    const duplicated = await exists(candidate);
    if (!duplicated) return candidate;
  }
  throw new Error("고유 publicId 생성에 실패했습니다.");
}
