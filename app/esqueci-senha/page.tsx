"use client";

import Link from "next/link";
import Logo from "../components/Logo";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    startTransition(async () => {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/atualizar-senha`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        setErro("Erro ao enviar o e-mail. Verifique o endereço e tente novamente.");
        return;
      }
      setEnviado(true);
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
            Recuperar senha
          </h1>
          <p className="text-[#A0A0A0]">
            {enviado
              ? "Verifique sua caixa de entrada."
              : "Informe seu e-mail para receber o link de redefinição."}
          </p>
        </div>

        <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          {enviado ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center mx-auto">
                <Mail size={28} className="text-[#22C55E]" />
              </div>
              <p className="text-[#F0F0F0] text-sm">
                Enviamos um link para <span className="text-[#CC0000] font-medium">{email}</span>.
                Clique nele para criar uma nova senha.
              </p>
              <p className="text-[#A0A0A0] text-xs">
                Não recebeu? Verifique a pasta de spam ou tente novamente.
              </p>
              <button
                onClick={() => { setEnviado(false); setEmail(""); }}
                className="text-sm text-[#CC0000] hover:text-[#E50000] transition-colors"
              >
                Tentar com outro e-mail
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[#A0A0A0] text-sm mb-2">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full bg-[#2B2B2B] border border-[#444444] text-[#F0F0F0] placeholder-[#A0A0A0] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#CC0000] transition-colors"
                  />
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
                className="w-full bg-[#CC0000] text-white py-3 rounded font-semibold hover:bg-[#E50000] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? "Enviando..." : "Enviar link de recuperação"}
                {!isPending && <ArrowRight size={18} />}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[#A0A0A0] text-sm mt-6">
          <Link href="/login" className="flex items-center justify-center gap-1 text-[#CC0000] hover:text-[#E50000] transition-colors">
            <ArrowLeft size={14} />
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
