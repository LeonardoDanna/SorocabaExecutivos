"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "../components/Logo";
import {
  LayoutDashboard,
  Car,
  Users,
  Bell,
  BarChart2,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Navigation,
  Star,
  ChevronRight,
  Menu,
  DollarSign,
  CalendarDays,
} from "lucide-react";

// --- Dados mockados ---

const kpis = [
  { label: "Viagens ativas", valor: "7", icon: Car, cor: "#CC0000", delta: "+2 hoje" },
  { label: "Motoristas disponíveis", valor: "4", icon: Users, cor: "#22C55E", delta: "de 6 no total" },
  { label: "Faturamento do mês", valor: "R$ 12.450", icon: TrendingUp, cor: "#3B82F6", delta: "+18% vs mês ant." },
  { label: "Satisfação média", valor: "4,8", icon: Star, cor: "#F59E0B", delta: "★ últimas 30 viagens" },
];

type StatusViagem = "pendente" | "confirmada" | "em_rota" | "concluida" | "cancelada";

const viagens: {
  id: string;
  cliente: string;
  origem: string;
  destino: string;
  data_hora: string;
  status: StatusViagem;
  motorista: string | null;
  valor: string;
}[] = [
  { id: "001", cliente: "Ana Paula Souza", origem: "Sorocaba Centro", destino: "Aeroporto de Guarulhos (GRU)", data_hora: "24/03 • 06:00", status: "pendente", motorista: null, valor: "R$ 400,00" },
  { id: "002", cliente: "Roberto Meireles", origem: "Votorantim", destino: "Aeroporto de Congonhas (CGH)", data_hora: "24/03 • 08:30", status: "confirmada", motorista: "Carlos Silva", valor: "R$ 350,00" },
  { id: "003", cliente: "Fernanda Lima", origem: "Sorocaba Sul", destino: "Aeroporto de Viracopos (VCP)", data_hora: "24/03 • 10:00", status: "em_rota", motorista: "Marcos Oliveira", valor: "R$ 300,00" },
  { id: "004", cliente: "Thiago Ramos", origem: "Itu", destino: "Sorocaba Centro", data_hora: "24/03 • 12:15", status: "pendente", motorista: null, valor: "R$ 120,00" },
  { id: "005", cliente: "Juliana Castro", origem: "Sorocaba Leste", destino: "Sorocaba Oeste", data_hora: "23/03 • 19:00", status: "concluida", motorista: "João Pereira", valor: "R$ 80,00" },
  { id: "006", cliente: "Diego Martins", origem: "Sorocaba Norte", destino: "Votorantim", data_hora: "23/03 • 15:30", status: "cancelada", motorista: null, valor: "R$ 80,00" },
];

type StatusMotorista = "disponivel" | "em_rota" | "em_intervalo" | "offline";

const motoristas: {
  id: string;
  nome: string;
  veiculo: string;
  status: StatusMotorista;
  avaliacao: number;
  viagens_hoje: number;
}[] = [
  { id: "M1", nome: "Carlos Silva", veiculo: "Toyota Corolla • ABC-1234", status: "em_rota", avaliacao: 4.9, viagens_hoje: 3 },
  { id: "M2", nome: "Marcos Oliveira", veiculo: "Honda Civic • DEF-5678", status: "em_rota", avaliacao: 4.7, viagens_hoje: 2 },
  { id: "M3", nome: "João Pereira", veiculo: "Hyundai Sonata • GHI-9012", status: "disponivel", avaliacao: 4.8, viagens_hoje: 4 },
  { id: "M4", nome: "Ricardo Santos", veiculo: "Toyota Corolla • JKL-3456", status: "disponivel", avaliacao: 4.6, viagens_hoje: 1 },
  { id: "M5", nome: "Anderson Costa", veiculo: "Van Sprinter • MNO-7890", status: "em_intervalo", avaliacao: 4.5, viagens_hoje: 2 },
  { id: "M6", nome: "Felipe Alves", veiculo: "Honda Civic • PQR-1234", status: "offline", avaliacao: 4.9, viagens_hoje: 0 },
];

const alertas = [
  { id: 1, tipo: "atencao", mensagem: "2 viagens pendentes sem motorista atribuído", hora: "agora" },
  { id: 2, tipo: "info", mensagem: "Motorista Felipe Alves ficou offline há 2 horas", hora: "14:32" },
  { id: 3, tipo: "sucesso", mensagem: "Viagem #005 concluída com avaliação 5 estrelas", hora: "13:10" },
  { id: 4, tipo: "atencao", mensagem: "Pico de demanda previsto amanhã entre 06h e 10h", hora: "12:00" },
  { id: 5, tipo: "erro", mensagem: "Falha no envio de WhatsApp para viagem #004", hora: "11:45" },
];

// --- Helpers de estilo ---

const statusViagem: Record<StatusViagem, { label: string; cor: string; bg: string }> = {
  pendente:   { label: "Pendente",   cor: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  confirmada: { label: "Confirmada", cor: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  em_rota:    { label: "Em rota",    cor: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  concluida:  { label: "Concluída",  cor: "#A0A0A0", bg: "rgba(160,160,160,0.1)" },
  cancelada:  { label: "Cancelada",  cor: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

const statusMotorista: Record<StatusMotorista, { label: string; cor: string }> = {
  disponivel:   { label: "Disponível",   cor: "#22C55E" },
  em_rota:      { label: "Em rota",      cor: "#3B82F6" },
  em_intervalo: { label: "Em intervalo", cor: "#F59E0B" },
  offline:      { label: "Offline",      cor: "#A0A0A0" },
};

const alertaIcone = {
  atencao: <AlertTriangle size={16} className="text-[#F59E0B]" />,
  info:    <Bell size={16} className="text-[#3B82F6]" />,
  sucesso: <CheckCircle size={16} className="text-[#22C55E]" />,
  erro:    <XCircle size={16} className="text-[#EF4444]" />,
};

// --- Componente principal ---

type Aba = "dashboard" | "viagens" | "motoristas" | "alertas" | "relatorios";

export default function PainelPage() {
  const [abaAtiva, setAbaAtiva] = useState<Aba>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState<string>("");

  const pendentes = viagens.filter((v) => v.status === "pendente");

  const navItems: { id: Aba; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "dashboard",  label: "Dashboard",  icon: LayoutDashboard },
    { id: "viagens",    label: "Viagens",    icon: Car,      badge: pendentes.length },
    { id: "motoristas", label: "Motoristas", icon: Users },
    { id: "alertas",    label: "Alertas",    icon: Bell,     badge: alertas.filter(a => a.tipo === "atencao" || a.tipo === "erro").length },
    { id: "relatorios", label: "Relatórios", icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-[#151515] border-r border-[#333] z-30 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-[#333]">
          <Link href="/" onClick={() => setSidebarOpen(false)}>
            <Logo size="sm" />
          </Link>
          <p className="text-[#A0A0A0] text-xs mt-2 uppercase tracking-wider">Painel Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const ativa = abaAtiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setAbaAtiva(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${
                  ativa
                    ? "bg-[#CC0000] text-white"
                    : "text-[#A0A0A0] hover:bg-[#2B2B2B] hover:text-[#F0F0F0]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </span>
                {item.badge ? (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${ativa ? "bg-white/20 text-white" : "bg-[#CC0000] text-white"}`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#333]">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-[#A0A0A0] hover:text-[#EF4444] text-sm rounded-lg hover:bg-[#2B2B2B] transition-colors">
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <header className="md:hidden flex items-center justify-between px-4 py-4 border-b border-[#333] bg-[#151515]">
          <button onClick={() => setSidebarOpen(true)} className="text-[#A0A0A0]">
            <Menu size={24} />
          </button>
          <span className="text-[#F0F0F0] text-sm font-semibold uppercase tracking-wider">
            {navItems.find((n) => n.id === abaAtiva)?.label}
          </span>
          <div className="w-6" />
        </header>

        <div className="flex-1 p-6 overflow-auto">

          {/* ── Dashboard ── */}
          {abaAtiva === "dashboard" && (
            <div className="space-y-6">
              <div>
                <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Visão geral</p>
                <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
                  Dashboard
                </h1>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {kpis.map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={kpi.label} className="bg-[#2B2B2B] border border-[#444] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[#A0A0A0] text-sm">{kpi.label}</span>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.cor + "22" }}>
                          <Icon size={18} style={{ color: kpi.cor }} />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-[#F0F0F0]">{kpi.valor}</p>
                      <p className="text-xs text-[#A0A0A0] mt-1">{kpi.delta}</p>
                    </div>
                  );
                })}
              </div>

              {/* Últimas viagens */}
              <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#444]">
                  <h2 className="text-[#F0F0F0] font-semibold">Viagens recentes</h2>
                  <button onClick={() => setAbaAtiva("viagens")} className="text-[#CC0000] text-sm flex items-center gap-1 hover:text-[#E50000]">
                    Ver todas <ChevronRight size={14} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#333]">
                        {["Cliente", "Destino", "Data/Hora", "Status", "Valor"].map((col) => (
                          <th key={col} className="text-left px-6 py-3 text-xs text-[#A0A0A0] uppercase tracking-wider font-medium">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {viagens.slice(0, 4).map((v) => {
                        const s = statusViagem[v.status];
                        return (
                          <tr key={v.id} className="border-b border-[#333] hover:bg-[#333] transition-colors">
                            <td className="px-6 py-4 text-[#F0F0F0] text-sm">{v.cliente}</td>
                            <td className="px-6 py-4 text-[#A0A0A0] text-sm max-w-[200px] truncate">{v.destino}</td>
                            <td className="px-6 py-4 text-[#A0A0A0] text-sm whitespace-nowrap">{v.data_hora}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ color: s.cor, backgroundColor: s.bg }}>
                                {s.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-[#F0F0F0] text-sm font-medium">{v.valor}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Motoristas online */}
              <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#444]">
                  <h2 className="text-[#F0F0F0] font-semibold">Status da frota</h2>
                  <button onClick={() => setAbaAtiva("motoristas")} className="text-[#CC0000] text-sm flex items-center gap-1 hover:text-[#E50000]">
                    Gerenciar <ChevronRight size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {motoristas.map((m) => {
                    const s = statusMotorista[m.status];
                    return (
                      <div key={m.id} className="flex items-center gap-3 bg-[#1E1E1E] rounded-lg p-4 border border-[#333]">
                        <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-[#F0F0F0] font-bold text-sm flex-shrink-0">
                          {m.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#F0F0F0] text-sm font-medium truncate">{m.nome}</p>
                          <p className="text-xs font-medium" style={{ color: s.cor }}>{s.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Viagens ── */}
          {abaAtiva === "viagens" && (
            <div className="space-y-6">
              <div>
                <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Operações</p>
                <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
                  Fila de Viagens
                </h1>
              </div>

              {/* Pendentes em destaque */}
              {pendentes.length > 0 && (
                <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle size={20} className="text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#F0F0F0] text-sm font-medium">{pendentes.length} viagem(ns) pendente(s) sem motorista</p>
                    <p className="text-[#A0A0A0] text-xs mt-0.5">Atribua um motorista para confirmar as viagens abaixo.</p>
                  </div>
                </div>
              )}

              <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#444]">
                        {["#", "Cliente", "Trajeto", "Data/Hora", "Motorista", "Valor", "Status", ""].map((col) => (
                          <th key={col} className="text-left px-5 py-3 text-xs text-[#A0A0A0] uppercase tracking-wider font-medium whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {viagens.map((v) => {
                        const s = statusViagem[v.status];
                        return (
                          <tr key={v.id} className="border-b border-[#333] hover:bg-[#333] transition-colors">
                            <td className="px-5 py-4 text-[#A0A0A0] text-xs font-mono">#{v.id}</td>
                            <td className="px-5 py-4 text-[#F0F0F0] text-sm font-medium whitespace-nowrap">{v.cliente}</td>
                            <td className="px-5 py-4 text-sm">
                              <div className="flex items-center gap-1 text-[#A0A0A0]">
                                <Navigation size={12} className="flex-shrink-0" />
                                <span className="truncate max-w-[120px]">{v.origem}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[#F0F0F0] mt-0.5">
                                <MapPin size={12} className="flex-shrink-0 text-[#CC0000]" />
                                <span className="truncate max-w-[120px]">{v.destino}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-[#A0A0A0] text-sm whitespace-nowrap">{v.data_hora}</td>
                            <td className="px-5 py-4 text-sm">
                              {v.motorista ? (
                                <span className="text-[#F0F0F0]">{v.motorista}</span>
                              ) : v.status === "pendente" ? (
                                <select
                                  value={motoristaSelecionado}
                                  onChange={(e) => setMotoristaSelecionado(e.target.value)}
                                  className="bg-[#1E1E1E] border border-[#444] text-[#A0A0A0] text-xs rounded px-2 py-1.5 focus:outline-none focus:border-[#CC0000] min-w-[130px]"
                                >
                                  <option value="">Atribuir...</option>
                                  {motoristas.filter(m => m.status === "disponivel").map((m) => (
                                    <option key={m.id} value={m.id}>{m.nome}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-[#A0A0A0] text-xs">—</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-[#F0F0F0] text-sm font-medium whitespace-nowrap">{v.valor}</td>
                            <td className="px-5 py-4">
                              <span className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap" style={{ color: s.cor, backgroundColor: s.bg }}>
                                {s.label}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              {v.status === "pendente" && (
                                <button className="text-xs bg-[#CC0000] text-white px-3 py-1.5 rounded hover:bg-[#E50000] transition-colors whitespace-nowrap">
                                  Confirmar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Motoristas ── */}
          {abaAtiva === "motoristas" && (
            <div className="space-y-6">
              <div>
                <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Equipe</p>
                <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
                  Gestão de Motoristas
                </h1>
              </div>

              {/* Resumo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["disponivel", "em_rota", "em_intervalo", "offline"] as StatusMotorista[]).map((st) => {
                  const s = statusMotorista[st];
                  const count = motoristas.filter((m) => m.status === st).length;
                  return (
                    <div key={st} className="bg-[#2B2B2B] border border-[#444] rounded-xl p-4 text-center">
                      <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: s.cor }} />
                      <p className="text-2xl font-bold text-[#F0F0F0]">{count}</p>
                      <p className="text-xs text-[#A0A0A0] mt-0.5">{s.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Lista */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {motoristas.map((m) => {
                  const s = statusMotorista[m.status];
                  return (
                    <div key={m.id} className="bg-[#2B2B2B] border border-[#444] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center text-[#F0F0F0] font-bold flex-shrink-0">
                            {m.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <p className="text-[#F0F0F0] font-semibold">{m.nome}</p>
                            <p className="text-[#A0A0A0] text-xs mt-0.5">{m.veiculo}</p>
                          </div>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5" style={{ color: s.cor, backgroundColor: s.cor + "22" }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.cor }} />
                          {s.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#333]">
                        <div className="text-center">
                          <p className="text-[#F0F0F0] font-bold">{m.avaliacao.toFixed(1)}</p>
                          <p className="text-[#A0A0A0] text-xs">Avaliação</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#F0F0F0] font-bold">{m.viagens_hoje}</p>
                          <p className="text-[#A0A0A0] text-xs">Viagens hoje</p>
                        </div>
                        <div className="ml-auto">
                          <button className="text-xs border border-[#444] text-[#A0A0A0] px-3 py-1.5 rounded hover:border-[#CC0000] hover:text-[#F0F0F0] transition-colors">
                            Ver detalhes
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Relatórios ── */}
          {abaAtiva === "relatorios" && (
            <div className="space-y-6">
              <div>
                <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Gerencial</p>
                <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
                  Relatórios
                </h1>
              </div>

              {/* KPIs financeiros */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Faturamento do mês",   valor: "R$ 12.450",  sub: "+18% vs mês anterior",  icon: DollarSign,  cor: "#22C55E" },
                  { label: "Viagens concluídas",   valor: "41",          sub: "de 47 solicitadas",      icon: Car,         cor: "#3B82F6" },
                  { label: "Ticket médio",         valor: "R$ 303,66",  sub: "por viagem",             icon: TrendingUp,  cor: "#F59E0B" },
                ].map((k) => {
                  const Icon = k.icon;
                  return (
                    <div key={k.label} className="bg-[#2B2B2B] border border-[#444] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[#A0A0A0] text-sm">{k.label}</span>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: k.cor + "22" }}>
                          <Icon size={18} style={{ color: k.cor }} />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-[#F0F0F0]">{k.valor}</p>
                      <p className="text-xs text-[#A0A0A0] mt-1">{k.sub}</p>
                    </div>
                  );
                })}
              </div>

              {/* Faturamento mensal */}
              <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="px-6 py-4 border-b border-[#444] flex items-center gap-2">
                  <CalendarDays size={16} className="text-[#CC0000]" />
                  <h2 className="text-[#F0F0F0] font-semibold">Faturamento mensal</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {[
                      { mes: "Março 2026",    valor: 12450, max: 15000 },
                      { mes: "Fevereiro 2026",valor: 10560, max: 15000 },
                      { mes: "Janeiro 2026",  valor: 11200, max: 15000 },
                      { mes: "Dezembro 2025", valor: 13800, max: 15000 },
                      { mes: "Novembro 2025", valor: 9400,  max: 15000 },
                    ].map((m) => (
                      <div key={m.mes} className="flex items-center gap-4">
                        <span className="text-[#A0A0A0] text-sm w-36 flex-shrink-0">{m.mes}</span>
                        <div className="flex-1 bg-[#1E1E1E] rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full bg-[#CC0000] rounded-full transition-all"
                            style={{ width: `${(m.valor / m.max) * 100}%` }}
                          />
                        </div>
                        <span className="text-[#F0F0F0] text-sm font-medium w-28 text-right flex-shrink-0">
                          R$ {m.valor.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabela por motorista */}
              <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="px-6 py-4 border-b border-[#444]">
                  <h2 className="text-[#F0F0F0] font-semibold">Desempenho por motorista — março</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#333]">
                        {["Motorista", "Viagens", "Faturamento", "Avaliação", "Taxa aceite"].map((col) => (
                          <th key={col} className="text-left px-6 py-3 text-xs text-[#A0A0A0] uppercase tracking-wider font-medium whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { nome: "Carlos Silva",    viagens: 14, faturamento: "R$ 4.850", avaliacao: 4.9, aceite: "98%" },
                        { nome: "Marcos Oliveira", viagens: 11, faturamento: "R$ 3.650", avaliacao: 4.7, aceite: "95%" },
                        { nome: "João Pereira",    viagens: 10, faturamento: "R$ 2.980", avaliacao: 4.8, aceite: "96%" },
                        { nome: "Ricardo Santos",  viagens: 6,  faturamento: "R$ 970",   avaliacao: 4.6, aceite: "94%" },
                      ].map((m) => (
                        <tr key={m.nome} className="border-b border-[#333] hover:bg-[#333] transition-colors">
                          <td className="px-6 py-4 text-[#F0F0F0] text-sm font-medium">{m.nome}</td>
                          <td className="px-6 py-4 text-[#A0A0A0] text-sm">{m.viagens}</td>
                          <td className="px-6 py-4 text-[#F0F0F0] text-sm font-medium">{m.faturamento}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Star size={13} className="text-[#F59E0B] fill-[#F59E0B]" />
                              <span className="text-[#F0F0F0]">{m.avaliacao}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#A0A0A0] text-sm">{m.aceite}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Alertas ── */}
          {abaAtiva === "alertas" && (
            <div className="space-y-6">
              <div>
                <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Sistema</p>
                <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
                  Alertas
                </h1>
              </div>

              <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] divide-y divide-[#333]">
                {alertas.map((a) => (
                  <div key={a.id} className="flex items-start gap-4 px-6 py-4 hover:bg-[#333] transition-colors">
                    <div className="mt-0.5 flex-shrink-0">{alertaIcone[a.tipo as keyof typeof alertaIcone]}</div>
                    <p className="text-[#F0F0F0] text-sm flex-1">{a.mensagem}</p>
                    <span className="text-[#A0A0A0] text-xs whitespace-nowrap flex items-center gap-1">
                      <Clock size={11} />
                      {a.hora}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
