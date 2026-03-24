"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function solicitarCorrida(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const origem = formData.get("origem") as string;
  const destino = formData.get("destino") as string;
  const data = formData.get("data") as string;
  const hora = formData.get("hora") as string;

  if (!origem || !destino || !data || !hora) {
    return { erro: "Preencha todos os campos obrigatórios." };
  }

  const data_hora = new Date(`${data}T${hora}:00`).toISOString();

  const { error } = await supabase.from("viagens").insert({
    cliente_id: user.id,
    origem,
    destino,
    data_hora,
    status: "pendente",
  });

  if (error) {
    return { erro: "Erro ao registrar a corrida. Tente novamente." };
  }

  redirect("/historico");
}
