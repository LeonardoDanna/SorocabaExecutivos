"use client";

import Navbar from "../components/Navbar";
import { MapPin, Navigation, Calendar, Clock, ArrowRight } from "lucide-react";
import { useState, useTransition, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { solicitarCorrida } from "../actions/viagens";

function defaultHoraMinuto() {
  const now = new Date();
  let h = now.getHours();
  let m = Math.ceil(now.getMinutes() / 15) * 15;
  if (m >= 60) { m = 0; h = (h + 1) % 24; }
  return {
    h: h.toString().padStart(2, "0"),
    m: m.toString().padStart(2, "0"),
  };
}

const { h: hDefault, m: mDefault } = defaultHoraMinuto();

function SolicitarForm() {
  const params = useSearchParams();
  const [origem, setOrigem] = useState(params.get("origem") ?? "");
  const [destino, setDestino] = useState(params.get("destino") ?? "");
  const [hora, setHora] = useState(hDefault);
  const [minuto, setMinuto] = useState(mDefault);
  const [erro, setErro] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const o = params.get("origem");
    const d = params.get("destino");
    if (o) setOrigem(o);
    if (d) setDestino(d);
  }, [params]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await solicitarCorrida(formData);
      if (result?.erro) setErro(result.erro);
    });
  }

  const selectCls =
    "bg-[#2B2B2B] border border-[#444444] text-[#F0F0F0] rounded px-3 py-3 focus:outline-none focus:border-[#CC0000] transition-colors [color-scheme:dark] appearance-none text-center";

  return (
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
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
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
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              required
              className="w-full bg-[#2B2B2B] border border-[#444444] text-[#F0F0F0] placeholder-[#A0A0A0] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#CC0000] transition-colors"
            />
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
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-[#2B2B2B] border border-[#444444] text-[#F0F0F0] rounded px-4 py-3 pl-10 focus:outline-none focus:border-[#CC0000] transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#A0A0A0] text-sm mb-2">Horário</label>
            <input type="hidden" name="hora" value={`${hora}:${minuto}`} />
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Clock size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A0A0A0] pointer-events-none" />
                <select
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className={`w-full pl-8 ${selectCls}`}
                >
                  {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")).map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <span className="text-[#A0A0A0] font-bold">:</span>
              <select
                value={minuto}
                onChange={(e) => setMinuto(e.target.value)}
                className={`w-20 ${selectCls}`}
              >
                {["00", "15", "30", "45"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

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
  );
}

export default function SolicitarPage() {
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

          <Suspense fallback={null}>
            <SolicitarForm />
          </Suspense>

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
