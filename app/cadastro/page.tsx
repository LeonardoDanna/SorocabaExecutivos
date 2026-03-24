"use client";

import Link from "next/link";
import Logo from "../components/Logo";
import { User, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react";
import { useState, useTransition } from "react";
import { cadastrar } from "../actions/auth";

export default function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await cadastrar(formData);
      if (result?.erro) setErro(result.erro);
    });
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <h1
            className="text-3xl font-bold text-[#F0F0F0] mt-6 mb-2 uppercase"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Crie sua conta
          </h1>
          <p className="text-[#A0A0A0]">
            Junte-se à plataforma de transporte executivo de Sorocaba.
          </p>
        </div>

        <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-2">Nome completo</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  name="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  required
                  className="w-full bg-[#2B2B2B] border border-[#444444] text-[#F0F0F0] placeholder-[#A0A0A0] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#CC0000] transition-colors"
                />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-2">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-[#2B2B2B] border border-[#444444] text-[#F0F0F0] placeholder-[#A0A0A0] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#CC0000] transition-colors"
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-2">
                Telefone com DDD{" "}
                <span className="text-xs text-[#A0A0A0]/70">(para notificações via WhatsApp)</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  name="telefone"
                  type="tel"
                  placeholder="(15) 99999-9999"
                  required
                  className="w-full bg-[#2B2B2B] border border-[#444444] text-[#F0F0F0] placeholder-[#A0A0A0] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#CC0000] transition-colors"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-2">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha segura"
                  required
                  minLength={6}
                  className="w-full bg-[#2B2B2B] border border-[#444444] text-[#F0F0F0] placeholder-[#A0A0A0] rounded px-4 py-3 pl-10 pr-10 focus:outline-none focus:border-[#CC0000] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#F0F0F0]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && (
              <p className="text-[#EF4444] text-sm bg-[#EF4444]/10 border border-[#EF4444]/30 rounded px-4 py-2">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#CC0000] text-white py-3 rounded font-semibold hover:bg-[#E50000] transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-[#A0A0A0] text-sm mt-6">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-[#CC0000] hover:text-[#E50000] font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
