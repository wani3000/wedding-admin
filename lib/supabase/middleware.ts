import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

export async function updateSession(request: NextRequest) {
  if (request.nextUrl.pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const code = request.nextUrl.searchParams.get("code");
    if (code) {
      const callbackUrl = request.nextUrl.clone();
      callbackUrl.pathname = "/auth/callback";
      callbackUrl.search = "";
      callbackUrl.searchParams.set("code", code);
      callbackUrl.searchParams.set("next", "/dashboard");
      return NextResponse.redirect(callbackUrl);
    }
  }

  const env = getSupabaseEnv();

  if (!env) {
    return NextResponse.next({ request });
  }

  const response = NextResponse.next({ request });

  let user: { id: string } | null = null;
  try {
    const supabase = createServerClient(env.url, env.anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    user = currentUser;
  } catch {
    return response;
  }

  const isProtectedPath = request.nextUrl.pathname.startsWith("/dashboard");

  const isAuthPath = request.nextUrl.pathname.startsWith("/auth");

  if (!user && isProtectedPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthPath && request.nextUrl.pathname === "/auth/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
