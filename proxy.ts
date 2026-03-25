import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rotas públicas (não precisam de login)
const PUBLIC_ROUTES = ["/", "/login", "/cadastro", "/esqueci-senha", "/atualizar-senha"];

// Rotas por perfil
const ROTAS_POR_PERFIL: Record<string, string[]> = {
  admin:     ["/painel"],
  motorista: ["/motorista"],
  cliente:   ["/solicitar", "/perfil"],
};

// Página inicial de cada perfil após login
const HOME_POR_PERFIL: Record<string, string> = {
  admin:     "/painel",
  motorista: "/motorista",
  cliente:   "/solicitar",
};

function rotaPermitida(pathname: string, perfil: string): boolean {
  const permitidas = ROTAS_POR_PERFIL[perfil] ?? [];
  return permitidas.some((rota) => pathname.startsWith(rota));
}

function eRotaProtegida(pathname: string): boolean {
  return Object.values(ROTAS_POR_PERFIL).flat().some((rota) =>
    pathname.startsWith(rota)
  );
}

function eRotaPublica(pathname: string): boolean {
  return PUBLIC_ROUTES.some((rota) => pathname === rota || pathname.startsWith(rota + "/"));
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const perfil = user?.user_metadata?.perfil as string | undefined;

  // Usuário não logado tentando acessar rota protegida → login
  if (!user && eRotaProtegida(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Usuário logado tentando acessar /login ou /cadastro → home do perfil
  if (user && perfil && (pathname === "/login" || pathname === "/cadastro")) {
    const url = request.nextUrl.clone();
    url.pathname = HOME_POR_PERFIL[perfil] ?? "/";
    return NextResponse.redirect(url);
  }

  // Usuário logado tentando acessar rota de outro perfil → home do seu perfil
  if (user && perfil && eRotaProtegida(pathname) && !rotaPermitida(pathname, perfil)) {
    const url = request.nextUrl.clone();
    url.pathname = HOME_POR_PERFIL[perfil] ?? "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
