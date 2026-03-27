"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function solicitarCorrida(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const origem = formData.get("origem") as string;
  const destino = formData.get("destino") as string;
  const data = formData.get("data") as string;
  const hora = formData.get("hora") as string;
  const paradasRaw = formData.get("paradas") as string | null;
  const paradas: string[] = paradasRaw ? JSON.parse(paradasRaw) : [];

  if (!origem || !destino || !data || !hora) {
    return { erro: "Preencha todos os campos obrigatórios." };
  }

  const data_hora = new Date(`${data}T${hora}:00`).toISOString();

  if (new Date(data_hora) < new Date()) {
    return { erro: "Não é possível agendar uma corrida no passado." };
  }

  const { error } = await supabase.from("viagens").insert({
    cliente_id: user.id,
    origem,
    destino,
    paradas,
    data_hora,
    status: "pendente",
  });

  if (error) {
    return { erro: "Erro ao registrar a corrida. Tente novamente." };
  }

  redirect("/perfil#proximas-viagens");
}

export async function cancelarViagem(viagemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { erro: "Não autenticado." };

  // Verifica se a viagem pertence ao cliente e pode ser cancelada
  const { data: viagem } = await supabase
    .from("viagens")
    .select("id, status, cliente_id")
    .eq("id", viagemId)
    .single();

  if (!viagem || viagem.cliente_id !== user.id)
    return { erro: "Viagem não encontrada." };

  if (!["pendente", "agendada"].includes(viagem.status))
    return { erro: "Esta viagem não pode mais ser cancelada." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("viagens")
    .update({ status: "cancelada" })
    .eq("id", viagemId);

  if (error) return { erro: "Erro ao cancelar. Tente novamente." };
  return { sucesso: true };
}
