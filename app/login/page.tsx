"use client";

import Link from "next/link";
import Logo from "../components/Logo";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useTransition } from "react";
import { useLang } from "../hooks/useLang";
import { login } from "../actions/auth";

const t = {
  pt: {
    title: "Bem-vindo de volta",
    sub: "Acesse sua conta para continuar.",
    email: "E-mail",
    senha: "Senha",
    esqueci: "Esqueci minha senha",
    placeholder_senha: "Sua senha",
    entrando: "Entrando...",
    entrar: "Entrar",
    semConta: "Ainda não tem conta?",
    cadastrar: "Cadastre-se",
  },
  en: {
    title: "Welcome back",
    sub: "Sign in to your account to continue.",
    email: "E-mail",
    senha: "Password",
    esqueci: "Forgot my password",
    placeholder_senha: "Your password",
    entrando: "Signing in...",
    entrar: "Sign in",
    semConta: "Don't have an account?",
    cadastrar: "Sign up",
  },
};

export default function LoginPage() {
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
      const result = await login(formData);
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-[#A0A0A0] text-sm">{l.senha}</label>
                <Link href="/esqueci-senha" className="text-xs text-[#CC0000] hover:text-[#E50000]">
                  {l.esqueci}
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder={l.placeholder_senha}
                  required
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
              {isPending ? l.entrando : l.entrar}
            </button>
          </form>

          <p className="text-center text-[#A0A0A0] text-sm mt-6">
            {l.semConta}{" "}
            <Link href="/cadastro" className="text-[#CC0000] hover:text-[#E50000] font-medium">
              {l.cadastrar}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
