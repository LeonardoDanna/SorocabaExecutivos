"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "../components/Logo";
import {
  LayoutDashboard, CalendarDays, Bell, BarChart2, LogOut,
  Car, Clock, MapPin, Navigation, Star, TrendingUp,
  CheckCircle, XCircle, ChevronRight, ChevronDown, Menu, Wifi, WifiOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/actions/auth";

// ── Tipos ──────────────────────────────────────────────────

type StatusViagem = "pendente" | "agendada" | "confirmada" | "em_rota" | "concluida" | "cancelada";

type ViagemDB = {
  id: string;
  origem: string;
  destino: string;
  data_hora: string;
  status: StatusViagem;
  valor: number | null;
  observacoes: string | null;
  cliente_id: string;
  cliente: { nome: string; telefone: string | null } | null;
};

type AvaliacaoRow = {
  nota: number;
  comentario: string | null;
  created_at: string;
  avaliador: { nome: string } | null;
};

// ── Helpers ────────────────────────────────────────────────

const statusConfig: Record<StatusViagem, { label: string; cor: string; bg: string }> = {
  pendente:   { label: "Pendente",   cor: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  agendada:   { label: "Aguard. aceite", cor: "#A855F7", bg: "rgba(168,85,247,0.1)" },
  confirmada: { label: "Confirmada", cor: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  em_rota:    { label: "Em rota",    cor: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  concluida:  { label: "Concluída",  cor: "#A0A0A0", bg: "rgba(160,160,160,0.1)" },
  cancelada:  { label: "Cancelada",  cor: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatValor(v: number | null) {
  if (!v) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function isSameDay(iso: string, ref: Date) {
  const d = new Date(iso);
  return d.getDate() === ref.getDate() &&
    d.getMonth() === ref.getMonth() &&
    d.getFullYear() === ref.getFullYear();
}

function semanaAtual(): Date[] {
  const hoje = new Date();
  const dow = hoje.getDay();
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    return d;
  });
}

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// ── Componente ─────────────────────────────────────────────

type Aba = "painel" | "agenda" | "solicitacao" | "metricas";

export default function MotoristaPainelPage() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("painel");
  const [online, setOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState(0);

  const [loading, setLoading] = useState(true);
  const [inativo, setInativo] = useState(false);
  const [nomeMotorista, setNomeMotorista] = useState("");
  const [viagens, setViagens] = useState<ViagemDB[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoRow[]>([]);
  const [periodoMetricas, setPeriodoMetricas] = useState<"dia" | "semana" | "mes" | "ano" | "all">("mes");

  const semana = semanaAtual();
  const hoje = new Date();

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }

    if (user.user_metadata?.perfil !== "motorista") {
      router.replace("/perfil");
      return;
    }

    // Perfil do motorista
    const { data: perfil } = await supabase
      .from("perfis")
      .select("nome, online, ativo")
      .eq("id", user.id)
      .single();

    if (!perfil?.ativo) {
      setInativo(true);
      setLoading(false);
      return;
    }

    setNomeMotorista(perfil.nome?.split(" ")[0] ?? "Motorista");
    setOnline(perfil.online ?? false);

    // Viagens atribuídas a este motorista
    const { data: viagensData } = await supabase
      .from("viagens")
      .select("*, cliente:perfis!cliente_id(nome, telefone)")
      .eq("motorista_id", user.id)
      .order("data_hora", { ascending: true });
    setViagens((viagensData as ViagemDB[]) ?? []);

    // Avaliações das viagens deste motorista
    const viagemIds = (viagensData ?? []).map((v) => v.id);
    if (viagemIds.length > 0) {
      const { data: avsData } = await supabase
        .from("avaliacoes")
        .select("nota, comentario, created_at")
        .in("viagem_id", viagemIds)
        .order("created_at", { ascending: false });
      setAvaliacoes((avsData as unknown as AvaliacaoRow[]) ?? []);
    }

    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleToggleOnline() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const novoStatus = !online;
    setOnline(novoStatus);
    await supabase.from("perfis").update({ online: novoStatus }).eq("id", user.id);
  }

  async function handleAtualizarStatus(viagemId: string, novoStatus: StatusViagem) {
    const supabase = createClient();
    await supabase.from("viagens").update({ status: novoStatus }).eq("id", viagemId);
    await loadData();
  }

  // Dados derivados
  const viagensHoje = viagens.filter((v) => isSameDay(v.data_hora, hoje));
  const pendentes = viagens.filter((v) => v.status === "agendada");
  const proximas = viagens.filter((v) => ["agendada", "confirmada", "em_rota"].includes(v.status));
  const feitas   = viagens.filter((v) => ["concluida", "cancelada"].includes(v.status));



  const inicioPeriodo: Record<typeof periodoMetricas, Date | null> = {
    dia:    new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()),
    semana: (() => { const d = new Date(hoje); d.setDate(hoje.getDate() - hoje.getDay()); d.setHours(0,0,0,0); return d; })(),
    mes:    new Date(hoje.getFullYear(), hoje.getMonth(), 1),
    ano:    new Date(hoje.getFullYear(), 0, 1),
    all:    null,
  };
  const labelPeriodo: Record<typeof periodoMetricas, string> = {
    dia: "hoje", semana: "esta semana", mes: "este mês", ano: "este ano", all: "desde o início",
  };
  const corte = inicioPeriodo[periodoMetricas];
  const viagensPeriodo = viagens.filter((v) =>
    v.status === "concluida" && (corte === null || new Date(v.data_hora) >= corte)
  );
  const faturamentoPeriodo = viagensPeriodo.reduce((acc, v) => acc + (v.valor ?? 0), 0);
  const avaliacaoMedia = avaliacoes.length
    ? avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length
    : null;

  const navItems: { id: Aba; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "painel",      label: "Painel",       icon: LayoutDashboard },
    { id: "agenda",      label: "Agenda",       icon: CalendarDays },
    { id: "solicitacao", label: "Solicitações", icon: Bell, badge: pendentes.length || undefined },
    { id: "metricas",    label: "Métricas",     icon: BarChart2 },
  ];

  if (inativo) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center mb-6">
          <XCircle size={32} className="text-[#EF4444]" />
        </div>
        <h1 className="text-2xl font-bold text-[#F0F0F0] mb-2" style={{ fontFamily: "var(--font-oswald)" }}>
          ACESSO SUSPENSO
        </h1>
        <p className="text-[#A0A0A0] text-sm max-w-sm mb-8">
          Seu perfil foi desativado pelo administrador. Entre em contato para mais informações.
        </p>
        <a
          href="https://wa.me/5519997590929"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#22C55E] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#16A34A] transition-colors text-sm"
        >
          Falar com o administrador
        </a>
        <form action={logout} className="mt-4">
          <button type="submit" className="text-xs text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors">
            Sair da conta
          </button>
        </form>
      </div>
    );
  }

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

        <div className="px-4 py-3 border-b border-[#333]">
          <button
            onClick={handleToggleOnline}
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
          <form action={logout}>
            <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 text-[#A0A0A0] hover:text-[#EF4444] text-sm rounded-lg hover:bg-[#2B2B2B] transition-colors">
              <LogOut size={18} />Sair
            </button>
          </form>
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
                  {saudacao()}{nomeMotorista ? `, ${nomeMotorista}!` : "!"}
                </h1>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Viagens hoje",  valor: loading ? "—" : viagensHoje.length.toString(),                                     icon: Car,         cor: "#CC0000" },
                  { label: "Concluídas",    valor: loading ? "—" : viagensHoje.filter(v => v.status === "concluida").length.toString(), icon: CheckCircle, cor: "#22C55E" },
                  { label: "Confirmadas",   valor: loading ? "—" : viagensHoje.filter(v => v.status === "confirmada").length.toString(),icon: Clock,       cor: "#3B82F6" },
                  { label: "Avaliação",     valor: loading ? "—" : (avaliacaoMedia !== null ? avaliacaoMedia.toFixed(1) : "—"),         icon: Star,        cor: "#F59E0B" },
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

              <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#444]">
                  <h2 className="text-[#F0F0F0] font-semibold">Viagens de hoje</h2>
                  <button onClick={() => setAba("agenda")} className="text-[#CC0000] text-sm flex items-center gap-1 hover:text-[#E50000]">
                    Ver agenda <ChevronRight size={14} />
                  </button>
                </div>
                {loading ? (
                  <p className="px-6 py-8 text-[#A0A0A0] text-sm animate-pulse text-center">Carregando...</p>
                ) : viagensHoje.length === 0 ? (
                  <p className="px-6 py-8 text-[#A0A0A0] text-sm text-center">Nenhuma viagem agendada para hoje.</p>
                ) : (
                  <div className="divide-y divide-[#333]">
                    {viagensHoje.map((v) => {
                      const s = statusConfig[v.status];
                      return (
                        <div key={v.id} className="px-6 py-4 flex items-center gap-4">
                          <div className="text-center w-12 flex-shrink-0">
                            <p className="text-[#CC0000] font-bold text-lg">{formatHora(v.data_hora).split(":")[0]}</p>
                            <p className="text-[#A0A0A0] text-xs">:{formatHora(v.data_hora).split(":")[1]}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#F0F0F0] text-sm font-medium">{v.cliente?.nome ?? "Cliente"}</p>
                            <div className="flex items-center gap-1 text-[#A0A0A0] text-xs mt-0.5">
                              <Navigation size={10} />
                              <span className="truncate">{v.origem}</span>
                              <span>→</span>
                              <MapPin size={10} className="text-[#CC0000] flex-shrink-0" />
                              <span className="truncate">{v.destino}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <p className="text-[#F0F0F0] text-sm font-medium hidden sm:block">{formatValor(v.valor)}</p>
                            <span className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap" style={{ color: s.cor, backgroundColor: s.bg }}>{s.label}</span>
                            {v.status === "confirmada" && (
                              <button
                                onClick={() => handleAtualizarStatus(v.id, "em_rota")}
                                className="text-xs px-3 py-1.5 bg-[#22C55E] text-white rounded font-medium hover:bg-[#16A34A] transition-colors whitespace-nowrap"
                              >
                                Iniciar
                              </button>
                            )}
                            {v.status === "em_rota" && (
                              <button
                                onClick={() => handleAtualizarStatus(v.id, "concluida")}
                                className="text-xs px-3 py-1.5 bg-[#3B82F6] text-white rounded font-medium hover:bg-[#2563EB] transition-colors whitespace-nowrap"
                              >
                                Concluir
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Próximas viagens */}
              <div>
                <h2 className="text-[#A0A0A0] text-xs uppercase tracking-widest font-semibold mb-3">Próximas viagens</h2>
                {loading ? (
                  <p className="text-[#A0A0A0] text-sm animate-pulse text-center py-8">Carregando...</p>
                ) : proximas.length === 0 ? (
                  <div className="bg-[#2B2B2B] border border-[#444] rounded-xl p-8 text-center">
                    <Car size={32} className="text-[#444] mx-auto mb-3" />
                    <p className="text-[#A0A0A0] text-sm">Nenhuma viagem agendada.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {proximas.map((v) => {
                      const s = statusConfig[v.status];
                      const d = new Date(v.data_hora);
                      return (
                        <div key={v.id} className="bg-[#2B2B2B] border border-[#444] rounded-xl px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[#444] text-xs font-mono">#{v.id.slice(0, 8).toUpperCase()}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: s.cor, backgroundColor: s.bg }}>{s.label}</span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[#A0A0A0] text-sm"><Navigation size={12} /><span>{v.origem}</span></div>
                            <div className="flex items-center gap-2 text-[#F0F0F0] text-sm"><MapPin size={12} className="text-[#CC0000]" /><span>{v.destino}</span></div>
                            {v.observacoes && (
                              <p className="text-xs text-[#A0A0A0] italic border-l-2 border-[#444] pl-2">{v.observacoes}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#333]">
                            <div className="flex items-center gap-3 text-[#A0A0A0] text-xs">
                              <span className="flex items-center gap-1"><Clock size={11} />{d.toLocaleDateString("pt-BR")}</span>
                              <span>{d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <span className="text-[#F0F0F0] text-sm font-semibold">{formatValor(v.valor)}</span>
                          </div>
                          {v.cliente && (
                            <p className="text-[#A0A0A0] text-xs mt-2">Cliente: <span className="text-[#F0F0F0]">{v.cliente.nome}</span></p>
                          )}
                          {v.status === "confirmada" && (
                            <button
                              onClick={() => handleAtualizarStatus(v.id, "em_rota")}
                              className="mt-3 w-full text-sm py-2 bg-[#22C55E] text-white rounded font-medium hover:bg-[#16A34A] transition-colors"
                            >
                              Iniciar corrida
                            </button>
                          )}
                          {v.status === "em_rota" && (
                            <button
                              onClick={() => handleAtualizarStatus(v.id, "concluida")}
                              className="mt-3 w-full text-sm py-2 bg-[#3B82F6] text-white rounded font-medium hover:bg-[#2563EB] transition-colors"
                            >
                              Concluir corrida
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Viagens realizadas */}
              <div>
                <h2 className="text-[#A0A0A0] text-xs uppercase tracking-widest font-semibold mb-3">Viagens realizadas</h2>
                {loading ? (
                  <p className="text-[#A0A0A0] text-sm animate-pulse text-center py-8">Carregando...</p>
                ) : feitas.length === 0 ? (
                  <div className="bg-[#2B2B2B] border border-[#444] rounded-xl p-8 text-center">
                    <Car size={32} className="text-[#444] mx-auto mb-3" />
                    <p className="text-[#A0A0A0] text-sm">Nenhuma viagem realizada ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {feitas.map((v) => {
                      const s = statusConfig[v.status];
                      const d = new Date(v.data_hora);
                      return (
                        <div key={v.id} className="bg-[#2B2B2B] border border-[#444] rounded-xl px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[#444] text-xs font-mono">#{v.id.slice(0, 8).toUpperCase()}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: s.cor, backgroundColor: s.bg }}>{s.label}</span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[#A0A0A0] text-sm"><Navigation size={12} /><span>{v.origem}</span></div>
                            <div className="flex items-center gap-2 text-[#F0F0F0] text-sm"><MapPin size={12} className="text-[#CC0000]" /><span>{v.destino}</span></div>
                            {v.observacoes && (
                              <p className="text-xs text-[#A0A0A0] italic border-l-2 border-[#444] pl-2">{v.observacoes}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#333]">
                            <div className="flex items-center gap-3 text-[#A0A0A0] text-xs">
                              <span className="flex items-center gap-1"><Clock size={11} />{d.toLocaleDateString("pt-BR")}</span>
                              <span>{d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <span className="text-[#F0F0F0] text-sm font-semibold">{formatValor(v.valor)}</span>
                          </div>
                          {v.cliente && (
                            <p className="text-[#A0A0A0] text-xs mt-2">Cliente: <span className="text-[#F0F0F0]">{v.cliente.nome}</span></p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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

              <div className="grid grid-cols-7 gap-2">
                {semana.map((dia, i) => {
                  const count = viagens.filter((v) => isSameDay(v.data_hora, dia)).length;
                  const isHoje = isSameDay(dia.toISOString(), hoje);
                  return (
                    <button
                      key={i}
                      onClick={() => setDiaSelecionado(i)}
                      className={`rounded-xl p-3 text-center transition-colors ${diaSelecionado === i ? "bg-[#CC0000] text-white" : isHoje ? "bg-[#2B2B2B] border-2 border-[#CC0000]/50 text-[#F0F0F0]" : "bg-[#2B2B2B] border border-[#444] text-[#A0A0A0] hover:border-[#CC0000]"}`}
                    >
                      <p className="text-xs font-medium">{DIAS_SEMANA[i]}</p>
                      <p className="text-lg font-bold mt-0.5">{dia.getDate()}</p>
                      {count > 0 && (
                        <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${diaSelecionado === i ? "bg-white" : "bg-[#CC0000]"}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="px-6 py-4 border-b border-[#444]">
                  {(() => {
                    const diaRef = semana[diaSelecionado];
                    const viagensDia = viagens.filter((v) => isSameDay(v.data_hora, diaRef));
                    return (
                      <h2 className="text-[#F0F0F0] font-semibold">
                        {DIAS_SEMANA[diaSelecionado]}, {diaRef.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                        <span className="text-[#A0A0A0] text-sm font-normal ml-2">— {viagensDia.length} viagem(ns)</span>
                      </h2>
                    );
                  })()}
                </div>
                {(() => {
                  const diaRef = semana[diaSelecionado];
                  const viagensDia = viagens.filter((v) => isSameDay(v.data_hora, diaRef));
                  if (loading) return <p className="p-8 text-center text-[#A0A0A0] text-sm animate-pulse">Carregando...</p>;
                  if (viagensDia.length === 0) return (
                    <div className="p-12 text-center">
                      <CalendarDays size={36} className="text-[#444] mx-auto mb-3" />
                      <p className="text-[#A0A0A0] text-sm">Nenhuma viagem neste dia.</p>
                    </div>
                  );
                  return (
                    <div className="divide-y divide-[#333]">
                      {viagensDia.map((v) => {
                        const s = statusConfig[v.status];
                        return (
                          <div key={v.id} className="px-6 py-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock size={14} className="text-[#CC0000]" />
                                  <span className="text-[#CC0000] font-bold">{formatHora(v.data_hora)}</span>
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: s.cor, backgroundColor: s.bg }}>{s.label}</span>
                                  <span className="text-[#444] text-xs font-mono ml-auto">#{v.id.slice(0, 8).toUpperCase()}</span>
                                </div>
                                <p className="text-[#F0F0F0] font-medium">{v.cliente?.nome ?? "Cliente"}</p>
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center gap-2 text-[#A0A0A0] text-sm"><Navigation size={12} /><span>{v.origem}</span></div>
                                  <div className="flex items-center gap-2 text-sm"><MapPin size={12} className="text-[#CC0000]" /><span className="text-[#F0F0F0]">{v.destino}</span></div>
                                  {v.observacoes && (
                                    <p className="text-xs text-[#A0A0A0] italic border-l-2 border-[#444] pl-2 mt-1">{v.observacoes}</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-[#F0F0F0] font-bold">{formatValor(v.valor)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
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

              {loading ? (
                <p className="text-[#A0A0A0] text-sm animate-pulse text-center py-12">Carregando...</p>
              ) : pendentes.length === 0 ? (
                <div className="bg-[#2B2B2B] border border-[#444] rounded-xl p-12 text-center">
                  <Bell size={36} className="text-[#444] mx-auto mb-3" />
                  <p className="text-[#F0F0F0] font-medium">Nenhuma solicitação pendente</p>
                  <p className="text-[#A0A0A0] text-sm mt-1">Novas solicitações de viagem aparecerão aqui.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendentes.map((v) => (
                    <div key={v.id} className="bg-[#2B2B2B] border border-[#CC0000]/30 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] overflow-hidden">
                      <div className="px-5 py-3 bg-[#CC0000]/5 border-b border-[#CC0000]/20 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Bell size={14} className="text-[#CC0000]" />
                          <span className="text-[#CC0000] text-xs font-semibold uppercase tracking-wider">Nova solicitação de viagem para você</span>
                        </div>
                        <span className="text-[#444] text-xs font-mono">#{v.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-[#F0F0F0] font-bold text-sm flex-shrink-0">
                            {(v.cliente?.nome ?? "C").split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <p className="text-[#F0F0F0] font-semibold">{v.cliente?.nome ?? "Cliente"}</p>
                            <p className="text-[#A0A0A0] text-xs">{formatHora(v.data_hora)} — {formatValor(v.valor)}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[#A0A0A0] text-sm"><Navigation size={14} /><span>{v.origem}</span></div>
                          <div className="pl-[3px]"><ChevronDown size={12} className="text-[#555]" /></div>
                          <div className="flex items-center gap-2 text-[#F0F0F0] text-sm"><MapPin size={14} className="text-[#CC0000]" /><span>{v.destino}</span></div>
                          {v.observacoes && (
                            <p className="text-xs text-[#A0A0A0] italic border-l-2 border-[#CC0000]/40 pl-2 mt-1">{v.observacoes}</p>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAtualizarStatus(v.id, "confirmada")}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#22C55E] text-white py-2.5 rounded hover:bg-[#16A34A] transition-colors text-sm font-medium"
                          >
                            <CheckCircle size={16} />Aceitar
                          </button>
                          <button
                            onClick={() => handleAtualizarStatus(v.id, "pendente")}
                            className="flex-1 flex items-center justify-center gap-2 border border-[#444] text-[#A0A0A0] py-2.5 rounded hover:border-[#EF4444] hover:text-[#EF4444] transition-colors text-sm"
                          >
                            <XCircle size={16} />Recusar
                          </button>
                        </div>
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
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Desempenho</p>
                  <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>Métricas</h1>
                </div>
                <select
                  value={periodoMetricas}
                  onChange={(e) => setPeriodoMetricas(e.target.value as typeof periodoMetricas)}
                  className="bg-[#2B2B2B] border border-[#444] text-[#A0A0A0] text-xs rounded px-2 py-1.5 focus:outline-none focus:border-[#CC0000] mb-1"
                >
                  <option value="dia">Hoje</option>
                  <option value="semana">Esta semana</option>
                  <option value="mes">Este mês</option>
                  <option value="ano">Este ano</option>
                  <option value="all">Desde sempre</option>
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Card: Avaliação média */}
                <div className="bg-[#2B2B2B] border border-[#444] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#A0A0A0] text-xs">Avaliação média</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F59E0B22]">
                      <Star size={15} className="text-[#F59E0B]" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#F0F0F0]">{loading ? "—" : (avaliacaoMedia !== null ? avaliacaoMedia.toFixed(1) : "—")}</p>
                  <p className="text-xs text-[#A0A0A0] mt-1">por clientes</p>
                </div>

                {/* Card: Viagens concluídas */}
                <div className="bg-[#2B2B2B] border border-[#444] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#A0A0A0] text-xs">Viagens concluídas</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#CC000022]">
                      <Car size={15} className="text-[#CC0000]" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#F0F0F0]">{loading ? "—" : viagensPeriodo.length}</p>
                  <p className="text-xs text-[#A0A0A0] mt-1">{labelPeriodo[periodoMetricas]}</p>
                </div>

                {/* Card: Faturamento */}
                <div className="bg-[#2B2B2B] border border-[#444] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#A0A0A0] text-xs">Faturamento</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#22C55E22]">
                      <TrendingUp size={15} className="text-[#22C55E]" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#F0F0F0]">{loading ? "—" : faturamentoPeriodo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                  <p className="text-xs text-[#A0A0A0] mt-1">{labelPeriodo[periodoMetricas]}</p>
                </div>
              </div>

              {/* Avaliações recentes */}
              <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="px-6 py-4 border-b border-[#444]">
                  <h2 className="text-[#F0F0F0] font-semibold">Avaliações recentes</h2>
                </div>
                {loading ? (
                  <p className="px-6 py-8 text-center text-[#A0A0A0] text-sm animate-pulse">Carregando...</p>
                ) : avaliacoes.length === 0 ? (
                  <div className="p-12 text-center">
                    <Star size={36} className="text-[#444] mx-auto mb-3" />
                    <p className="text-[#A0A0A0] text-sm">Nenhuma avaliação ainda.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#333]">
                    {avaliacoes.map((a, i) => (
                      <div key={i} className="px-6 py-4 flex items-start gap-4">
                        <div className="w-9 h-9 rounded-full bg-[#333] flex items-center justify-center text-[#F0F0F0] text-xs font-bold flex-shrink-0">
                          {(a.avaliador?.nome ?? "C").split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-[#F0F0F0] text-sm font-medium">{a.avaliador?.nome ?? "Cliente"}</p>
                            <span className="text-[#A0A0A0] text-xs">{new Date(a.created_at).toLocaleDateString("pt-BR")}</span>
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
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
