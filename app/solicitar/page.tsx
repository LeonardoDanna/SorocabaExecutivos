"use client";

import Navbar from "../components/Navbar";
import { MapPin, Navigation, Calendar, Clock, ChevronDown, ArrowRight } from "lucide-react";
import { useState, useTransition } from "react";
import { solicitarCorrida } from "../actions/viagens";

const destinosPredefinidos = [
  { nome: "Aeroporto de Guarulhos (GRU)", valor: "R$ 400,00" },
  { nome: "Aeroporto de Congonhas (CGH)", valor: "R$ 350,00" },
  { nome: "Aeroporto de Viracopos (VCP)", valor: "R$ 300,00" },
  { nome: "Rodoviária de Sorocaba", valor: null },
  { nome: "Shopping Iguatemi Sorocaba", valor: null },
  { nome: "Hospital Santa Lucinda", valor: null },
];

export default function SolicitarPage() {
  const [destinoSelecionado, setDestinoSelecionado] = useState("");
  const [erro, setErro] = useState("");
  const [isPending, startTransition] = useTransition();

  const valorEstimado = destinosPredefinidos.find((d) => d.nome === destinoSelecionado)?.valor;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await solicitarCorrida(formData);
      if (result?.erro) setErro(result.erro);
    });
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#1E1E1E] pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-2">
              Nova viagem
            </p>
            <h1
              className="text-4xl font-bold text-[#F0F0F0] uppercase"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Solicitar corrida
            </h1>
            <p className="text-[#A0A0A0] mt-2">Preencha os dados da sua viagem.</p>
          </div>

          <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Origem */}
              <div>
                <label className="block text-[#A0A0A0] text-sm mb-2">Local de origem</label>
                <div className="relative">
                  <Navigation size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                  <input
                    name="origem"
                    type="text"
                    placeholder="Endereço de partida"
                    required
                    className="w-full bg-[#2B2B2B] border border-[#444444] text-[#F0F0F0] placeholder-[#A0A0A0] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#CC0000] transition-colors"
                  />
                </div>
              </div>

              {/* Destino */}
              <div>
                <label className="block text-[#A0A0A0] text-sm mb-2">Destino</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                  <input
                    name="destino"
                    type="text"
                    placeholder="Endereço de destino"
                    value={destinoSelecionado}
                    onChange={(e) => setDestinoSelecionado(e.target.value)}
                    required
                    className="w-full bg-[#2B2B2B] border border-[#444444] text-[#F0F0F0] placeholder-[#A0A0A0] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#CC0000] transition-colors"
                  />
                </div>

                {/* Destinos pré-definidos */}
                <div className="mt-3">
                  <p className="text-xs text-[#A0A0A0] mb-2 flex items-center gap-1">
                    <ChevronDown size={12} /> Destinos frequentes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {destinosPredefinidos.map((d) => (
                      <button
                        key={d.nome}
                        type="button"
                        onClick={() => setDestinoSelecionado(d.nome)}
                        className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                          destinoSelecionado === d.nome
                            ? "bg-[#CC0000] border-[#CC0000] text-white"
                            : "border-[#444444] text-[#A0A0A0] hover:border-[#CC0000] hover:text-[#F0F0F0]"
                        }`}
                      >
                        {d.nome}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A0A0A0] text-sm mb-2">Data</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                    <input
                      name="data"
                      type="date"
                      required
                      className="w-full bg-[#2B2B2B] border border-[#444444] text-[#F0F0F0] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#CC0000] transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#A0A0A0] text-sm mb-2">Horário</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                    <input
                      name="hora"
                      type="time"
                      required
                      className="w-full bg-[#2B2B2B] border border-[#444444] text-[#F0F0F0] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#CC0000] transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* Valor estimado */}
              {valorEstimado && (
                <div className="bg-[#1E1E1E] border border-[#CC0000]/30 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-[#A0A0A0] text-sm">Valor estimado</span>
                  <span className="text-[#CC0000] font-bold text-lg">{valorEstimado}</span>
                </div>
              )}

              {erro && (
                <p className="text-[#EF4444] text-sm bg-[#EF4444]/10 border border-[#EF4444]/30 rounded px-4 py-2">
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#CC0000] text-white py-4 rounded font-semibold hover:bg-[#E50000] transition-colors flex items-center justify-center gap-2 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? "Enviando..." : "Solicitar corrida"}
                {!isPending && <ArrowRight size={20} />}
              </button>
            </form>
          </div>

          <p className="text-center text-[#A0A0A0] text-sm mt-6">
            Dúvidas sobre valores?{" "}
            <a href="/#precos" className="text-[#CC0000] hover:text-[#E50000]">
              Consulte nossa tabela de preços
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
