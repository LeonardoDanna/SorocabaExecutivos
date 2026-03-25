"use client";

import Link from "next/link";
import Logo from "./Logo";
import { Menu, X, UserCircle, LogOut, ChevronDown, User, LayoutDashboard, Car } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/actions/auth";

const perfilLabel: Record<string, string> = {
  admin: "Administrador",
  motorista: "Motorista",
  cliente: "Cliente",
};

function PerfilDropdown({ perfil }: { perfil: string }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        Perfil
        <ChevronDown size={13} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#2B2B2B] border border-[#444444] rounded-lg shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[#444444]">
            <p className="text-[#A0A0A0] text-xs uppercase tracking-wider">Tipo de conta</p>
            <p className="text-[#F0F0F0] text-sm font-semibold mt-0.5">{perfilLabel[perfil] ?? perfil}</p>
          </div>
          <Link
            href="/perfil"
            onClick={() => setDropdownOpen(false)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#F0F0F0] hover:bg-[#333333] transition-colors"
          >
            <User size={15} />
            Meu perfil
          </Link>
          {perfil === "motorista" && (
            <Link
              href="/motorista"
              onClick={() => setDropdownOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#F0F0F0] hover:bg-[#333333] transition-colors"
            >
              <Car size={15} />
              Meu painel
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
                Sair
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [perfil, setPerfil] = useState<string | null>(null);

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
        <Link href="/">
          <Logo size="sm" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#sobre" className="text-brand-muted hover:text-brand-text transition-colors text-sm uppercase tracking-wider">Sobre</Link>
          <Link href="#servicos" className="text-brand-muted hover:text-brand-text transition-colors text-sm uppercase tracking-wider">Serviços</Link>
          <Link href="#precos" className="text-brand-muted hover:text-brand-text transition-colors text-sm uppercase tracking-wider">Preços</Link>
          <Link href="#como-funciona" className="text-brand-muted hover:text-brand-text transition-colors text-sm uppercase tracking-wider">Como funciona</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {perfil !== null ? (
            <PerfilDropdown perfil={perfil} />
          ) : (
            <>
              <Link href="/login" className="text-sm text-brand-text border border-[#444444] px-4 py-2 rounded hover:border-brand-red transition-colors">
                Entrar
              </Link>
              <Link href="/cadastro" className="text-sm bg-brand-red text-white px-4 py-2 rounded hover:bg-brand-red-hover transition-colors">
                Cadastrar
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
          <Link href="#sobre" onClick={() => setOpen(false)} className="text-brand-muted hover:text-brand-text text-sm uppercase tracking-wider">Sobre</Link>
          <Link href="#servicos" onClick={() => setOpen(false)} className="text-brand-muted hover:text-brand-text text-sm uppercase tracking-wider">Serviços</Link>
          <Link href="#precos" onClick={() => setOpen(false)} className="text-brand-muted hover:text-brand-text text-sm uppercase tracking-wider">Preços</Link>
          <Link href="#como-funciona" onClick={() => setOpen(false)} className="text-brand-muted hover:text-brand-text text-sm uppercase tracking-wider">Como funciona</Link>
          <div className="flex flex-col gap-2 pt-2 border-t border-[#444444]">
            {perfil !== null ? (
              <>
                <div className="px-4 py-3 bg-[#333333] rounded border border-[#444444]">
                  <p className="text-[#A0A0A0] text-xs uppercase tracking-wider">Tipo de conta</p>
                  <p className="text-[#F0F0F0] text-sm font-semibold mt-0.5">{perfilLabel[perfil] ?? perfil}</p>
                </div>
                <Link href="/perfil" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 text-sm text-[#F0F0F0] border border-[#444444] px-4 py-2 rounded">
                  <User size={15} />
                  Meu perfil
                </Link>
                {perfil === "motorista" && (
                  <Link href="/motorista" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 text-sm text-[#F0F0F0] border border-[#444444] px-4 py-2 rounded">
                    <Car size={15} />
                    Meu painel
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
                    Sair
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="text-center text-sm text-brand-text border border-[#444444] px-4 py-2 rounded">Entrar</Link>
                <Link href="/cadastro" onClick={() => setOpen(false)} className="text-center text-sm bg-brand-red text-white px-4 py-2 rounded">Cadastrar</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
