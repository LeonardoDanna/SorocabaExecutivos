"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import {
  CheckCircle, MapPin, Navigation, Calendar, Clock,
  Phone, Star, MessageCircle, Loader2, ChevronDown, Car,
} from "lucide-react";
import Link from "next/link";
import { getConfirmacao } from "@/app/actions/viagens";

type Viagem = Awaited<ReturnType<typeof getConfirmacao>>;

const statusConfig: Record<string, { label: string; descricao: string; cor: string; bg: string }> = {
  pendente:   { label: "Aguardando motorista",  descricao: "Sua solicitação foi recebida. Um motorista será atribuído em breve.", cor: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  agendada:   { label: "Aguardando confirmação", descricao: "Motorista atribuído. Aguardando confirmação final.",                  cor: "#A855F7", bg: "rgba(168,85,247,0.1)" },
  confirmada: { label: "Motorista confirmado",   descricao: "Seu motorista aceitou a corrida e estará pronto no horário.",         cor: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  em_rota:    { label: "Motorista a caminho",    descricao: "Seu motorista está a caminho do ponto de embarque.",                  cor: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  concluida:  { label: "Viagem concluída",       descricao: "Sua viagem foi concluída com sucesso.",                               cor: "#A0A0A0", bg: "rgba(160,160,160,0.1)" },
  cancelada:  { label: "Viagem cancelada",       descricao: "Esta viagem foi cancelada.",                                          cor: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

const POLL_INTERVAL = 10000; // 10s

function ConfirmacaoContent() {
  const params = useSearchParams();
  const id = params.get("id");

  const [viagem, setViagem] = useState<Viagem>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const buscar = useCallback(async () => {
    if (!id) return;
    const data = await getConfirmacao(id);
    if (!data) { setErro(true); setCarregando(false); return; }
    setViagem(data);
    setCarregando(false);
  }, [id]);

  useEffect(() => {
    buscar();
    const interval = setInterval(buscar, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [buscar]);

  if (!id || erro) {
    return (
      <div className="text-center py-16">
        <p className="text-[#F0F0F0] font-medium">Viagem não encontrada.</p>
        <Link href="/solicitar" className="mt-4 inline-block text-sm text-[#CC0000] hover:text-[#E50000]">
          Solicitar nova corrida
        </Link>
      </div>
    );
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="text-[#CC0000] animate-spin" />
      </div>
    );
  }

  if (!viagem) return null;

  const s = statusConfig[viagem.status] ?? statusConfig.pendente;
  const dt = new Date(viagem.data_hora);
  const dataFmt = dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const horaFmt = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const spinning = ["pendente", "agendada"].includes(viagem.status);

  return (
    <div className="max-w-lg mx-auto space-y-6">

      {/* Cabeçalho */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 border-2 border-[#22C55E] flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-[#22C55E]" />
        </div>
        <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
          Corrida solicitada!
        </h1>
        <p className="text-[#A0A0A0] text-sm mt-2">
          Você receberá uma confirmação pelo WhatsApp.
        </p>
      </div>

      {/* Status */}
      <div className="rounded-xl p-4 flex items-start gap-3 border" style={{ backgroundColor: s.bg, borderColor: s.cor + "44" }}>
        <Loader2 size={18} style={{ color: s.cor }} className={`mt-0.5 ${spinning ? "animate-spin" : ""}`} />
        <div>
          <p className="font-semibold text-sm" style={{ color: s.cor }}>{s.label}</p>
          <p className="text-[#A0A0A0] text-xs mt-0.5">{s.descricao}</p>
        </div>
      </div>

      {/* Detalhes da corrida */}
      <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="px-5 py-4 border-b border-[#444]">
          <p className="text-[#A0A0A0] text-xs uppercase tracking-wider">Corrida #{viagem.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Navigation size={16} className="text-[#A0A0A0] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[#A0A0A0] text-xs mb-0.5">Origem</p>
              <p className="text-[#F0F0F0] text-sm">{viagem.origem}</p>
            </div>
          </div>

          {(viagem.paradas ?? []).map((p, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-0.5 flex-shrink-0">
                <ChevronDown size={10} className="text-[#555] -mb-1" />
                <MapPin size={16} className="text-[#666]" />
              </div>
              <div>
                <p className="text-[#A0A0A0] text-xs mb-0.5">Parada {i + 1}</p>
                <p className="text-[#A0A0A0] text-sm">{p}</p>
              </div>
            </div>
          ))}

          <div className="flex items-start gap-3">
            <MapPin size={16} className="text-[#CC0000] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[#A0A0A0] text-xs mb-0.5">Destino</p>
              <p className="text-[#F0F0F0] text-sm">{viagem.destino}</p>
            </div>
          </div>

          {viagem.observacoes && (
            <p className="text-xs text-[#A0A0A0] italic border-l-2 border-[#444] pl-3">{viagem.observacoes}</p>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#333]">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#A0A0A0]" />
              <div>
                <p className="text-[#A0A0A0] text-xs">Data</p>
                <p className="text-[#F0F0F0] text-sm">{dataFmt}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#A0A0A0]" />
              <div>
                <p className="text-[#A0A0A0] text-xs">Horário</p>
                <p className="text-[#F0F0F0] text-sm">{horaFmt}</p>
              </div>
            </div>
          </div>

          {viagem.valor && (
            <div className="pt-2 border-t border-[#333] flex items-center justify-between">
              <p className="text-[#A0A0A0] text-sm">Valor</p>
              <p className="text-[#F0F0F0] font-bold text-lg">
                {viagem.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Card do motorista */}
      {viagem.motorista && (
        <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="px-5 py-4 border-b border-[#444]">
            <p className="text-[#A0A0A0] text-xs uppercase tracking-wider">Seu motorista</p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#CC0000]/10 border border-[#CC0000]/30 flex items-center justify-center text-[#CC0000] font-bold text-lg flex-shrink-0">
                {viagem.motorista.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1">
                <p className="text-[#F0F0F0] font-semibold">{viagem.motorista.nome}</p>
                {viagem.motorista.avaliacao && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={12} className="text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-[#F0F0F0] text-sm">{viagem.motorista.avaliacao}</span>
                  </div>
                )}
              </div>
              {viagem.motorista.telefone && (
                <a
                  href={`tel:${viagem.motorista.telefone}`}
                  className="w-10 h-10 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center"
                >
                  <Phone size={16} className="text-[#22C55E]" />
                </a>
              )}
            </div>

            {viagem.motorista.veiculo_modelo && (
              <div className="mt-4 pt-4 border-t border-[#333] flex items-center gap-2 text-sm text-[#A0A0A0]">
                <Car size={14} className="flex-shrink-0" />
                <span className="text-[#F0F0F0]">{viagem.motorista.veiculo_modelo}</span>
                {viagem.motorista.veiculo_placa && (
                  <span className="bg-[#1E1E1E] border border-[#444] px-2 py-0.5 rounded font-mono text-xs">{viagem.motorista.veiculo_placa}</span>
                )}
                {viagem.motorista.veiculo_cor && (
                  <span>· {viagem.motorista.veiculo_cor}</span>
                )}
              </div>
            )}
            {viagem.motorista.telefone && (
              <a
                href={`https://wa.me/55${viagem.motorista.telefone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 border border-[#22C55E]/40 text-[#22C55E] py-2.5 rounded hover:bg-[#22C55E]/10 transition-colors text-sm"
              >
                <MessageCircle size={16} />
                Enviar mensagem pelo WhatsApp
              </a>
            )}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-col gap-3">
        <Link href="/perfil" className="w-full text-center bg-[#CC0000] text-white py-3 rounded hover:bg-[#E50000] transition-colors font-medium">
          Ver minhas viagens
        </Link>
        <Link href="/solicitar" className="w-full text-center border border-[#444] text-[#A0A0A0] py-3 rounded hover:border-[#CC0000] hover:text-[#F0F0F0] transition-colors text-sm">
          Solicitar outra corrida
        </Link>
      </div>

    </div>
  );
}

export default function ConfirmacaoPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#1E1E1E] pt-24 pb-12 px-4">
        <Suspense fallback={
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="text-[#CC0000] animate-spin" />
          </div>
        }>
          <ConfirmacaoContent />
        </Suspense>
      </div>
    </>
  );
}
