"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarMensagem } from "@/lib/whatsapp";

export async function atualizarStatusViagem(
  viagemId: string,
  novoStatus: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.perfil !== "motorista") {
    return { erro: "Acesso negado." };
  }

  const { error } = await supabase
    .from("viagens")
    .update({ status: novoStatus })
    .eq("id", viagemId)
    .eq("motorista_id", user.id);

  if (error) return { erro: "Erro ao atualizar status." };

  if (novoStatus === "confirmada" || novoStatus === "em_rota") {
    const admin = createAdminClient();
    const { data: viagem } = await admin
      .from("viagens")
      .select("data_hora, cliente:perfis!cliente_id(nome, telefone), motorista:perfis!motorista_id(nome)")
      .eq("id", viagemId)
      .single();

    if (viagem) {
      const cli = viagem.cliente as unknown as { nome: string; telefone: string | null } | null;
      const mot = viagem.motorista as unknown as { nome: string } | null;

      if (cli?.telefone) {
        if (novoStatus === "confirmada") {
          const dt = new Date(viagem.data_hora);
          const dataStr = dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
          const horaStr = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
          await enviarMensagem(
            cli.telefone,
            `Olá, ${cli.nome}! Sua corrida foi aceita pelo motorista ${mot?.nome ?? ""}. Data: ${dataStr} às ${horaStr}. Sorocaba Executivos — Segurança, conforto e pontualidade.`
          ).catch(() => {});
        } else {
          await enviarMensagem(
            cli.telefone,
            `Olá, ${cli.nome}! Seu motorista ${mot?.nome ?? ""} está a caminho. Sorocaba Executivos — Segurança, conforto e pontualidade.`
          ).catch(() => {});
        }
      }
    }
  }

  return { sucesso: true };
}
