export type KakaoKeywordPlace = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url?: string;
};

export async function searchKakaoKeywordPlaces(query: string): Promise<KakaoKeywordPlace[]> {
  const keyword = query.trim();
  if (!keyword) return [];

  const restKey = process.env.KAKAO_REST_API_KEY;
  if (!restKey || restKey.trim() === "") {
    throw new Error("KAKAO_REST_API_KEY 환경변수가 필요합니다.");
  }

  const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  url.searchParams.set("query", keyword);
  url.searchParams.set("size", "10");

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `KakaoAK ${restKey}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorPayload = (await res.json().catch(() => ({}))) as {
      msg?: string;
      code?: number;
      errorType?: string;
      error_type?: string;
    };
    const detail =
      errorPayload.msg ||
      errorPayload.errorType ||
      errorPayload.error_type ||
      "";
    const codeDetail =
      typeof errorPayload.code === "number" ? ` code=${errorPayload.code}` : "";
    throw new Error(
      `Kakao Local API 실패 (HTTP ${res.status}${codeDetail}${detail ? `: ${detail}` : ""})`,
    );
  }

  const data = (await res.json()) as { documents?: KakaoKeywordPlace[] };
  return Array.isArray(data.documents) ? data.documents : [];
}
