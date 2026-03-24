"use client";

import Link from "next/link";
import Logo from "./Logo";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1E1E1E]/90 backdrop-blur-sm border-b border-[#444444]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <Logo size="sm" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#sobre" className="text-brand-muted hover:text-brand-text transition-colors text-sm uppercase tracking-wider">
            Sobre
          </Link>
          <Link href="#servicos" className="text-brand-muted hover:text-brand-text transition-colors text-sm uppercase tracking-wider">
            Serviços
          </Link>
          <Link href="#precos" className="text-brand-muted hover:text-brand-text transition-colors text-sm uppercase tracking-wider">
            Preços
          </Link>
          <Link href="#como-funciona" className="text-brand-muted hover:text-brand-text transition-colors text-sm uppercase tracking-wider">
            Como funciona
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-brand-text border border-[#444444] px-4 py-2 rounded hover:border-brand-red transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="text-sm bg-brand-red text-white px-4 py-2 rounded hover:bg-brand-red-hover transition-colors"
          >
            Cadastrar
          </Link>
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
            <Link href="/login" className="text-center text-sm text-brand-text border border-[#444444] px-4 py-2 rounded">Entrar</Link>
            <Link href="/cadastro" className="text-center text-sm bg-brand-red text-white px-4 py-2 rounded">Cadastrar</Link>
          </div>
        </div>
      )}
    </header>
  );
}
