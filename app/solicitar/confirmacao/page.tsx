"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import {
  CheckCircle,
  MapPin,
  Navigation,
  Calendar,
  Clock,
  User,
  Phone,
  Car,
  Star,
  MessageCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// Mock — substituir por dados reais depois
const corrida = {
  id: "006",
  origem: "Sorocaba Centro",
  destino: "Aeroporto de Guarulhos (GRU)",
  data: "25/03/2026",
  hora: "05:30",
  valor: "R$ 400,00",
  status: "confirmada" as const,
  motorista: {
    nome: "Carlos Silva",
    veiculo: "Toyota Corolla Prata",
    placa: "ABC-1234",
    avaliacao: 4.9,
    telefone: "(15) 99999-1234",
  },
};

type Status = "aguardando" | "confirmada" | "em_rota";

const statusConfig: Record<Status, { label: string; descricao: string; cor: string; bg: string }> = {
  aguardando:  { label: "Aguardando motorista", descricao: "Sua solicitação foi recebida. Um motorista será atribuído em breve.", cor: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  confirmada:  { label: "Motorista confirmado",  descricao: "Seu motorista aceitou a corrida e estará pronto no horário.",        cor: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  em_rota:     { label: "Motorista a caminho",   descricao: "Seu motorista está a caminho do ponto de embarque.",                cor: "#22C55E", bg: "rgba(34,197,94,0.1)" },
};

export default function ConfirmacaoPage() {
  const [status] = useState<Status>(corrida.status);
  const s = statusConfig[status];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#1E1E1E] pt-24 pb-12 px-4">
        <div className="max-w-lg mx-auto space-y-6">

          {/* Cabeçalho */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 border-2 border-[#22C55E] flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-[#22C55E]" />
            </div>
            <h1
              className="text-3xl font-bold text-[#F0F0F0] uppercase"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Corrida solicitada!
            </h1>
            <p className="text-[#A0A0A0] text-sm mt-2">
              Você receberá uma confirmação pelo WhatsApp.
            </p>
          </div>

          {/* Status */}
          <div
            className="rounded-xl p-4 flex items-start gap-3 border"
            style={{ backgroundColor: s.bg, borderColor: s.cor + "44" }}
          >
            <Loader2 size={18} style={{ color: s.cor }} className={status === "aguardando" ? "animate-spin mt-0.5" : "mt-0.5"} />
            <div>
              <p className="font-semibold text-sm" style={{ color: s.cor }}>{s.label}</p>
              <p className="text-[#A0A0A0] text-xs mt-0.5">{s.descricao}</p>
            </div>
          </div>

          {/* Detalhes da corrida */}
          <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="px-5 py-4 border-b border-[#444]">
              <p className="text-[#A0A0A0] text-xs uppercase tracking-wider">Corrida #{corrida.id}</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Navigation size={16} className="text-[#A0A0A0] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[#A0A0A0] text-xs mb-0.5">Origem</p>
                  <p className="text-[#F0F0F0] text-sm">{corrida.origem}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#CC0000] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[#A0A0A0] text-xs mb-0.5">Destino</p>
                  <p className="text-[#F0F0F0] text-sm">{corrida.destino}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#333]">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#A0A0A0]" />
                  <div>
                    <p className="text-[#A0A0A0] text-xs">Data</p>
                    <p className="text-[#F0F0F0] text-sm">{corrida.data}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#A0A0A0]" />
                  <div>
                    <p className="text-[#A0A0A0] text-xs">Horário</p>
                    <p className="text-[#F0F0F0] text-sm">{corrida.hora}</p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-[#333] flex items-center justify-between">
                <p className="text-[#A0A0A0] text-sm">Valor estimado</p>
                <p className="text-[#F0F0F0] font-bold text-lg">{corrida.valor}</p>
              </div>
            </div>
          </div>

          {/* Card do motorista */}
          {status !== "aguardando" && (
            <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="px-5 py-4 border-b border-[#444]">
                <p className="text-[#A0A0A0] text-xs uppercase tracking-wider">Seu motorista</p>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#CC0000]/10 border border-[#CC0000]/30 flex items-center justify-center text-[#CC0000] font-bold text-lg flex-shrink-0">
                    {corrida.motorista.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#F0F0F0] font-semibold">{corrida.motorista.nome}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={12} className="text-[#F59E0B] fill-[#F59E0B]" />
                      <span className="text-[#F0F0F0] text-sm">{corrida.motorista.avaliacao}</span>
                    </div>
                  </div>
                  <a
                    href={`tel:${corrida.motorista.telefone}`}
                    className="w-10 h-10 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center"
                  >
                    <Phone size={16} className="text-[#22C55E]" />
                  </a>
                </div>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#333]">
                  <Car size={14} className="text-[#A0A0A0]" />
                  <span className="text-[#A0A0A0] text-sm">{corrida.motorista.veiculo}</span>
                  <span className="ml-auto text-xs bg-[#1E1E1E] border border-[#444] text-[#F0F0F0] px-2 py-1 rounded font-mono">
                    {corrida.motorista.placa}
                  </span>
                </div>

                <a
                  href={`https://wa.me/55${corrida.motorista.telefone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full flex items-center justify-center gap-2 border border-[#22C55E]/40 text-[#22C55E] py-2.5 rounded hover:bg-[#22C55E]/10 transition-colors text-sm"
                >
                  <MessageCircle size={16} />
                  Enviar mensagem pelo WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col gap-3">
            <Link
              href="/historico"
              className="w-full text-center bg-[#CC0000] text-white py-3 rounded hover:bg-[#E50000] transition-colors font-medium"
            >
              Ver minhas viagens
            </Link>
            <Link
              href="/solicitar"
              className="w-full text-center border border-[#444] text-[#A0A0A0] py-3 rounded hover:border-[#CC0000] hover:text-[#F0F0F0] transition-colors text-sm"
            >
              Solicitar outra corrida
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
