"use client";

import Link from "next/link";
import Logo from "../components/Logo";
import { User, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react";
import { useState, useTransition } from "react";
import { useLang } from "../hooks/useLang";
import { cadastrar } from "../actions/auth";

const t = {
  pt: {
    title: "Crie sua conta",
    sub: "Junte-se à plataforma de transporte executivo de Sorocaba.",
    nome: "Nome completo",
    placeholder_nome: "Seu nome completo",
    email: "E-mail",
    telefone: "Telefone com DDD",
    telefone_hint: "(para notificações via WhatsApp)",
    senha: "Senha",
    placeholder_senha: "Crie uma senha segura",
    criando: "Criando conta...",
    criar: "Criar conta",
    temConta: "Já tem uma conta?",
    entrar: "Entrar",
  },
  en: {
    title: "Create your account",
    sub: "Join Sorocaba's executive transport platform.",
    nome: "Full name",
    placeholder_nome: "Your full name",
    email: "E-mail",
    telefone: "Phone with area code",
    telefone_hint: "(for WhatsApp notifications)",
    senha: "Password",
    placeholder_senha: "Create a secure password",
    criando: "Creating account...",
    criar: "Create account",
    temConta: "Already have an account?",
    entrar: "Sign in",
  },
};

export default function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState("");
  const [isPending, startTransition] = useTransition();
  const { lang, setLang } = useLang();
  const l = t[lang];

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
      {/* Toggle PT / EN */}
      <div className="absolute top-6 right-6 flex items-center gap-1 bg-[#2B2B2B] border border-[#444444] rounded p-1">
        <button
          onClick={() => setLang("pt")}
          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
            lang === "pt" ? "bg-[#CC0000] text-white" : "text-[#A0A0A0] hover:text-[#F0F0F0]"
          }`}
        >
          PT
        </button>
        <button
          onClick={() => setLang("en")}
          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
            lang === "en" ? "bg-[#CC0000] text-white" : "text-[#A0A0A0] hover:text-[#F0F0F0]"
          }`}
        >
          EN
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <h1
            className="text-3xl font-bold text-[#F0F0F0] mt-6 mb-2 uppercase"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {l.title}
          </h1>
          <p className="text-[#A0A0A0]">{l.sub}</p>
        </div>

        <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-2">{l.nome}</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  name="nome"
                  type="text"
                  placeholder={l.placeholder_nome}
                  required
                  className="w-full bg-[#2B2B2B] border border-[#444444] text-[#F0F0F0] placeholder-[#A0A0A0] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#CC0000] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#A0A0A0] text-sm mb-2">{l.email}</label>
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

            <div>
              <label className="block text-[#A0A0A0] text-sm mb-2">
                {l.telefone}{" "}
                <span className="text-xs text-[#A0A0A0]/70">{l.telefone_hint}</span>
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

            <div>
              <label className="block text-[#A0A0A0] text-sm mb-2">{l.senha}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder={l.placeholder_senha}
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
              {isPending ? l.criando : l.criar}
            </button>
          </form>

          <p className="text-center text-[#A0A0A0] text-sm mt-6">
            {l.temConta}{" "}
            <Link href="/login" className="text-[#CC0000] hover:text-[#E50000] font-medium">
              {l.entrar}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
