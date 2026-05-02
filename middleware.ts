import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/lib/constants";
import { SUPABASE_URL, SUPABASE_KEY } from "@/lib/supabase/env";

const PROTECTED_CLIENT_ROUTES = ["/cart", "/checkout", "/orders", "/profile"];
const PROTECTED_ADMIN_ROUTES  = ["/admin"];
const AUTH_ROUTES              = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  // Build a response we can mutate (needed for cookie refresh)
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write back updated auth cookies to both the request and the response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — MUST use getUser(), not getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (user) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    }
    return response;
  }

  // Protect client routes
  if (PROTECTED_CLIENT_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user) {
      const loginUrl = new URL(ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin routes — require authenticated ADMIN role
  if (PROTECTED_ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    }

    // Fetch the profile role. Non-admins are bounced to the home page.
    // Wrapped in try-catch so a DB error never crashes the entire middleware.
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "ADMIN") {
        return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
      }
    } catch {
      // On unexpected error, deny access rather than allowing it
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
