"use client";

import { useState } from "react";
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

// Mock — substituir por dados reais do Supabase depois
type StatusViagem = "concluida" | "cancelada" | "em_rota" | "confirmada" | "pendente";

const viagensMock: {
  id: string;
  origem: string;
  destino: string;
  data: string;
  hora: string;
  status: StatusViagem;
  motorista: string | null;
  valor: string;
  avaliacao: number | null;
}[] = [
  {
    id: "005",
    origem: "Sorocaba Centro",
    destino: "Aeroporto de Guarulhos (GRU)",
    data: "22/03/2026",
    hora: "05:30",
    status: "concluida",
    motorista: "Carlos Silva",
    valor: "R$ 400,00",
    avaliacao: 5,
  },
  {
    id: "004",
    origem: "Sorocaba Sul",
    destino: "Aeroporto de Viracopos (VCP)",
    data: "15/03/2026",
    hora: "07:00",
    status: "concluida",
    motorista: "Marcos Oliveira",
    valor: "R$ 300,00",
    avaliacao: 4,
  },
  {
    id: "003",
    origem: "Votorantim",
    destino: "Sorocaba Centro",
    data: "08/03/2026",
    hora: "18:45",
    status: "concluida",
    motorista: "João Pereira",
    valor: "R$ 80,00",
    avaliacao: 5,
  },
  {
    id: "002",
    origem: "Sorocaba Norte",
    destino: "Aeroporto de Congonhas (CGH)",
    data: "01/03/2026",
    hora: "06:00",
    status: "cancelada",
    motorista: null,
    valor: "R$ 350,00",
    avaliacao: null,
  },
  {
    id: "001",
    origem: "Sorocaba Leste",
    destino: "Sorocaba Oeste",
    data: "20/02/2026",
    hora: "14:00",
    status: "concluida",
    motorista: "Ricardo Santos",
    valor: "R$ 80,00",
    avaliacao: 5,
  },
];

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

export default function HistoricoPage() {
  const [expandido, setExpandido] = useState<string | null>(null);

  const totalViagens = viagensMock.filter((v) => v.status === "concluida").length;
  const totalGasto = viagensMock
    .filter((v) => v.status === "concluida")
    .reduce((acc, v) => acc + parseFloat(v.valor.replace("R$ ", "").replace(".", "").replace(",", ".")), 0);
  const avaliacaoMedia =
    viagensMock
      .filter((v) => v.avaliacao !== null)
      .reduce((acc, v) => acc + (v.avaliacao ?? 0), 0) /
    viagensMock.filter((v) => v.avaliacao !== null).length;

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

          {/* Resumo */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#F0F0F0]">{totalViagens}</p>
              <p className="text-[#A0A0A0] text-xs mt-0.5">Viagens</p>
            </div>
            <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#F0F0F0]">
                R$ {totalGasto.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
              </p>
              <p className="text-[#A0A0A0] text-xs mt-0.5">Total gasto</p>
            </div>
            <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <Star size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
                <p className="text-2xl font-bold text-[#F0F0F0]">{avaliacaoMedia.toFixed(1)}</p>
              </div>
              <p className="text-[#A0A0A0] text-xs mt-0.5">Avaliação</p>
            </div>
          </div>

          {/* Lista de viagens */}
          {viagensMock.length === 0 ? (
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
              {viagensMock.map((v) => {
                const s = statusConfig[v.status];
                const aberto = expandido === v.id;

                return (
                  <div
                    key={v.id}
                    className="bg-[#2B2B2B] border border-[#444444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] overflow-hidden"
                  >
                    {/* Linha principal */}
                    <button
                      onClick={() => setExpandido(aberto ? null : v.id)}
                      className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-[#333] transition-colors"
                    >
                      {/* Ícone */}
                      <div className="w-10 h-10 rounded-full bg-[#1E1E1E] border border-[#444] flex items-center justify-center flex-shrink-0">
                        <Car size={18} className="text-[#CC0000]" />
                      </div>

                      {/* Trajeto */}
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

                      {/* Data + status */}
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

                      {/* Chevron */}
                      <div className="text-[#A0A0A0] flex-shrink-0">
                        {aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {/* Detalhes expandidos */}
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
                          {v.motorista && (
                            <div>
                              <p className="text-[#A0A0A0] text-xs mb-1">Motorista</p>
                              <p className="text-[#F0F0F0]">{v.motorista}</p>
                            </div>
                          )}
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

        </div>
      </div>
    </>
  );
}
