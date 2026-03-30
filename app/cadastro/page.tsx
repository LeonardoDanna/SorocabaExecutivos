"use client";

import Link from "next/link";
import Logo from "../components/Logo";
import { User, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react";
import { useState, useTransition } from "react";
import { useLang } from "../hooks/useLang";
import LangDropdown from "../components/LangDropdown";
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
    erros: {
      nome_curto: "Informe nome e sobrenome.",
      nome_invalido: "O nome deve conter apenas letras.",
      email_invalido: "Informe um e-mail válido com @.",
      telefone_invalido: "Informe um telefone válido com DDD (ex: (15) 99999-9999).",
      senha_curta: "A senha deve ter pelo menos 6 caracteres.",
      email_ja_cadastrado: "Este e-mail já está cadastrado.",
      email_invalido_servidor: "E-mail inválido.",
      senha_fraca: "A senha deve ter pelo menos 6 caracteres.",
      rate_limit: "Muitas tentativas. Tente novamente mais tarde.",
      credenciais_incorretas: "E-mail ou senha incorretos.",
      email_nao_confirmado: "E-mail ainda não confirmado. Verifique sua caixa de entrada.",
      erro_conexao: "Erro de conexão. Tente novamente.",
      erro_generico: "Ocorreu um erro. Tente novamente.",
    },
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
    erros: {
      nome_curto: "Please enter your first and last name.",
      nome_invalido: "Name must contain letters only.",
      email_invalido: "Please enter a valid email with @.",
      telefone_invalido: "Please enter a valid phone number with area code (e.g. (15) 99999-9999).",
      senha_curta: "Password must be at least 6 characters.",
      email_ja_cadastrado: "This email is already registered.",
      email_invalido_servidor: "Invalid email address.",
      senha_fraca: "Password must be at least 6 characters.",
      rate_limit: "Too many attempts. Please try again later.",
      credenciais_incorretas: "Incorrect email or password.",
      email_nao_confirmado: "Email not yet confirmed. Please check your inbox.",
      erro_conexao: "Connection error. Please try again.",
      erro_generico: "An error occurred. Please try again.",
    },
  },
  es: {
    title: "Cree su cuenta",
    sub: "Únase a la plataforma de transporte ejecutivo de Sorocaba.",
    nome: "Nombre completo",
    placeholder_nome: "Su nombre completo",
    email: "Correo electrónico",
    telefone: "Teléfono con código de área",
    telefone_hint: "(para notificaciones por WhatsApp)",
    senha: "Contraseña",
    placeholder_senha: "Cree una contraseña segura",
    criando: "Creando cuenta...",
    criar: "Crear cuenta",
    temConta: "¿Ya tiene una cuenta?",
    entrar: "Ingresar",
    erros: {
      nome_curto: "Ingrese nombre y apellido.",
      nome_invalido: "El nombre debe contener solo letras.",
      email_invalido: "Ingrese un correo válido con @.",
      telefone_invalido: "Ingrese un teléfono válido con código de área (ej: (15) 99999-9999).",
      senha_curta: "La contraseña debe tener al menos 6 caracteres.",
      email_ja_cadastrado: "Este correo ya está registrado.",
      email_invalido_servidor: "Correo inválido.",
      senha_fraca: "La contraseña debe tener al menos 6 caracteres.",
      rate_limit: "Demasiados intentos. Inténtelo más tarde.",
      credenciais_incorretas: "Correo o contraseña incorrectos.",
      email_nao_confirmado: "Correo aún no confirmado. Revise su bandeja de entrada.",
      erro_conexao: "Error de conexión. Inténtelo de nuevo.",
      erro_generico: "Ocurrió un error. Inténtelo de nuevo.",
    },
  },
};

type ErroKey = keyof typeof t.pt.erros;
type Erros = { nome?: ErroKey; email?: ErroKey; telefone?: ErroKey; senha?: ErroKey };

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState<ErroKey | "">("");
  const [erros, setErros] = useState<Erros>({});
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [isPending, startTransition] = useTransition();
  const { lang, setLang } = useLang();
  const l = t[lang];

  function validateField(field: keyof Erros, value: string): ErroKey | "" {
    switch (field) {
      case "nome":
        if (/[^a-zA-ZÀ-ÿ\s]/.test(value)) return "nome_invalido";
        if (value.trim().split(/\s+/).filter(Boolean).length < 2) return "nome_curto";
        return "";
      case "email":
        return value.includes("@") && value.includes(".") ? "" : "email_invalido";
      case "telefone":
        return value.replace(/\D/g, "").length >= 10 ? "" : "telefone_invalido";
      case "senha":
        return value.length >= 6 ? "" : "senha_curta";
      default:
        return "";
    }
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
      nome: validateField("nome", nome) || undefined,
      email: validateField("email", email) || undefined,
      telefone: validateField("telefone", telefone) || undefined,
      senha: validateField("senha", senha) || undefined,
    };
    setErros(novosErros);
    if (Object.values(novosErros).some(Boolean)) return;

    const formData = new FormData(form);
    formData.set("nome", nome);
    formData.set("telefone", telefone);

    startTransition(async () => {
      const result = await cadastrar(formData);
      if (result?.erro) setErro(result.erro as ErroKey);
    });
  }

  const inputClass = (field: keyof Erros) =>
    `w-full bg-[#2B2B2B] border ${erros[field] ? "border-[#EF4444]" : "border-[#444444]"} text-[#F0F0F0] placeholder-[#A0A0A0] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#CC0000] transition-colors`;

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center px-4 py-12">
      <div className="absolute top-6 right-6">
        <LangDropdown lang={lang} setLang={setLang} />
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

            {/* Nome */}
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-2">{l.nome}</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  name="nome"
                  type="text"
                  placeholder={l.placeholder_nome}
                  value={nome}
                  onChange={(e) => setNome(toTitleCase(e.target.value))}
                  onBlur={(e) => handleBlur("nome", e.target.value)}
                  required
                  className={inputClass("nome") + " pr-4"}
                />
              </div>
              {erros.nome && <p className="text-[#EF4444] text-xs mt-1">{l.erros[erros.nome]}</p>}
            </div>

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

            {/* Telefone */}
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
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  onBlur={(e) => handleBlur("telefone", e.target.value)}
                  required
                  className={inputClass("telefone")}
                />
              </div>
              {erros.telefone && <p className="text-[#EF4444] text-xs mt-1">{l.erros[erros.telefone]}</p>}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-[#A0A0A0] text-sm mb-2">{l.senha}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder={l.placeholder_senha}
                  onBlur={(e) => handleBlur("senha", e.target.value)}
                  required
                  minLength={6}
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
