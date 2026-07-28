import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip middleware when Supabase is not configured (dev/demo mode)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http") || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL === "your_supabase_url") {
    return NextResponse.next({ request });
  }

  const { createServerClient } = await import("@supabase/ssr");
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  // 跳过 API 路由的登录重定向（API 路由内部自行鉴权）
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next({ request });
  }
  const isAuthPage = request.nextUrl.pathname.startsWith("/sign-in") ||
    request.nextUrl.pathname.startsWith("/sign-up");

  // Demo mode: skip auth checks so pages render with demo data
  const isDemo = request.nextUrl.searchParams.has("demo") || !process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http");
  if (!isDemo) {
    if (!user && !isAuthPage) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    if (user && isAuthPage) {
      return NextResponse.redirect(new URL("/operations", request.url));
    }
  }
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};



