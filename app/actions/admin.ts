"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verificarAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.perfil !== "admin") {
    throw new Error("Acesso negado.");
  }
  return user;
}

export async function criarViagem(formData: FormData) {
  try {
    await verificarAdmin();
  } catch {
    return { erro: "Acesso negado." };
  }

  const clienteId    = formData.get("cliente_id") as string;
  const motoristaId  = formData.get("motorista_id") as string;
  const origem       = formData.get("origem") as string;
  const destino      = formData.get("destino") as string;
  const data         = formData.get("data") as string;
  const hora         = formData.get("hora") as string;
  const valor        = formData.get("valor") as string;
  const observacoes  = formData.get("observacoes") as string;

  if (!clienteId || !origem || !destino || !data || !hora) {
    return { erro: "Preencha todos os campos obrigatórios." };
  }

  const data_hora = new Date(`${data}T${hora}:00`).toISOString();
  const admin = createAdminClient();

  const { error } = await admin.from("viagens").insert({
    cliente_id:   clienteId,
    motorista_id: motoristaId || null,
    origem,
    destino,
    data_hora,
    status: motoristaId ? "confirmada" : "pendente",
    valor: valor ? parseFloat(valor.replace(",", ".")) : null,
    observacoes: observacoes || null,
  });

  if (error) return { erro: "Erro ao criar viagem: " + error.message };
  return { sucesso: true };
}

export async function criarMotorista(formData: FormData) {
  try {
    await verificarAdmin();
  } catch {
    return { erro: "Acesso negado." };
  }

  const nome     = formData.get("nome") as string;
  const email    = formData.get("email") as string;
  const telefone = formData.get("telefone") as string;
  const senha    = formData.get("senha") as string;

  if (!nome || !email || !senha) {
    return { erro: "Preencha todos os campos obrigatórios." };
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, telefone, perfil: "motorista" },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { erro: "Já existe uma conta com esse e-mail." };
    }
    return { erro: "Erro ao criar motorista: " + error.message };
  }

  // Garante row em perfis caso o trigger não tenha rodado
  await admin.from("perfis").upsert({
    id: data.user.id,
    nome,
    telefone: telefone || null,
    perfil: "motorista",
  });

  return { sucesso: true };
}
