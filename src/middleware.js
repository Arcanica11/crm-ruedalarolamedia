// RUTA: src/middleware.js
// MODIFICADO

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // NOTE: Se mantiene la configuración de cookies existente de Supabase SSR
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // NOTE: Refrescamos la sesión y obtenemos el usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // FIX: Se actualiza la lista de rutas públicas
  // Se agregan las nuevas páginas de login y nuevo-proyecto.
  const publicRoutes = ["/domain-renewals", "/login", "/nuevo-proyecto"];
  const pathname = request.nextUrl.pathname;

  // NOTE: Verificamos si la ruta actual está en la lista de públicas
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    // NOTE: Si es una ruta pública, permitimos el acceso sin importar la sesión
    return response;
  }

  // FIX: Se activa la redirección
  // Si NO hay usuario y NO es una ruta pública, redirigimos a /login.
  if (!user) {
    // console.log("Middleware: No user found, redirecting to /login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // NOTE: Si hay usuario y no es una ruta pública, permite el acceso (ej: /dashboard)
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (rutas de API, si las hubiera)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};