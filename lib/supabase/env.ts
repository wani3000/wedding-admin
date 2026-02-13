type SupabaseEnv = {
  url: string;
  anonKey: string;
};

function normalize(value?: string): string {
  return (value ?? "").trim();
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = normalize(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = normalize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!url || !anonKey) {
    return null;
  }

  if (!isValidHttpUrl(url)) {
    return null;
  }

  return { url, anonKey };
}

