"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Logo from "../components/Logo";
import {
  LayoutDashboard, Car, Users, Bell, BarChart2, LogOut,
  TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle,
  MapPin, Navigation, Star, ChevronRight, Menu, DollarSign,
  CalendarDays, Plus, X, Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { criarViagem, criarMotorista } from "@/app/actions/admin";
import { logout } from "@/app/actions/auth";

// ── Tipos ──────────────────────────────────────────────────

type StatusViagem = "pendente" | "confirmada" | "em_rota" | "concluida" | "cancelada";

type ViagemDB = {
  id: string;
  numero: number;
  origem: string;
  destino: string;
  data_hora: string;
  status: StatusViagem;
  valor: number | null;
  cliente_id: string;
  motorista_id: string | null;
  cliente: { nome: string } | null;
  motorista: { nome: string } | null;
};

type PerfilDB = {
  id: string;
  nome: string;
  telefone: string | null;
  perfil: string;
  ativo: boolean;
  created_at: string;
};

// ── Configs de estilo ──────────────────────────────────────

const statusViagem: Record<StatusViagem, { label: string; cor: string; bg: string }> = {
  pendente:   { label: "Pendente",   cor: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  confirmada: { label: "Confirmada", cor: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  em_rota:    { label: "Em rota",    cor: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  concluida:  { label: "Concluída",  cor: "#A0A0A0", bg: "rgba(160,160,160,0.1)" },
  cancelada:  { label: "Cancelada",  cor: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

// ── Modal base ─────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#444]">
          <h2 className="text-[#F0F0F0] font-semibold">{title}</h2>
          <button onClick={onClose} className="text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Modal Nova Viagem ──────────────────────────────────────

function NovaViagemModal({
  clientes,
  motoristas,
  onClose,
  onSuccess,
}: {
  clientes: PerfilDB[];
  motoristas: PerfilDB[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await criarViagem(formData);
      if (result?.erro) { setErro(result.erro); return; }
      onSuccess();
      onClose();
    });
  }

  const inputCls = "w-full bg-[#1E1E1E] border border-[#444] text-[#F0F0F0] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] transition-colors";
  const labelCls = "block text-[#A0A0A0] text-xs uppercase tracking-wider mb-1.5";

  return (
    <Modal title="Nova Viagem" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {erro && (
          <p className="text-[#EF4444] text-sm bg-[#EF4444]/10 border border-[#EF4444]/30 rounded px-3 py-2">{erro}</p>
        )}

        <div>
          <label className={labelCls}>Cliente *</label>
          <select name="cliente_id" required className={inputCls}>
            <option value="">Selecione...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Motorista (opcional)</label>
          <select name="motorista_id" className={inputCls}>
            <option value="">Sem motorista (pendente)</option>
            {motoristas.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Origem *</label>
          <input name="origem" required placeholder="Ex: Sorocaba Centro" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Destino *</label>
          <input name="destino" required placeholder="Ex: Aeroporto de Guarulhos (GRU)" className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Data *</label>
            <input name="data" type="date" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Hora *</label>
            <input name="hora" type="time" required className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Valor (R$)</label>
          <input name="valor" placeholder="Ex: 400,00" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Observações</label>
          <textarea name="observacoes" rows={2} placeholder="Informações adicionais..." className={inputCls + " resize-none"} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-[#444] text-[#A0A0A0] py-2.5 rounded text-sm hover:border-[#CC0000] transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-[#CC0000] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#E50000] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? <><Loader2 size={14} className="animate-spin" /> Criando...</> : "Criar Viagem"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Modal Novo Motorista ───────────────────────────────────

function NovoMotoristaModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await criarMotorista(formData);
      if (result?.erro) { setErro(result.erro); return; }
      onSuccess();
      onClose();
    });
  }

  const inputCls = "w-full bg-[#1E1E1E] border border-[#444] text-[#F0F0F0] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] transition-colors";
  const labelCls = "block text-[#A0A0A0] text-xs uppercase tracking-wider mb-1.5";

  return (
    <Modal title="Novo Motorista" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {erro && (
          <p className="text-[#EF4444] text-sm bg-[#EF4444]/10 border border-[#EF4444]/30 rounded px-3 py-2">{erro}</p>
        )}

        <div>
          <label className={labelCls}>Nome completo *</label>
          <input name="nome" required placeholder="Ex: Carlos Silva" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>E-mail *</label>
          <input name="email" type="email" required placeholder="motorista@email.com" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Telefone (WhatsApp)</label>
          <input name="telefone" placeholder="(15) 99999-9999" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Senha temporária *</label>
          <input name="senha" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" className={inputCls} />
          <p className="text-[#A0A0A0] text-xs mt-1">O motorista pode alterar a senha após o primeiro acesso.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-[#444] text-[#A0A0A0] py-2.5 rounded text-sm hover:border-[#CC0000] transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-[#CC0000] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#E50000] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? <><Loader2 size={14} className="animate-spin" /> Criando...</> : "Criar Motorista"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Componente principal ───────────────────────────────────

type Aba = "dashboard" | "viagens" | "motoristas" | "alertas" | "relatorios";

export default function PainelPage() {
  const [abaAtiva, setAbaAtiva] = useState<Aba>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [viagens, setViagens] = useState<ViagemDB[]>([]);
  const [motoristas, setMotoristas] = useState<PerfilDB[]>([]);
  const [clientes, setClientes] = useState<PerfilDB[]>([]);
  const [loading, setLoading] = useState(true);

  const [novaViagemOpen, setNovaViagemOpen] = useState(false);
  const [novoMotoristaOpen, setNovoMotoristaOpen] = useState(false);
  const [motoristasSelecionados, setMotoristasSelecionados] = useState<Record<string, string>>({});

  async function loadData() {
    const supabase = createClient();

    const [viagensRes, motoristasRes, clientesRes] = await Promise.all([
      supabase
        .from("viagens")
        .select("*, cliente:perfis!cliente_id(nome), motorista:perfis!motorista_id(nome)")
        .order("data_hora", { ascending: false }),
      supabase
        .from("perfis")
        .select("*")
        .eq("perfil", "motorista")
        .eq("ativo", true)
        .order("nome"),
      supabase
        .from("perfis")
        .select("*")
        .eq("perfil", "cliente")
        .order("nome"),
    ]);

    setViagens((viagensRes.data as ViagemDB[]) ?? []);
    setMotoristas(motoristasRes.data ?? []);
    setClientes(clientesRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleMudarStatus(viagemId: string, novoStatus: StatusViagem) {
    const supabase = createClient();
    await supabase.from("viagens").update({ status: novoStatus }).eq("id", viagemId);
    await loadData();
  }

  async function handleAtribuir(viagemId: string) {
    const motoristaId = motoristasSelecionados[viagemId];
    if (!motoristaId) return;
    const supabase = createClient();
    await supabase
      .from("viagens")
      .update({ motorista_id: motoristaId, status: "confirmada" })
      .eq("id", viagemId);
    await loadData();
  }

  const pendentes = viagens.filter((v) => v.status === "pendente");

  const navItems: { id: Aba; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "dashboard",  label: "Dashboard",  icon: LayoutDashboard },
    { id: "viagens",    label: "Viagens",    icon: Car,      badge: pendentes.length || undefined },
    { id: "motoristas", label: "Motoristas", icon: Users },
    { id: "alertas",    label: "Alertas",    icon: Bell },
    { id: "relatorios", label: "Relatórios", icon: BarChart2 },
  ];

  function formatDataHora(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " • " +
      d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function formatValor(v: number | null) {
    if (v === null) return "—";
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex">

      {/* Modais */}
      {novaViagemOpen && (
        <NovaViagemModal
          clientes={clientes}
          motoristas={motoristas}
          onClose={() => setNovaViagemOpen(false)}
          onSuccess={loadData}
        />
      )}
      {novoMotoristaOpen && (
        <NovoMotoristaModal
          onClose={() => setNovoMotoristaOpen(false)}
          onSuccess={loadData}
        />
      )}

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static top-0 left-0 h-full w-64 bg-[#151515] border-r border-[#333] z-30 flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
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
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${ativa ? "bg-[#CC0000] text-white" : "text-[#A0A0A0] hover:bg-[#2B2B2B] hover:text-[#F0F0F0]"}`}
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
          <form action={logout}>
            <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 text-[#A0A0A0] hover:text-[#EF4444] text-sm rounded-lg hover:bg-[#2B2B2B] transition-colors">
              <LogOut size={18} />
              Sair
            </button>
          </form>
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
                <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>Dashboard</h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: "Viagens ativas",         valor: viagens.filter(v => ["pendente","confirmada","em_rota"].includes(v.status)).length.toString(), icon: Car,        cor: "#CC0000", delta: `${pendentes.length} pendente(s)` },
                  { label: "Motoristas cadastrados",  valor: motoristas.length.toString(),                                                                  icon: Users,      cor: "#22C55E", delta: "no sistema" },
                  { label: "Viagens concluídas",      valor: viagens.filter(v => v.status === "concluida").length.toString(),                               icon: TrendingUp, cor: "#3B82F6", delta: "total" },
                  { label: "Total de clientes",       valor: clientes.length.toString(),                                                                    icon: Star,       cor: "#F59E0B", delta: "cadastrados" },
                ].map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={kpi.label} className="bg-[#2B2B2B] border border-[#444] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[#A0A0A0] text-sm">{kpi.label}</span>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.cor + "22" }}>
                          <Icon size={18} style={{ color: kpi.cor }} />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-[#F0F0F0]">{loading ? "—" : kpi.valor}</p>
                      <p className="text-xs text-[#A0A0A0] mt-1">{kpi.delta}</p>
                    </div>
                  );
                })}
              </div>

              {/* Viagens recentes */}
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
                        {["#", "Cliente", "Destino", "Data/Hora", "Status", "Valor"].map((col) => (
                          <th key={col} className="text-left px-6 py-3 text-xs text-[#A0A0A0] uppercase tracking-wider font-medium">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={6} className="px-6 py-8 text-center text-[#A0A0A0] text-sm animate-pulse">Carregando...</td></tr>
                      ) : viagens.slice(0, 5).map((v) => {
                        const s = statusViagem[v.status];
                        return (
                          <tr key={v.id} className="border-b border-[#333] hover:bg-[#333] transition-colors">
                            <td className="px-6 py-4 text-[#A0A0A0] text-xs font-mono whitespace-nowrap">#{String(v.numero).padStart(5, "0")}</td>
                            <td className="px-6 py-4 text-[#F0F0F0] text-sm">{v.cliente?.nome ?? "—"}</td>
                            <td className="px-6 py-4 text-[#A0A0A0] text-sm max-w-[200px] truncate">{v.destino}</td>
                            <td className="px-6 py-4 text-[#A0A0A0] text-sm whitespace-nowrap">{formatDataHora(v.data_hora)}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ color: s.cor, backgroundColor: s.bg }}>{s.label}</span>
                            </td>
                            <td className="px-6 py-4 text-[#F0F0F0] text-sm font-medium">{formatValor(v.valor)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Viagens ── */}
          {abaAtiva === "viagens" && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Operações</p>
                  <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>Fila de Viagens</h1>
                </div>
                <button
                  onClick={() => setNovaViagemOpen(true)}
                  className="flex items-center gap-2 bg-[#CC0000] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#E50000] transition-colors"
                >
                  <Plus size={16} />
                  Nova Viagem
                </button>
              </div>

              {pendentes.length > 0 && (
                <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle size={20} className="text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#F0F0F0] text-sm font-medium">{pendentes.length} viagem(ns) pendente(s) sem motorista</p>
                    <p className="text-[#A0A0A0] text-xs mt-0.5">Atribua um motorista para confirmar.</p>
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
                      {loading ? (
                        <tr><td colSpan={8} className="px-5 py-8 text-center text-[#A0A0A0] text-sm animate-pulse">Carregando...</td></tr>
                      ) : viagens.length === 0 ? (
                        <tr><td colSpan={8} className="px-5 py-8 text-center text-[#A0A0A0] text-sm">Nenhuma viagem cadastrada.</td></tr>
                      ) : viagens.map((v) => {
                        const s = statusViagem[v.status];
                        const proximosStatus: Partial<Record<StatusViagem, StatusViagem[]>> = {
                          pendente:   ["confirmada", "cancelada"],
                          confirmada: ["cancelada"],
                          em_rota:    ["concluida", "cancelada"],
                        };
                        const opcoes = proximosStatus[v.status] ?? [];
                        return (
                          <tr key={v.id} className="border-b border-[#333] hover:bg-[#333] transition-colors">
                            <td className="px-5 py-4 text-[#A0A0A0] text-xs font-mono whitespace-nowrap">#{String(v.numero).padStart(5, "0")}</td>
                            <td className="px-5 py-4 text-[#F0F0F0] text-sm font-medium whitespace-nowrap">{v.cliente?.nome ?? "—"}</td>
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
                            <td className="px-5 py-4 text-[#A0A0A0] text-sm whitespace-nowrap">{formatDataHora(v.data_hora)}</td>
                            <td className="px-5 py-4 text-sm">
                              {v.motorista ? (
                                <span className="text-[#F0F0F0]">{v.motorista.nome}</span>
                              ) : v.status === "pendente" ? (
                                <select
                                  value={motoristasSelecionados[v.id] ?? ""}
                                  onChange={(e) => setMotoristasSelecionados((prev) => ({ ...prev, [v.id]: e.target.value }))}
                                  className="bg-[#1E1E1E] border border-[#444] text-[#A0A0A0] text-xs rounded px-2 py-1.5 focus:outline-none focus:border-[#CC0000] min-w-[130px]"
                                >
                                  <option value="">Atribuir...</option>
                                  {motoristas.map((m) => (
                                    <option key={m.id} value={m.id}>{m.nome}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-[#A0A0A0] text-xs">—</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-[#F0F0F0] text-sm font-medium whitespace-nowrap">{formatValor(v.valor)}</td>
                            <td className="px-5 py-4">
                              <span className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap" style={{ color: s.cor, backgroundColor: s.bg }}>{s.label}</span>
                            </td>
                            <td className="px-5 py-4">
                              {v.status === "pendente" && motoristasSelecionados[v.id] ? (
                                <button
                                  onClick={() => handleAtribuir(v.id)}
                                  className="text-xs bg-[#CC0000] text-white px-3 py-1.5 rounded hover:bg-[#E50000] transition-colors whitespace-nowrap"
                                >
                                  Confirmar
                                </button>
                              ) : opcoes.length > 0 ? (
                                <select
                                  defaultValue=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleMudarStatus(v.id, e.target.value as StatusViagem);
                                      e.target.value = "";
                                    }
                                  }}
                                  className="bg-[#1E1E1E] border border-[#444] text-[#A0A0A0] text-xs rounded px-2 py-1.5 focus:outline-none focus:border-[#CC0000]"
                                >
                                  <option value="">Mudar status...</option>
                                  {opcoes.map((st) => (
                                    <option key={st} value={st}>{statusViagem[st].label}</option>
                                  ))}
                                </select>
                              ) : null}
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
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Equipe</p>
                  <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>Gestão de Motoristas</h1>
                </div>
                <button
                  onClick={() => setNovoMotoristaOpen(true)}
                  className="flex items-center gap-2 bg-[#CC0000] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#E50000] transition-colors"
                >
                  <Plus size={16} />
                  Novo Motorista
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                <div className="bg-[#2B2B2B] border border-[#444] rounded-xl p-4 text-center">
                  <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-[#22C55E]" />
                  <p className="text-2xl font-bold text-[#F0F0F0]">{motoristas.filter(m => m.ativo).length}</p>
                  <p className="text-xs text-[#A0A0A0] mt-0.5">Ativos</p>
                </div>
                <div className="bg-[#2B2B2B] border border-[#444] rounded-xl p-4 text-center">
                  <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-[#A0A0A0]" />
                  <p className="text-2xl font-bold text-[#F0F0F0]">{motoristas.filter(m => !m.ativo).length}</p>
                  <p className="text-xs text-[#A0A0A0] mt-0.5">Inativos</p>
                </div>
              </div>

              {loading ? (
                <p className="text-[#A0A0A0] text-sm animate-pulse text-center py-8">Carregando...</p>
              ) : motoristas.length === 0 ? (
                <div className="bg-[#2B2B2B] border border-[#444] rounded-xl p-12 text-center">
                  <Users size={40} className="text-[#444] mx-auto mb-4" />
                  <p className="text-[#F0F0F0] font-medium">Nenhum motorista cadastrado</p>
                  <p className="text-[#A0A0A0] text-sm mt-1">Clique em "Novo Motorista" para adicionar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {motoristas.map((m) => {
                    const iniciais = m.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                    return (
                      <div key={m.id} className="bg-[#2B2B2B] border border-[#444] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center text-[#F0F0F0] font-bold flex-shrink-0">
                              {iniciais}
                            </div>
                            <div>
                              <p className="text-[#F0F0F0] font-semibold">{m.nome}</p>
                              <p className="text-[#A0A0A0] text-xs mt-0.5">{m.telefone ?? "Sem telefone"}</p>
                            </div>
                          </div>
                          <span
                            className="text-xs px-2.5 py-1 rounded-full font-medium"
                            style={m.ativo ? { color: "#22C55E", backgroundColor: "rgba(34,197,94,0.1)" } : { color: "#A0A0A0", backgroundColor: "rgba(160,160,160,0.1)" }}
                          >
                            {m.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#333]">
                          <p className="text-[#A0A0A0] text-xs">
                            Cadastrado em {new Date(m.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Relatórios ── */}
          {abaAtiva === "relatorios" && (
            <div className="space-y-6">
              <div>
                <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Gerencial</p>
                <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>Relatórios</h1>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: "Faturamento total",
                    valor: viagens.filter(v => v.status === "concluida" && v.valor).reduce((acc, v) => acc + (v.valor ?? 0), 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                    sub: "viagens concluídas",
                    icon: DollarSign, cor: "#22C55E",
                  },
                  {
                    label: "Viagens concluídas",
                    valor: viagens.filter(v => v.status === "concluida").length.toString(),
                    sub: `de ${viagens.length} solicitadas`,
                    icon: Car, cor: "#3B82F6",
                  },
                  {
                    label: "Ticket médio",
                    valor: (() => {
                      const concluidas = viagens.filter(v => v.status === "concluida" && v.valor);
                      if (!concluidas.length) return "—";
                      const media = concluidas.reduce((acc, v) => acc + (v.valor ?? 0), 0) / concluidas.length;
                      return media.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
                    })(),
                    sub: "por viagem",
                    icon: TrendingUp, cor: "#F59E0B",
                  },
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
                      <p className="text-3xl font-bold text-[#F0F0F0]">{loading ? "—" : k.valor}</p>
                      <p className="text-xs text-[#A0A0A0] mt-1">{k.sub}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Alertas ── */}
          {abaAtiva === "alertas" && (
            <div className="space-y-6">
              <div>
                <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Sistema</p>
                <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>Alertas</h1>
              </div>
              <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] divide-y divide-[#333]">
                {pendentes.length > 0 ? (
                  pendentes.map((v) => (
                    <div key={v.id} className="flex items-start gap-4 px-6 py-4 hover:bg-[#333] transition-colors">
                      <AlertTriangle size={16} className="text-[#F59E0B] mt-0.5 flex-shrink-0" />
                      <p className="text-[#F0F0F0] text-sm flex-1">
                        Viagem pendente sem motorista: <span className="font-medium">{v.cliente?.nome ?? "Cliente"}</span> → {v.destino}
                      </p>
                      <span className="text-[#A0A0A0] text-xs whitespace-nowrap flex items-center gap-1">
                        <Clock size={11} />
                        {formatDataHora(v.data_hora)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center">
                    <CheckCircle size={32} className="text-[#22C55E] mx-auto mb-3" />
                    <p className="text-[#F0F0F0] font-medium">Nenhum alerta pendente</p>
                    <p className="text-[#A0A0A0] text-sm mt-1">Todas as viagens estão atribuídas.</p>
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
