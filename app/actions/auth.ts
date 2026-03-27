"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function codigoErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "email_ja_cadastrado";
  if (m.includes("invalid email") || m.includes("unable to validate email"))
    return "email_invalido_servidor";
  if (m.includes("password should be at least") || m.includes("password is too short"))
    return "senha_fraca";
  if (m.includes("email rate limit") || m.includes("rate limit"))
    return "rate_limit";
  if (m.includes("invalid login credentials") || m.includes("invalid credentials"))
    return "credenciais_incorretas";
  if (m.includes("email not confirmed"))
    return "email_nao_confirmado";
  if (m.includes("network") || m.includes("fetch"))
    return "erro_conexao";
  return "erro_generico";
}

export async function cadastrar(formData: FormData) {
  const supabase = await createClient();

  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const telefone = formData.get("telefone") as string;
  const senha = formData.get("senha") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome, telefone, perfil: "cliente" },
    },
  });

  if (error) {
    return { erro: codigoErro(error.message) };
  }

  redirect("/solicitar");
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    return { erro: codigoErro(error.message) };
  }

  const perfil = data.user?.user_metadata?.perfil;
  if (perfil === "admin") redirect("/painel");
  else if (perfil === "motorista") redirect("/motorista");
  else redirect("/solicitar");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
