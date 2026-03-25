"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  MapPin,
  Navigation,
  Calendar,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Car,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type StatusViagem = "concluida" | "cancelada" | "em_rota" | "confirmada" | "pendente";

type Viagem = {
  id: string;
  origem: string;
  destino: string;
  data: string;
  hora: string;
  status: StatusViagem;
  valor: string;
  avaliacao: number | null;
};

const statusConfig: Record<StatusViagem, { label: string; cor: string; bg: string }> = {
  concluida:  { label: "Concluída",  cor: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  cancelada:  { label: "Cancelada",  cor: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  em_rota:    { label: "Em rota",    cor: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  confirmada: { label: "Confirmada", cor: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  pendente:   { label: "Pendente",   cor: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
};

function Estrelas({ nota }: { nota: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={i <= nota ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#444444]"}
        />
      ))}
    </div>
  );
}

function formatarValor(valor: number | null): string {
  if (valor === null) return "A definir";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function HistoricoPage() {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rows } = await supabase
        .from("viagens")
        .select("id, origem, destino, data_hora, status, valor")
        .eq("cliente_id", user.id)
        .order("data_hora", { ascending: false });

      const { data: avaliacoes } = await supabase
        .from("avaliacoes")
        .select("viagem_id, nota")
        .eq("avaliador_id", user.id);

      const avaliacaoMap: Record<string, number> = {};
      for (const a of avaliacoes ?? []) {
        avaliacaoMap[a.viagem_id] = a.nota;
      }

      const mapped: Viagem[] = (rows ?? []).map((v) => {
        const dataHora = new Date(v.data_hora);
        return {
          id: v.id,
          origem: v.origem,
          destino: v.destino,
          data: dataHora.toLocaleDateString("pt-BR"),
          hora: dataHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          status: v.status as StatusViagem,
          valor: formatarValor(v.valor),
          avaliacao: avaliacaoMap[v.id] ?? null,
        };
      });

      setViagens(mapped);
      setLoading(false);
    }
    load();
  }, []);

  const concluidas = viagens.filter((v) => v.status === "concluida");
  const totalGasto = concluidas.reduce((acc, v) => {
    const num = parseFloat(v.valor.replace(/[R$\s.]/g, "").replace(",", "."));
    return acc + (isNaN(num) ? 0 : num);
  }, 0);
  const avaliacaoMedia =
    concluidas.filter((v) => v.avaliacao !== null).length > 0
      ? concluidas
          .filter((v) => v.avaliacao !== null)
          .reduce((acc, v) => acc + (v.avaliacao ?? 0), 0) /
        concluidas.filter((v) => v.avaliacao !== null).length
      : null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#1E1E1E] pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Cabeçalho */}
          <div>
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-2">
              Minhas viagens
            </p>
            <h1
              className="text-4xl font-bold text-[#F0F0F0] uppercase"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Histórico
            </h1>
          </div>

          {loading ? (
            <p className="text-[#A0A0A0] text-sm animate-pulse text-center py-12">Carregando...</p>
          ) : (
            <>
              {/* Resumo */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#F0F0F0]">{concluidas.length}</p>
                  <p className="text-[#A0A0A0] text-xs mt-0.5">Viagens</p>
                </div>
                <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#F0F0F0]">
                    {totalGasto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                  <p className="text-[#A0A0A0] text-xs mt-0.5">Total gasto</p>
                </div>
                <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
                    <p className="text-2xl font-bold text-[#F0F0F0]">
                      {avaliacaoMedia !== null ? avaliacaoMedia.toFixed(1) : "—"}
                    </p>
                  </div>
                  <p className="text-[#A0A0A0] text-xs mt-0.5">Avaliação</p>
                </div>
              </div>

              {/* Lista de viagens */}
              {viagens.length === 0 ? (
                <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl p-12 text-center">
                  <Car size={40} className="text-[#444444] mx-auto mb-4" />
                  <p className="text-[#F0F0F0] font-medium">Nenhuma viagem ainda</p>
                  <p className="text-[#A0A0A0] text-sm mt-1">Suas corridas aparecerão aqui.</p>
                  <a
                    href="/solicitar"
                    className="inline-block mt-4 bg-[#CC0000] text-white text-sm px-5 py-2.5 rounded hover:bg-[#E50000] transition-colors"
                  >
                    Solicitar corrida
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {viagens.map((v) => {
                    const s = statusConfig[v.status];
                    const aberto = expandido === v.id;

                    return (
                      <div
                        key={v.id}
                        className="bg-[#2B2B2B] border border-[#444444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandido(aberto ? null : v.id)}
                          className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-[#333] transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#1E1E1E] border border-[#444] flex items-center justify-center flex-shrink-0">
                            <Car size={18} className="text-[#CC0000]" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 text-[#A0A0A0] text-xs">
                              <Navigation size={11} className="flex-shrink-0" />
                              <span className="truncate">{v.origem}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[#F0F0F0] text-sm font-medium mt-0.5">
                              <MapPin size={11} className="flex-shrink-0 text-[#CC0000]" />
                              <span className="truncate">{v.destino}</span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="text-[#A0A0A0] text-xs flex items-center justify-end gap-1">
                              <Calendar size={11} />
                              {v.data}
                            </p>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block"
                              style={{ color: s.cor, backgroundColor: s.bg }}
                            >
                              {s.label}
                            </span>
                          </div>

                          <div className="text-[#A0A0A0] flex-shrink-0">
                            {aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        {aberto && (
                          <div className="border-t border-[#444] px-5 py-4 space-y-3 bg-[#222]">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-[#A0A0A0] text-xs mb-1 flex items-center gap-1">
                                  <Clock size={11} /> Horário
                                </p>
                                <p className="text-[#F0F0F0]">{v.hora}</p>
                              </div>
                              <div>
                                <p className="text-[#A0A0A0] text-xs mb-1">Valor</p>
                                <p className="text-[#F0F0F0] font-semibold">{v.valor}</p>
                              </div>
                              {v.avaliacao !== null && (
                                <div>
                                  <p className="text-[#A0A0A0] text-xs mb-1">Sua avaliação</p>
                                  <Estrelas nota={v.avaliacao} />
                                </div>
                              )}
                            </div>

                            {v.status === "concluida" && v.avaliacao === null && (
                              <div className="pt-2 border-t border-[#333]">
                                <p className="text-[#A0A0A0] text-xs mb-2">Avaliar esta viagem</p>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <button key={i} className="text-[#444444] hover:text-[#F59E0B] transition-colors">
                                      <Star size={20} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {v.status === "concluida" && (
                              <a
                                href="/solicitar"
                                className="block w-full text-center text-sm border border-[#CC0000] text-[#CC0000] py-2.5 rounded hover:bg-[#CC0000]/10 transition-colors mt-2"
                              >
                                Repetir esta viagem
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}
