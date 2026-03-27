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
    erros: {
      email_invalido: "Informe um e-mail válido com @.",
      senha_curta: "A senha deve ter pelo menos 6 caracteres.",
      credenciais_incorretas: "E-mail ou senha incorretos.",
      email_nao_confirmado: "E-mail ainda não confirmado. Verifique sua caixa de entrada.",
      rate_limit: "Muitas tentativas. Tente novamente mais tarde.",
      erro_conexao: "Erro de conexão. Tente novamente.",
      erro_generico: "Ocorreu um erro. Tente novamente.",
    },
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
    erros: {
      email_invalido: "Please enter a valid email with @.",
      senha_curta: "Password must be at least 6 characters.",
      credenciais_incorretas: "Incorrect email or password.",
      email_nao_confirmado: "Email not yet confirmed. Please check your inbox.",
      rate_limit: "Too many attempts. Please try again later.",
      erro_conexao: "Connection error. Please try again.",
      erro_generico: "An error occurred. Please try again.",
    },
  },
};

type ErroKey = keyof typeof t.pt.erros;
type Erros = { email?: ErroKey; senha?: ErroKey };

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState<ErroKey | "">("");
  const [erros, setErros] = useState<Erros>({});
  const [isPending, startTransition] = useTransition();
  const { lang, setLang } = useLang();
  const l = t[lang];

  function validateField(field: keyof Erros, value: string): ErroKey | "" {
    if (field === "email")
      return value.includes("@") && value.includes(".") ? "" : "email_invalido";
    if (field === "senha")
      return value.length >= 6 ? "" : "senha_curta";
    return "";
  }

  function handleBlur(field: keyof Erros, value: string) {
    const key = validateField(field, value);
    setErros((prev) => ({ ...prev, [field]: key || undefined }));
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const senha = (form.elements.namedItem("senha") as HTMLInputElement).value;

    const novosErros: Erros = {
      email: validateField("email", email) || undefined,
      senha: validateField("senha", senha) || undefined,
    };
    setErros(novosErros);
    if (Object.values(novosErros).some(Boolean)) return;

    const formData = new FormData(form);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.erro) setErro(result.erro as ErroKey);
    });
  }

  const inputClass = (field: keyof Erros) =>
    `w-full bg-[#2B2B2B] border ${erros[field] ? "border-[#EF4444]" : "border-[#444444]"} text-[#F0F0F0] placeholder-[#A0A0A0] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#CC0000] transition-colors`;

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

            {/* Email */}
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-2">{l.email}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  onBlur={(e) => handleBlur("email", e.target.value)}
                  required
                  className={inputClass("email")}
                />
              </div>
              {erros.email && <p className="text-[#EF4444] text-xs mt-1">{l.erros[erros.email]}</p>}
            </div>

            {/* Senha */}
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
                  onBlur={(e) => handleBlur("senha", e.target.value)}
                  required
                  className={inputClass("senha") + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#F0F0F0]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {erros.senha && <p className="text-[#EF4444] text-xs mt-1">{l.erros[erros.senha]}</p>}
            </div>

            {erro && (
              <p className="text-[#EF4444] text-sm bg-[#EF4444]/10 border border-[#EF4444]/30 rounded px-4 py-2">
                {l.erros[erro]}
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
