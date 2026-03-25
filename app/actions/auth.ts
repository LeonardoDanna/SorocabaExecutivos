"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    return { erro: error.message };
  }

  redirect("/solicitar");
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    return { erro: "E-mail ou senha incorretos." };
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
