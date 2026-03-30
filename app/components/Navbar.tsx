"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { Menu, X, UserCircle, LogOut, ChevronDown, User, LayoutDashboard, Car } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/actions/auth";

type Lang = "pt" | "en" | "es";

const labels = {
  pt: {
    sobre: "Sobre", servicos: "Serviços", frota: "Frota", como: "Como funciona",
    entrar: "Entrar", cadastrar: "Cadastrar",
    perfil: "Perfil", tipoConta: "Tipo de conta", meuPerfil: "Meu perfil",
    meuPainel: "Meu painel", sair: "Sair",
    roles: { admin: "Administrador", motorista: "Motorista", cliente: "Cliente" },
  },
  en: {
    sobre: "About", servicos: "Services", frota: "Fleet", como: "How it works",
    entrar: "Sign in", cadastrar: "Sign up",
    perfil: "Profile", tipoConta: "Account type", meuPerfil: "My profile",
    meuPainel: "My panel", sair: "Sign out",
    roles: { admin: "Administrator", motorista: "Driver", cliente: "Client" },
  },
  es: {
    sobre: "Sobre", servicos: "Servicios", frota: "Flota", como: "Cómo funciona",
    entrar: "Ingresar", cadastrar: "Registrarse",
    perfil: "Perfil", tipoConta: "Tipo de cuenta", meuPerfil: "Mi perfil",
    meuPainel: "Mi panel", sair: "Cerrar sesión",
    roles: { admin: "Administrador", motorista: "Conductor", cliente: "Cliente" },
  },
};

function PerfilDropdown({ perfil, lang }: { perfil: string; lang: Lang }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const l = labels[lang];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-brand-text border border-[#444444] px-4 py-2 rounded hover:border-brand-red transition-colors"
      >
        <UserCircle size={15} />
        {l.perfil}
        <ChevronDown size={13} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#2B2B2B] border border-[#444444] rounded-lg shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[#444444]">
            <p className="text-[#A0A0A0] text-xs uppercase tracking-wider">{l.tipoConta}</p>
            <p className="text-[#F0F0F0] text-sm font-semibold mt-0.5">
              {l.roles[perfil as keyof typeof l.roles] ?? perfil}
            </p>
          </div>
          <Link
            href="/perfil"
            onClick={() => setDropdownOpen(false)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#F0F0F0] hover:bg-[#333333] transition-colors"
          >
            <User size={15} />
            {l.meuPerfil}
          </Link>
          {perfil === "motorista" && (
            <Link
              href="/motorista"
              onClick={() => setDropdownOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#F0F0F0] hover:bg-[#333333] transition-colors"
            >
              <Car size={15} />
              {l.meuPainel}
            </Link>
          )}
          {perfil === "admin" && (
            <Link
              href="/painel"
              onClick={() => setDropdownOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#CC0000] hover:bg-[#333333] transition-colors"
            >
              <LayoutDashboard size={15} />
              Admin
            </Link>
          )}
          <div className="border-t border-[#444444]">
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#EF4444] hover:bg-[#333333] transition-colors"
              >
                <LogOut size={15} />
                {l.sair}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ lang = "pt" }: { lang?: Lang }) {
  const [open, setOpen] = useState(false);
  const [perfil, setPerfil] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const nl = labels[lang];

  function handleLogoClick(e: React.MouseEvent) {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleAnchorClick(e: React.MouseEvent, id: string) {
    if (pathname === "/") {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      e.preventDefault();
      router.push(`/#${id}`);
    }
  }

  useEffect(() => {
    const supabase = createClient();

    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setPerfil(user?.user_metadata?.perfil ?? null);
    }

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setPerfil(session?.user?.user_metadata?.perfil ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1E1E1E]/90 backdrop-blur-sm border-b border-[#444444]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" onClick={handleLogoClick}>
          <Logo size="sm" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#servicos" onClick={(e) => handleAnchorClick(e, "servicos")} className="text-brand-muted hover:text-brand-text transition-colors text-sm uppercase tracking-wider">{nl.servicos}</Link>
          <Link href="#frota" onClick={(e) => handleAnchorClick(e, "frota")} className="text-brand-muted hover:text-brand-text transition-colors text-sm uppercase tracking-wider">{nl.frota}</Link>
          <Link href="#como-funciona" onClick={(e) => handleAnchorClick(e, "como-funciona")} className="text-brand-muted hover:text-brand-text transition-colors text-sm uppercase tracking-wider">{nl.como}</Link>
          <Link href="#sobre" onClick={(e) => handleAnchorClick(e, "sobre")} className="text-brand-muted hover:text-brand-text transition-colors text-sm uppercase tracking-wider">{nl.sobre}</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {perfil !== null ? (
            <PerfilDropdown perfil={perfil} lang={lang} />
          ) : (
            <>
              <Link href="/login" className="text-sm text-brand-text border border-[#444444] px-4 py-2 rounded hover:border-brand-red transition-colors">
                {nl.entrar}
              </Link>
              <Link href="/cadastro" className="text-sm bg-brand-red text-white px-4 py-2 rounded hover:bg-brand-red-hover transition-colors">
                {nl.cadastrar}
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-brand-muted hover:text-brand-text"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#2B2B2B] border-t border-[#444444] px-6 py-4 flex flex-col gap-4">
          <Link href="#servicos" onClick={(e) => { setOpen(false); handleAnchorClick(e, "servicos"); }} className="text-brand-muted hover:text-brand-text text-sm uppercase tracking-wider">{nl.servicos}</Link>
          <Link href="#frota" onClick={(e) => { setOpen(false); handleAnchorClick(e, "frota"); }} className="text-brand-muted hover:text-brand-text text-sm uppercase tracking-wider">{nl.frota}</Link>
          <Link href="#como-funciona" onClick={(e) => { setOpen(false); handleAnchorClick(e, "como-funciona"); }} className="text-brand-muted hover:text-brand-text text-sm uppercase tracking-wider">{nl.como}</Link>
          <Link href="#sobre" onClick={(e) => { setOpen(false); handleAnchorClick(e, "sobre"); }} className="text-brand-muted hover:text-brand-text text-sm uppercase tracking-wider">{nl.sobre}</Link>
          <div className="flex flex-col gap-2 pt-2 border-t border-[#444444]">
            {perfil !== null ? (
              <>
                <div className="px-4 py-3 bg-[#333333] rounded border border-[#444444]">
                  <p className="text-[#A0A0A0] text-xs uppercase tracking-wider">{nl.tipoConta}</p>
                  <p className="text-[#F0F0F0] text-sm font-semibold mt-0.5">
                    {nl.roles[perfil as keyof typeof nl.roles] ?? perfil}
                  </p>
                </div>
                <Link href="/perfil" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 text-sm text-[#F0F0F0] border border-[#444444] px-4 py-2 rounded">
                  <User size={15} />
                  {nl.meuPerfil}
                </Link>
                {perfil === "motorista" && (
                  <Link href="/motorista" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 text-sm text-[#F0F0F0] border border-[#444444] px-4 py-2 rounded">
                    <Car size={15} />
                    {nl.meuPainel}
                  </Link>
                )}
                {perfil === "admin" && (
                  <Link href="/painel" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 text-sm text-[#CC0000] border border-[#CC0000]/30 px-4 py-2 rounded">
                    <LayoutDashboard size={15} />
                    Admin
                  </Link>
                )}
                <form action={logout}>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 text-sm text-[#EF4444] border border-[#EF4444]/30 px-4 py-2 rounded">
                    <LogOut size={15} />
                    {nl.sair}
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="text-center text-sm text-brand-text border border-[#444444] px-4 py-2 rounded">{nl.entrar}</Link>
                <Link href="/cadastro" onClick={() => setOpen(false)} className="text-center text-sm bg-brand-red text-white px-4 py-2 rounded">{nl.cadastrar}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
