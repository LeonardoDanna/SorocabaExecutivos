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
  const observacoes = (formData.get("observacoes") as string | null)?.trim() || null;
  const paradasRaw = formData.get("paradas") as string | null;
  let paradas: string[] = [];
  if (paradasRaw) {
    try {
      const parsed = JSON.parse(paradasRaw);
      if (!Array.isArray(parsed) || parsed.length > 10)
        return { erro: "Paradas inválidas." };
      paradas = parsed.filter((p): p is string => typeof p === "string" && p.length <= 300);
    } catch {
      return { erro: "Formato de paradas inválido." };
    }
  }

  if (!origem || !destino || !data || !hora) {
    return { erro: "Preencha todos os campos obrigatórios." };
  }

  if (origem.length > 300 || destino.length > 300)
    return { erro: "Endereço muito longo." };

  if (observacoes && observacoes.length > 500)
    return { erro: "Observações muito longas." };

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
    observacoes,
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
