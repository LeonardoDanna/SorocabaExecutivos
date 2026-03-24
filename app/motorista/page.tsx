"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "../components/Logo";
import {
  LayoutDashboard,
  CalendarDays,
  Bell,
  BarChart2,
  LogOut,
  Car,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  ChevronRight,
  Menu,
  Wifi,
  WifiOff,
} from "lucide-react";

// --- Mock ---

type StatusViagem = "pendente" | "confirmada" | "em_rota" | "concluida" | "cancelada";

const viagensHoje: {
  id: string;
  cliente: string;
  telefone: string;
  origem: string;
  destino: string;
  hora: string;
  valor: string;
  status: StatusViagem;
}[] = [
  { id: "001", cliente: "Ana Paula Souza",  telefone: "(15) 99123-4567", origem: "Sorocaba Centro", destino: "Aeroporto de Guarulhos (GRU)", hora: "06:00", valor: "R$ 400,00", status: "confirmada" },
  { id: "002", cliente: "Roberto Meireles", telefone: "(15) 98765-4321", origem: "Votorantim",      destino: "Aeroporto de Congonhas (CGH)", hora: "08:30", valor: "R$ 350,00", status: "em_rota" },
  { id: "003", cliente: "Fernanda Lima",    telefone: "(15) 97654-3210", origem: "Sorocaba Sul",    destino: "Aeroporto de Viracopos (VCP)", hora: "10:00", valor: "R$ 300,00", status: "pendente" },
];

const agendaSemana: { dia: string; data: string; viagens: typeof viagensHoje }[] = [
  { dia: "Seg", data: "24/03", viagens: viagensHoje },
  { dia: "Ter", data: "25/03", viagens: [viagensHoje[0], viagensHoje[2]] },
  { dia: "Qua", data: "26/03", viagens: [viagensHoje[1]] },
  { dia: "Qui", data: "27/03", viagens: [] },
  { dia: "Sex", data: "28/03", viagens: [viagensHoje[0]] },
  { dia: "Sáb", data: "29/03", viagens: [] },
  { dia: "Dom", data: "30/03", viagens: [] },
];

const avaliacoes = [
  { id: 1, cliente: "Ana Paula Souza",  nota: 5, comentario: "Excelente motorista, muito pontual!",   data: "22/03/2026" },
  { id: 2, cliente: "Roberto Meireles", nota: 5, comentario: "Ótimo serviço, carro muito limpo.",     data: "20/03/2026" },
  { id: 3, cliente: "Fernanda Lima",    nota: 4, comentario: "Bom atendimento.",                      data: "18/03/2026" },
  { id: 4, cliente: "Thiago Ramos",     nota: 5, comentario: "Recomendo! Muito profissional.",        data: "15/03/2026" },
  { id: 5, cliente: "Juliana Castro",   nota: 4, comentario: "",                                      data: "12/03/2026" },
];

const metricas = {
  avaliacao_media: 4.8,
  total_viagens: 47,
  viagens_mes: 14,
  taxa_aceite: 96,
  km_mes: 1240,
  faturamento_mes: "R$ 4.850,00",
};

const statusConfig: Record<StatusViagem, { label: string; cor: string; bg: string }> = {
  pendente:   { label: "Pendente",   cor: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  confirmada: { label: "Confirmada", cor: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  em_rota:    { label: "Em rota",    cor: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  concluida:  { label: "Concluída",  cor: "#A0A0A0", bg: "rgba(160,160,160,0.1)" },
  cancelada:  { label: "Cancelada",  cor: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

type Aba = "painel" | "agenda" | "solicitacao" | "metricas";

// --- Componente ---

export default function MotoristaPainelPage() {
  const [aba, setAba] = useState<Aba>("painel");
  const [online, setOnline] = useState(true);
  const [diaSelecionado, setDiaSelecionado] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [novaAceita, setNovaAceita] = useState<string | null>(null);

  const navItems: { id: Aba; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "painel",      label: "Painel",          icon: LayoutDashboard },
    { id: "agenda",      label: "Agenda",          icon: CalendarDays, badge: viagensHoje.filter(v => v.status === "pendente").length },
    { id: "solicitacao", label: "Solicitações",    icon: Bell },
    { id: "metricas",    label: "Métricas",        icon: BarChart2 },
  ];

  const viagensDia = agendaSemana[diaSelecionado].viagens;

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static top-0 left-0 h-full w-64 bg-[#151515] border-r border-[#333] z-30 flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 border-b border-[#333]">
          <Link href="/" onClick={() => setSidebarOpen(false)}>
            <Logo size="sm" />
          </Link>
          <p className="text-[#A0A0A0] text-xs mt-2 uppercase tracking-wider">Painel Motorista</p>
        </div>

        {/* Toggle online */}
        <div className="px-4 py-3 border-b border-[#333]">
          <button
            onClick={() => setOnline(!online)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${online ? "bg-[#22C55E]/10 border border-[#22C55E]/30" : "bg-[#333] border border-[#444]"}`}
          >
            <span className="flex items-center gap-2">
              {online ? <Wifi size={16} className="text-[#22C55E]" /> : <WifiOff size={16} className="text-[#A0A0A0]" />}
              <span style={{ color: online ? "#22C55E" : "#A0A0A0" }}>{online ? "Online" : "Offline"}</span>
            </span>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${online ? "bg-[#22C55E]" : "bg-[#444]"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${online ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const ativa = aba === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setAba(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${ativa ? "bg-[#CC0000] text-white" : "text-[#A0A0A0] hover:bg-[#2B2B2B] hover:text-[#F0F0F0]"}`}
              >
                <span className="flex items-center gap-3"><Icon size={18} />{item.label}</span>
                {item.badge ? (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${ativa ? "bg-white/20" : "bg-[#CC0000] text-white"}`}>{item.badge}</span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#333]">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-[#A0A0A0] hover:text-[#EF4444] text-sm rounded-lg hover:bg-[#2B2B2B] transition-colors">
            <LogOut size={18} />Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-4 border-b border-[#333] bg-[#151515]">
          <button onClick={() => setSidebarOpen(true)} className="text-[#A0A0A0]"><Menu size={24} /></button>
          <span className="text-[#F0F0F0] text-sm font-semibold uppercase tracking-wider">
            {navItems.find((n) => n.id === aba)?.label}
          </span>
          <div className="w-6" />
        </header>

        <div className="flex-1 p-6 overflow-auto">

          {/* ── Painel ── */}
          {aba === "painel" && (
            <div className="space-y-6">
              <div>
                <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Resumo do dia</p>
                <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
                  Bom dia, Carlos!
                </h1>
              </div>

              {/* KPIs do dia */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Viagens hoje",   valor: viagensHoje.length.toString(),                                icon: Car,       cor: "#CC0000" },
                  { label: "Concluídas",     valor: viagensHoje.filter(v => v.status === "concluida").length.toString(), icon: CheckCircle, cor: "#22C55E" },
                  { label: "Pendentes",      valor: viagensHoje.filter(v => v.status === "pendente").length.toString(),  icon: Clock,      cor: "#F59E0B" },
                  { label: "Avaliação",      valor: metricas.avaliacao_media.toFixed(1),                          icon: Star,       cor: "#F59E0B" },
                ].map((k) => {
                  const Icon = k.icon;
                  return (
                    <div key={k.label} className="bg-[#2B2B2B] border border-[#444] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#A0A0A0] text-xs">{k.label}</span>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: k.cor + "22" }}>
                          <Icon size={16} style={{ color: k.cor }} />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-[#F0F0F0]">{k.valor}</p>
                    </div>
                  );
                })}
              </div>

              {/* Próximas viagens */}
              <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#444]">
                  <h2 className="text-[#F0F0F0] font-semibold">Viagens de hoje</h2>
                  <button onClick={() => setAba("agenda")} className="text-[#CC0000] text-sm flex items-center gap-1 hover:text-[#E50000]">
                    Ver agenda <ChevronRight size={14} />
                  </button>
                </div>
                <div className="divide-y divide-[#333]">
                  {viagensHoje.map((v) => {
                    const s = statusConfig[v.status];
                    return (
                      <div key={v.id} className="px-6 py-4 flex items-center gap-4">
                        <div className="text-center w-12 flex-shrink-0">
                          <p className="text-[#CC0000] font-bold text-lg">{v.hora.split(":")[0]}</p>
                          <p className="text-[#A0A0A0] text-xs">:{v.hora.split(":")[1]}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#F0F0F0] text-sm font-medium">{v.cliente}</p>
                          <div className="flex items-center gap-1 text-[#A0A0A0] text-xs mt-0.5">
                            <Navigation size={10} />
                            <span className="truncate">{v.origem}</span>
                            <span>→</span>
                            <MapPin size={10} className="text-[#CC0000] flex-shrink-0" />
                            <span className="truncate">{v.destino}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <p className="text-[#F0F0F0] text-sm font-medium hidden sm:block">{v.valor}</p>
                          <span className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap" style={{ color: s.cor, backgroundColor: s.bg }}>{s.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Agenda ── */}
          {aba === "agenda" && (
            <div className="space-y-6">
              <div>
                <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Programação</p>
                <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>Agenda Semanal</h1>
              </div>

              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-2">
                {agendaSemana.map((dia, i) => (
                  <button
                    key={dia.dia}
                    onClick={() => setDiaSelecionado(i)}
                    className={`rounded-xl p-3 text-center transition-colors ${diaSelecionado === i ? "bg-[#CC0000] text-white" : "bg-[#2B2B2B] border border-[#444] text-[#A0A0A0] hover:border-[#CC0000]"}`}
                  >
                    <p className="text-xs font-medium">{dia.dia}</p>
                    <p className="text-lg font-bold mt-0.5">{dia.data.split("/")[0]}</p>
                    {dia.viagens.length > 0 && (
                      <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${diaSelecionado === i ? "bg-white" : "bg-[#CC0000]"}`} />
                    )}
                  </button>
                ))}
              </div>

              {/* Viagens do dia selecionado */}
              <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="px-6 py-4 border-b border-[#444]">
                  <h2 className="text-[#F0F0F0] font-semibold">
                    {agendaSemana[diaSelecionado].dia}, {agendaSemana[diaSelecionado].data}
                    <span className="text-[#A0A0A0] text-sm font-normal ml-2">— {viagensDia.length} viagem(ns)</span>
                  </h2>
                </div>
                {viagensDia.length === 0 ? (
                  <div className="p-12 text-center">
                    <CalendarDays size={36} className="text-[#444] mx-auto mb-3" />
                    <p className="text-[#A0A0A0] text-sm">Nenhuma viagem neste dia.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#333]">
                    {viagensDia.map((v) => {
                      const s = statusConfig[v.status];
                      return (
                        <div key={v.id} className="px-6 py-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock size={14} className="text-[#CC0000]" />
                                <span className="text-[#CC0000] font-bold">{v.hora}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: s.cor, backgroundColor: s.bg }}>{s.label}</span>
                              </div>
                              <p className="text-[#F0F0F0] font-medium">{v.cliente}</p>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-2 text-[#A0A0A0] text-sm">
                                  <Navigation size={12} /><span>{v.origem}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin size={12} className="text-[#CC0000]" /><span className="text-[#F0F0F0]">{v.destino}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[#F0F0F0] font-bold">{v.valor}</p>
                              <a href={`tel:${v.telefone}`} className="mt-2 flex items-center justify-end gap-1 text-[#22C55E] text-xs hover:underline">
                                <Phone size={12} />{v.telefone}
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Solicitações ── */}
          {aba === "solicitacao" && (
            <div className="space-y-6">
              <div>
                <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Novas corridas</p>
                <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>Solicitações</h1>
              </div>

              {viagensHoje.filter(v => v.status === "pendente").length === 0 ? (
                <div className="bg-[#2B2B2B] border border-[#444] rounded-xl p-12 text-center">
                  <Bell size={36} className="text-[#444] mx-auto mb-3" />
                  <p className="text-[#F0F0F0] font-medium">Nenhuma solicitação pendente</p>
                  <p className="text-[#A0A0A0] text-sm mt-1">Novas solicitações aparecerão aqui.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {viagensHoje.filter(v => v.status === "pendente").map((v) => (
                    <div key={v.id} className="bg-[#2B2B2B] border border-[#F59E0B]/30 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] overflow-hidden">
                      <div className="px-5 py-3 bg-[#F59E0B]/5 border-b border-[#F59E0B]/20 flex items-center gap-2">
                        <Bell size={14} className="text-[#F59E0B]" />
                        <span className="text-[#F59E0B] text-xs font-semibold uppercase tracking-wider">Nova solicitação</span>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-[#F0F0F0] font-bold text-sm flex-shrink-0">
                            {v.cliente.split(" ").map(n => n[0]).slice(0,2).join("")}
                          </div>
                          <div>
                            <p className="text-[#F0F0F0] font-semibold">{v.cliente}</p>
                            <p className="text-[#A0A0A0] text-xs">{v.hora} — {v.valor}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[#A0A0A0] text-sm"><Navigation size={14} /><span>{v.origem}</span></div>
                          <div className="flex items-center gap-2 text-[#F0F0F0] text-sm"><MapPin size={14} className="text-[#CC0000]" /><span>{v.destino}</span></div>
                        </div>
                        {novaAceita === v.id ? (
                          <div className="flex items-center gap-2 text-[#22C55E] text-sm bg-[#22C55E]/10 rounded-lg p-3">
                            <CheckCircle size={16} /><span>Viagem aceita! Adicionada à sua agenda.</span>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              onClick={() => setNovaAceita(v.id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-[#CC0000] text-white py-2.5 rounded hover:bg-[#E50000] transition-colors text-sm font-medium"
                            >
                              <CheckCircle size={16} />Aceitar
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 border border-[#444] text-[#A0A0A0] py-2.5 rounded hover:border-[#EF4444] hover:text-[#EF4444] transition-colors text-sm">
                              <XCircle size={16} />Recusar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Métricas ── */}
          {aba === "metricas" && (
            <div className="space-y-6">
              <div>
                <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Desempenho</p>
                <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>Métricas</h1>
              </div>

              {/* Cards métricas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Avaliação média",   valor: metricas.avaliacao_media.toFixed(1), sub: "★ últimos 30 dias", icon: Star,       cor: "#F59E0B" },
                  { label: "Viagens no mês",    valor: metricas.viagens_mes.toString(),     sub: "março 2026",        icon: Car,        cor: "#CC0000" },
                  { label: "Total de viagens",  valor: metricas.total_viagens.toString(),   sub: "desde o início",    icon: TrendingUp, cor: "#3B82F6" },
                  { label: "Taxa de aceite",    valor: `${metricas.taxa_aceite}%`,          sub: "solicitações",      icon: CheckCircle,cor: "#22C55E" },
                  { label: "Faturamento",       valor: metricas.faturamento_mes,            sub: "este mês",          icon: TrendingUp, cor: "#22C55E" },
                  { label: "Km rodados",        valor: `${metricas.km_mes} km`,             sub: "este mês",          icon: Navigation, cor: "#A0A0A0" },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className="bg-[#2B2B2B] border border-[#444] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[#A0A0A0] text-xs">{m.label}</span>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.cor + "22" }}>
                          <Icon size={15} style={{ color: m.cor }} />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-[#F0F0F0]">{m.valor}</p>
                      <p className="text-xs text-[#A0A0A0] mt-1">{m.sub}</p>
                    </div>
                  );
                })}
              </div>

              {/* Avaliações recentes */}
              <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="px-6 py-4 border-b border-[#444]">
                  <h2 className="text-[#F0F0F0] font-semibold">Avaliações recentes</h2>
                </div>
                <div className="divide-y divide-[#333]">
                  {avaliacoes.map((a) => (
                    <div key={a.id} className="px-6 py-4 flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-[#333] flex items-center justify-center text-[#F0F0F0] text-xs font-bold flex-shrink-0">
                        {a.cliente.split(" ").map(n => n[0]).slice(0,2).join("")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[#F0F0F0] text-sm font-medium">{a.cliente}</p>
                          <span className="text-[#A0A0A0] text-xs">{a.data}</span>
                        </div>
                        <div className="flex items-center gap-0.5 my-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} size={12} className={i <= a.nota ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#444]"} />
                          ))}
                        </div>
                        {a.comentario && <p className="text-[#A0A0A0] text-sm">{a.comentario}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
