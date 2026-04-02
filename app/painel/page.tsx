"use client";

import { useState, useEffect, useTransition, SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "../components/Logo";
import {
  LayoutDashboard, Car, Users, BarChart2, LogOut,
  TrendingUp, AlertTriangle,
  MapPin, Navigation, Star, ChevronRight, ChevronDown, Menu, DollarSign,
  Plus, X, Check, Loader2, Search, Download,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { criarViagem, criarMotorista, gerarRelatorioExcel } from "@/app/actions/admin";
import { logout } from "@/app/actions/auth";

// ── Tipos ──────────────────────────────────────────────────

type StatusViagem = "pendente" | "agendada" | "confirmada" | "em_rota" | "concluida" | "cancelada";

function formatPhone(tel: string) {
  const d = tel.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

type ViagemDB = {
  id: string;
  numero: number;
  origem: string;
  destino: string;
  paradas: string[];
  observacoes: string | null;
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
  online: boolean;
  created_at: string;
  veiculo_modelo: string | null;
  veiculo_placa: string | null;
  veiculo_cor: string | null;
};

// ── Configs de estilo ──────────────────────────────────────

const statusViagem: Record<StatusViagem, { label: string; cor: string; bg: string }> = {
  pendente:   { label: "Pendente",       cor: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  agendada:   { label: "Aguard. aceite", cor: "#A855F7", bg: "rgba(168,85,247,0.1)" },
  confirmada: { label: "Confirmada",     cor: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  em_rota:    { label: "Em rota",        cor: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  concluida:  { label: "Concluída",      cor: "#A0A0A0", bg: "rgba(160,160,160,0.1)" },
  cancelada:  { label: "Cancelada",      cor: "#EF4444", bg: "rgba(239,68,68,0.1)" },
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

function horaMinutoAtual() {
  const now = new Date();
  let h = now.getHours();
  let m = Math.ceil(now.getMinutes() / 15) * 15;
  if (m >= 60) { m = 0; h = (h + 1) % 24; }
  return { h: h.toString().padStart(2, "0"), m: m.toString().padStart(2, "0") };
}

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
  const { h: hDefault, m: mDefault } = horaMinutoAtual();
  const [hora, setHora] = useState(hDefault);
  const [minuto, setMinuto] = useState(mDefault);

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
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
            <input name="data" type="date" required min={new Date().toISOString().split("T")[0]} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Hora *</label>
            <input type="hidden" name="hora" value={`${hora}:${minuto}`} />
            <div className="flex items-center gap-2">
              <select
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className={inputCls + " text-center"}
              >
                {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")).map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span className="text-[#A0A0A0] font-bold">:</span>
              <select
                value={minuto}
                onChange={(e) => setMinuto(e.target.value)}
                className={inputCls + " text-center w-20"}
              >
                {["00", "15", "30", "45"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
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

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
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

// ── Buscar Viagem ──────────────────────────────────────────

type Categoria = "corridas" | "motoristas" | "clientes";

function BuscarViagem({ viagens, motoristas, clientes, onReload }: { viagens: ViagemDB[]; motoristas: PerfilDB[]; clientes: PerfilDB[]; onReload: () => Promise<void> }) {
  const [categoria, setCategoria] = useState<Categoria>("corridas");
  const [query, setQuery] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [menuCliente, setMenuCliente] = useState<string | null>(null);
  const [promovendo, setPromovendo] = useState<string | null>(null);

  async function handlePromover(id: string, para: "motorista" | "cliente") {
    setPromovendo(id);
    const supabase = createClient();
    await supabase.from("perfis").update({ perfil: para }).eq("id", id);
    setMenuCliente(null);
    setPromovendo(null);
    await onReload();
  }

  const q = query.trim().toLowerCase();

  const corridasFiltradas = viagens.filter((v) => {
    if (filtroStatus && v.status !== filtroStatus) return false;
    if (!q) return true;
    return (
      v.id.toLowerCase().includes(q) ||
      (v.cliente?.nome ?? "").toLowerCase().includes(q) ||
      (v.motorista?.nome ?? "").toLowerCase().includes(q) ||
      v.origem.toLowerCase().includes(q) ||
      v.destino.toLowerCase().includes(q)
    );
  });

  const motoristasFiltrados = motoristas.filter((m) =>
    !q || m.nome.toLowerCase().includes(q) || (m.telefone ?? "").includes(q)
  );

  const clientesFiltrados = clientes.filter((c) =>
    !q || c.nome.toLowerCase().includes(q) || (c.telefone ?? "").includes(q)
  );

  function formatDataHora(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
      " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  const categorias: { id: Categoria; label: string; count: number }[] = [
    { id: "corridas",   label: "Corridas",   count: viagens.length },
    { id: "motoristas", label: "Motoristas", count: motoristas.length },
    { id: "clientes",   label: "Clientes",   count: clientes.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Consulta</p>
        <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>Buscar</h1>
      </div>

      {/* Categorias */}
      <div className="flex gap-2">
        {categorias.map((c) => (
          <button
            key={c.id}
            onClick={() => { setCategoria(c.id); setQuery(""); setFiltroStatus(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              categoria === c.id
                ? "bg-[#CC0000] border-[#CC0000] text-white"
                : "bg-[#2B2B2B] border-[#444] text-[#A0A0A0] hover:text-[#F0F0F0] hover:border-[#666]"
            }`}
          >
            {c.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${categoria === c.id ? "bg-white/20" : "bg-[#333]"}`}>
              {c.count}
            </span>
          </button>
        ))}
      </div>

      {/* Barra de busca */}
      <form onSubmit={(e) => e.preventDefault()} className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              categoria === "corridas" ? "Filtrar por ID, cliente, motorista, origem ou destino..." :
              categoria === "motoristas" ? "Filtrar por nome ou telefone..." :
              "Filtrar por nome ou telefone..."
            }
            className="w-full bg-[#2B2B2B] border border-[#444] rounded-xl pl-10 pr-4 py-3 text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#CC0000] transition-colors"
          />
        </div>
        {categoria === "corridas" && (
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-[#2B2B2B] border border-[#444] rounded-xl px-3 py-2.5 text-sm text-[#F0F0F0] focus:outline-none focus:border-[#CC0000] transition-colors"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="agendada">Aguard. aceite</option>
            <option value="confirmada">Confirmada</option>
            <option value="em_rota">Em rota</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        )}
      </form>

      {/* Resultados — Usuários (motoristas ou clientes) */}
      {(categoria === "motoristas" || categoria === "clientes") && (() => {
        const lista = categoria === "motoristas" ? motoristasFiltrados : clientesFiltrados;
        return (
          <div className="space-y-3">
            <p className="text-[#A0A0A0] text-xs">{lista.length} registro(s)</p>
            {lista.length === 0 ? (
              <div className="bg-[#2B2B2B] border border-[#444] rounded-xl p-12 text-center">
                <Search size={36} className="text-[#444] mx-auto mb-3" />
                <p className="text-[#F0F0F0] font-medium">Nenhum resultado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lista.map((u) => {
                  const iniciais = u.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <div key={u.id} className="relative bg-[#2B2B2B] border border-[#444] rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-[#F0F0F0] text-sm font-bold flex-shrink-0">
                        {iniciais}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[#F0F0F0] font-medium text-sm truncate">{u.nome}</p>
                        <p className="text-[#A0A0A0] text-xs mt-0.5">
                          {u.telefone ? (
                            <a href={`https://wa.me/55${u.telefone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-70">
                              {formatPhone(u.telefone)}
                            </a>
                          ) : "Sem telefone"}
                        </p>
                      </div>
                      {categoria === "motoristas" && (
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${(u as PerfilDB).online ? "text-[#22C55E] bg-[#22C55E]/10" : "text-[#A0A0A0] bg-[#333]"}`}>
                          {(u as PerfilDB).online ? "Online" : "Offline"}
                        </span>
                      )}
                      {(categoria === "clientes" || categoria === "motoristas") && (
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={() => setMenuCliente(menuCliente === u.id ? null : u.id)}
                            className="text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors p-1 rounded"
                          >
                            {promovendo === u.id
                              ? <Loader2 size={15} className="animate-spin" />
                              : <ChevronDown size={15} className={`transition-transform ${menuCliente === u.id ? "rotate-180" : ""}`} />
                            }
                          </button>
                          {menuCliente === u.id && (
                            <div className="absolute right-0 top-7 bg-[#1E1E1E] border border-[#444] rounded-lg shadow-xl z-10 overflow-hidden">
                              {categoria === "clientes" ? (
                                <button
                                  onClick={() => handlePromover(u.id, "motorista")}
                                  className="w-full text-left px-4 py-2.5 text-sm text-[#F0F0F0] hover:bg-[#2B2B2B] transition-colors flex items-center gap-2 whitespace-nowrap"
                                >
                                  <Car size={14} className="text-[#A0A0A0] flex-shrink-0" />
                                  Atribuir função - Motorista
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePromover(u.id, "cliente")}
                                  className="w-full text-left px-4 py-2.5 text-sm text-[#F0F0F0] hover:bg-[#2B2B2B] transition-colors flex items-center gap-2 whitespace-nowrap"
                                >
                                  <Users size={14} className="text-[#A0A0A0] flex-shrink-0" />
                                  Atribuir função - Cliente
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Resultados — Corridas */}
      {categoria === "corridas" && (
        <div className="space-y-3">
          <p className="text-[#A0A0A0] text-xs">{corridasFiltradas.length} registro(s)</p>
          {corridasFiltradas.length === 0 ? (
            <div className="bg-[#2B2B2B] border border-[#444] rounded-xl p-12 text-center">
              <Search size={36} className="text-[#444] mx-auto mb-3" />
              <p className="text-[#F0F0F0] font-medium">Nenhuma corrida encontrada</p>
            </div>
          ) : (
            corridasFiltradas.map((v) => {
              const s = statusViagem[v.status];
              const motorista = motoristas.find((m) => m.id === v.motorista_id);
              return (
                <div key={v.id} className="bg-[#2B2B2B] border border-[#444] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[#444] bg-[#222]">
                    <span className="text-[#A0A0A0] text-xs font-mono">#{v.id.slice(0, 8).toUpperCase()}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: s.cor, backgroundColor: s.bg }}>{s.label}</span>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div>
                        <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-0.5">Cliente</p>
                        <p className="text-[#F0F0F0] font-medium">{v.cliente?.nome ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-0.5">Motorista</p>
                        <p className="text-[#F0F0F0]">{motorista?.nome ?? <span className="text-[#A0A0A0]">Não atribuído</span>}</p>
                        {motorista?.veiculo_modelo && (
                          <div className="flex items-center gap-1.5 text-xs text-[#A0A0A0] mt-0.5">
                            <Car size={11} className="flex-shrink-0" />
                            <span className="text-[#C0C0C0]">{motorista.veiculo_modelo}</span>
                            {motorista.veiculo_placa && <span className="bg-[#1E1E1E] border border-[#444] px-1.5 py-0.5 rounded font-mono">{motorista.veiculo_placa}</span>}
                            {motorista.veiculo_cor && <span>· {motorista.veiculo_cor}</span>}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-0.5">Data / Hora</p>
                        <p className="text-[#F0F0F0]">{formatDataHora(v.data_hora)}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-0.5">Origem</p>
                        <div className="flex items-center gap-1.5 text-[#F0F0F0]">
                          <Navigation size={12} className="text-[#A0A0A0] flex-shrink-0" />
                          <span>{v.origem}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-0.5">Destino</p>
                        <div className="flex items-center gap-1.5 text-[#F0F0F0]">
                          <MapPin size={12} className="text-[#CC0000] flex-shrink-0" />
                          <span>{v.destino}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-0.5">Valor</p>
                        <p className="text-[#F0F0F0] font-medium">
                          {v.valor !== null ? v.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────

type Aba = "dashboard" | "viagens" | "motoristas" | "relatorios" | "buscar";

export default function PainelPage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<Aba>("dashboard");
  const [periodoConcluidas, setPeriodoConcluidas] = useState<"30d" | "3m" | "all">("30d");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [viagens, setViagens] = useState<ViagemDB[]>([]);
  const [motoristas, setMotoristas] = useState<PerfilDB[]>([]);
  const [clientes, setClientes] = useState<PerfilDB[]>([]);
  const [loading, setLoading] = useState(true);

  const [novaViagemOpen, setNovaViagemOpen] = useState(false);
  const [novoMotoristaOpen, setNovoMotoristaOpen] = useState(false);
  const [motoristasSelecionados, setMotoristasSelecionados] = useState<Record<string, string>>({});
  const [valoresSelecionados, setValoresSelecionados] = useState<Record<string, string>>({});
  const [editandoValor, setEditandoValor] = useState<string | null>(null);
  const [errosViagem, setErrosViagem] = useState<Record<string, string>>({});
  const [valorTemp, setValorTemp] = useState("");
  const [exportando, setExportando] = useState(false);
  const [menuMotorista, setMenuMotorista] = useState<string | null>(null);
  const [viagemDetalhes, setViagemDetalhes] = useState<ViagemDB | null>(null);
  const [veiculoMotoristaId, setVeiculoMotoristaId] = useState<string | null>(null);
  const [mesRelatorio, setMesRelatorio] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [relatorioTodos, setRelatorioTodos] = useState(false);
  const [comissoesPagas, setComissoesPagas] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem("comissoes_pagas") ?? "{}"); } catch { return {}; }
  });

  function togglePago(motoristaId: string, mes: string) {
    const key = `${motoristaId}_${mes}`;
    setComissoesPagas(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("comissoes_pagas", JSON.stringify(next));
      return next;
    });
  }

  async function loadData() {
    const supabase = createClient();

    const [viagensRes, motoristasRes, clientesRes] = await Promise.all([
      supabase
        .from("viagens")
        .select("*, paradas, observacoes, cliente:perfis!cliente_id(nome), motorista:perfis!motorista_id(nome)")
        .order("data_hora", { ascending: false }),
      supabase
        .from("perfis")
        .select("*")
        .eq("perfil", "motorista")
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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.user_metadata?.perfil !== "admin") {
        router.replace("/login");
        return;
      }
      setAutorizado(true);
      loadData();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autorizado) return;
    const supabase = createClient();
    const sub = supabase
      .channel("motoristas-online")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "perfis" }, () => {
        supabase
          .from("perfis")
          .select("*")
          .eq("perfil", "motorista")
          .eq("ativo", true)
          .order("nome")
          .then(({ data }) => { if (data) setMotoristas(data); });
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [autorizado]);

  async function handleToggleAtivo(motoristaId: string, ativoAtual: boolean) {
    const supabase = createClient();
    await supabase.from("perfis").update({ ativo: !ativoAtual }).eq("id", motoristaId);
    setMenuMotorista(null);
    await loadData();
  }

  async function handleMudarStatus(viagemId: string, novoStatus: StatusViagem) {
    if (novoStatus === "confirmada") {
      const viagem = viagens.find((v) => v.id === viagemId);
      if (!viagem?.motorista_id || !viagem?.valor) {
        setErrosViagem((prev) => ({ ...prev, [viagemId]: "Atribua motorista e valor antes de confirmar." }));
        return;
      }
    }
    setErrosViagem((prev) => { const n = { ...prev }; delete n[viagemId]; return n; });
    const supabase = createClient();
    await supabase.from("viagens").update({ status: novoStatus }).eq("id", viagemId);
    await loadData();
  }

  async function handleAtribuir(viagemId: string) {
    const motoristaId = motoristasSelecionados[viagemId];
    if (!motoristaId) return;
    const valorRaw = valoresSelecionados[viagemId];
    if (!valorRaw || valorRaw.trim() === "") {
      setErrosViagem((prev) => ({ ...prev, [viagemId]: "Informe o valor antes de confirmar." }));
      return;
    }
    setErrosViagem((prev) => { const n = { ...prev }; delete n[viagemId]; return n; });
    const valor = parseFloat(valorRaw.replace(",", "."));
    const supabase = createClient();
    await supabase
      .from("viagens")
      .update({ motorista_id: motoristaId, status: "agendada", ...(valor ? { valor } : {}) })
      .eq("id", viagemId);
    await loadData();
  }

  async function handleSalvarValor(viagemId: string) {
    const valor = valorTemp ? parseFloat(valorTemp.replace(",", ".")) : null;
    const supabase = createClient();
    await supabase.from("viagens").update({ valor }).eq("id", viagemId);
    setEditandoValor(null);
    await loadData();
  }

  async function handleSalvarVeiculo(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!veiculoMotoristaId) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const supabase = createClient();
    await supabase.from("perfis").update({
      veiculo_modelo: (data.get("veiculo_modelo") as string).trim() || null,
      veiculo_placa: (data.get("veiculo_placa") as string).trim().toUpperCase() || null,
      veiculo_cor: (data.get("veiculo_cor") as string).trim() || null,
    }).eq("id", veiculoMotoristaId);
    setVeiculoMotoristaId(null);
    await loadData();
  }

  async function exportarExcel() {
    setExportando(true);
    const result = await gerarRelatorioExcel(relatorioTodos ? null : mesRelatorio);
    setExportando(false);
    if (!result || "erro" in result) return;
    const { base64, periodoLabel } = result;
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${periodoLabel.replace(/ /g, "-").toLowerCase()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pendentes = viagens.filter((v) => v.status === "pendente");
  const proximas = viagens
    .filter(v => ["confirmada", "agendada", "em_rota"].includes(v.status) && new Date(v.data_hora) >= new Date())
    .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());

  const navItems: { id: Aba; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "dashboard",  label: "Dashboard",  icon: LayoutDashboard },
    { id: "viagens",    label: "Viagens",    icon: Car,      badge: pendentes.length || undefined },
    { id: "motoristas", label: "Motoristas", icon: Users },
    { id: "buscar",     label: "Buscar",     icon: Search },
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

  if (!autorizado) {
    return <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center"><Loader2 size={24} className="text-[#CC0000] animate-spin" /></div>;
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
      {veiculoMotoristaId && (() => {
        const inputCls = "w-full bg-[#1E1E1E] border border-[#444] text-[#F0F0F0] text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#CC0000] placeholder-[#555]";
        const labelCls = "block text-xs text-[#A0A0A0] uppercase tracking-wider mb-1.5";
        const motorista = motoristas.find(m => m.id === veiculoMotoristaId);
        return (
          <Modal title={`Veículo — ${motorista?.nome ?? ""}`} onClose={() => setVeiculoMotoristaId(null)}>
            <form onSubmit={handleSalvarVeiculo} className="space-y-4">
              <div>
                <label className={labelCls}>Modelo *</label>
                <input name="veiculo_modelo" required placeholder="Ex: Toyota Corolla 2023" defaultValue={motorista?.veiculo_modelo ?? ""} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Placa *</label>
                  <input name="veiculo_placa" required placeholder="Ex: ABC1D23" defaultValue={motorista?.veiculo_placa ?? ""} className={inputCls + " uppercase"} maxLength={8} />
                </div>
                <div>
                  <label className={labelCls}>Cor *</label>
                  <input name="veiculo_cor" required placeholder="Ex: Preto" defaultValue={motorista?.veiculo_cor ?? ""} className={inputCls} />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#CC0000] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#E50000] transition-colors">
                Salvar veículo
              </button>
            </form>
          </Modal>
        );
      })()}

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

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[
                  { label: "Viagens ativas",   valor: viagens.filter(v => ["confirmada","em_rota"].includes(v.status)).length.toString(), icon: Car,  cor: "#CC0000", delta: `${pendentes.length} pendente(s)` },
                  { label: "Total de clientes", valor: clientes.length.toString(),                                                                    icon: Star, cor: "#F59E0B", delta: "cadastrados" },
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

                {/* Card Viagens concluídas com dropdown de período */}
                {(() => {
                  const agora = new Date();
                  const corte = new Date(agora);
                  if (periodoConcluidas === "30d") corte.setDate(agora.getDate() - 30);
                  else if (periodoConcluidas === "3m") corte.setMonth(agora.getMonth() - 3);
                  const count = periodoConcluidas === "all"
                    ? viagens.filter(v => v.status === "concluida").length
                    : viagens.filter(v => v.status === "concluida" && new Date(v.data_hora) >= corte).length;
                  return (
                    <div className="bg-[#2B2B2B] border border-[#444] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[#A0A0A0] text-sm">Viagens concluídas</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={periodoConcluidas}
                            onChange={(e) => setPeriodoConcluidas(e.target.value as "30d" | "3m")}
                            className="bg-[#1E1E1E] border border-[#444] text-[#A0A0A0] text-xs rounded px-2 py-1 focus:outline-none focus:border-[#CC0000] transition-colors"
                          >
                            <option value="30d">Últimos 30 dias</option>
                            <option value="3m">Últimos 3 meses</option>
                            <option value="all">Desde sempre</option>
                          </select>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#3B82F622]">
                            <TrendingUp size={18} color="#3B82F6" />
                          </div>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-[#F0F0F0]">{loading ? "—" : count}</p>
                      <p className="text-xs text-[#A0A0A0] mt-1">{periodoConcluidas === "30d" ? "últimos 30 dias" : periodoConcluidas === "3m" ? "últimos 3 meses" : "desde sempre"}</p>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                {/* Pendentes sem motorista */}
                <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#444]">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={15} className="text-[#F59E0B]" />
                      <h2 className="text-[#F0F0F0] font-semibold text-sm">Pendentes sem motorista</h2>
                      {pendentes.length > 0 && (
                        <span className="bg-[#F59E0B] text-black text-xs font-bold px-1.5 py-0.5 rounded-full">{pendentes.length}</span>
                      )}
                    </div>
                    <button onClick={() => setAbaAtiva("viagens")} className="text-[#CC0000] text-xs flex items-center gap-1 hover:text-[#E50000]">
                      Ver todas <ChevronRight size={12} />
                    </button>
                  </div>
                  {loading ? (
                    <p className="px-5 py-8 text-center text-[#A0A0A0] text-sm animate-pulse">Carregando...</p>
                  ) : pendentes.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <p className="text-[#22C55E] text-sm font-medium">Tudo em dia</p>
                      <p className="text-[#A0A0A0] text-xs mt-1">Nenhuma viagem aguardando motorista.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#333]">
                      {pendentes.slice(0, 5).map((v) => (
                        <div key={v.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#333] transition-colors">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <button onClick={() => setViagemDetalhes(v)} className="text-[#CC0000] text-xs font-mono hover:underline">
                                #{v.id.slice(0, 8).toUpperCase()}
                              </button>
                              <span className="text-[#F0F0F0] text-sm truncate">{v.cliente?.nome ?? "—"}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-[#A0A0A0] text-xs">
                              <Navigation size={10} className="flex-shrink-0" />
                              <span className="truncate">{v.origem}</span>
                              <ChevronRight size={10} className="flex-shrink-0" />
                              <span className="truncate">{v.destino}</span>
                            </div>
                          </div>
                          <span className="text-[#A0A0A0] text-xs whitespace-nowrap flex-shrink-0">{formatDataHora(v.data_hora)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Próximas confirmadas */}
                {(() => {
                  const proximasSlice = proximas.slice(0, 5);
                  return (
                    <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-[#444]">
                        <div className="flex items-center gap-2">
                          <Car size={15} className="text-[#3B82F6]" />
                          <h2 className="text-[#F0F0F0] font-semibold text-sm">Próximas viagens</h2>
                          {proximas.length > 0 && (
                            <span className="bg-[#3B82F6] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{proximas.length}</span>
                          )}
                        </div>
                        <button onClick={() => setAbaAtiva("viagens")} className="text-[#CC0000] text-xs flex items-center gap-1 hover:text-[#E50000]">
                          Ver todas <ChevronRight size={12} />
                        </button>
                      </div>
                      {loading ? (
                        <p className="px-5 py-8 text-center text-[#A0A0A0] text-sm animate-pulse">Carregando...</p>
                      ) : proximas.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                          <p className="text-[#A0A0A0] text-sm">Nenhuma viagem confirmada futura.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-[#333]">
                          {proximasSlice.map((v) => {
                            const s = statusViagem[v.status];
                            return (
                              <div key={v.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#333] transition-colors">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => setViagemDetalhes(v)} className="text-[#CC0000] text-xs font-mono hover:underline">
                                      #{v.id.slice(0, 8).toUpperCase()}
                                    </button>
                                    <span className="text-[#F0F0F0] text-sm truncate">{v.cliente?.nome ?? "—"}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[#A0A0A0] text-xs truncate">{v.motorista?.nome ?? "—"}</span>
                                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0" style={{ color: s.cor, backgroundColor: s.bg }}>{s.label}</span>
                                  </div>
                                </div>
                                <span className="text-[#A0A0A0] text-xs whitespace-nowrap flex-shrink-0">{formatDataHora(v.data_hora)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
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
                <div>
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-[90px]" />
                      <col className="w-[110px]" />
                      <col className="w-[22%]" />
                      <col className="w-[110px]" />
                      <col className="w-[18%]" />
                      <col className="w-[100px]" />
                      <col className="w-[110px]" />
                      <col className="w-[130px]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-[#444]">
                        {["#", "Cliente", "Trajeto", "Data/Hora", "Motorista", "Valor", "Status", ""].map((col) => (
                          <th key={col} className="text-left px-4 py-3 text-xs text-[#A0A0A0] uppercase tracking-wider font-medium">{col}</th>
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
                        const podeConfirmar = !!(v.motorista_id && v.valor);
                        const opcoes = (proximosStatus[v.status] ?? []).filter(
                          (st) => st !== "confirmada" || podeConfirmar
                        );
                        return (
                          <tr key={v.id} className="border-b border-[#333] hover:bg-[#333] transition-colors">
                            <td className="px-4 py-3 text-xs font-mono whitespace-nowrap">
                              <button
                                onClick={() => setViagemDetalhes(v)}
                                className="text-[#CC0000] hover:text-[#E50000] hover:underline transition-colors"
                              >
                                #{v.id.slice(0, 8).toUpperCase()}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-[#F0F0F0] text-sm font-medium overflow-hidden">
                              <span className="truncate block">{v.cliente?.nome ?? "—"}</span>
                            </td>
                            <td className="px-4 py-3 text-sm overflow-hidden">
                              <div className="flex items-center gap-1 text-[#A0A0A0] min-w-0">
                                <Navigation size={12} className="flex-shrink-0" />
                                <span className="truncate">{v.origem}</span>
                              </div>
                              {(v.paradas ?? []).map((p, i) => (
                                <div key={i}>
                                  <div className="flex items-center pl-[3px]">
                                    <ChevronDown size={11} className="text-[#555]" />
                                  </div>
                                  <div className="flex items-center gap-1 text-[#888] min-w-0">
                                    <MapPin size={12} className="flex-shrink-0 text-[#666]" />
                                    <span className="truncate">{p}</span>
                                  </div>
                                </div>
                              ))}
                              <div className="flex items-center pl-[3px]">
                                <ChevronDown size={11} className="text-[#555]" />
                              </div>
                              <div className="flex items-center gap-1 text-[#F0F0F0] min-w-0">
                                <MapPin size={12} className="flex-shrink-0 text-[#CC0000]" />
                                <span className="truncate">{v.destino}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[#A0A0A0] text-sm whitespace-nowrap">{formatDataHora(v.data_hora)}</td>
                            <td className="px-4 py-3 text-sm overflow-hidden">
                              {v.motorista ? (
                                <span className="text-[#F0F0F0] truncate block">{v.motorista.nome}</span>
                              ) : v.status === "pendente" ? (
                                <div className="flex flex-col gap-1.5">
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
                                <input
                                  type="text"
                                  placeholder="Valor (R$)"
                                  value={valoresSelecionados[v.id] ?? ""}
                                  onChange={(e) => setValoresSelecionados((prev) => ({ ...prev, [v.id]: e.target.value }))}
                                  className="bg-[#1E1E1E] border border-[#444] text-[#F0F0F0] text-xs rounded px-2 py-1.5 focus:outline-none focus:border-[#CC0000] placeholder-[#555] w-full"
                                />
                                </div>
                              ) : (
                                <span className="text-[#A0A0A0] text-xs">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                              {editandoValor === v.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    autoFocus
                                    type="text"
                                    value={valorTemp}
                                    onChange={(e) => setValorTemp(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSalvarValor(v.id);
                                      if (e.key === "Escape") setEditandoValor(null);
                                    }}
                                    placeholder="0,00"
                                    className="w-24 bg-[#1E1E1E] border border-[#CC0000] text-[#F0F0F0] text-xs rounded px-2 py-1 focus:outline-none"
                                  />
                                  <button onClick={() => handleSalvarValor(v.id)} className="text-[#22C55E] hover:text-[#16A34A]"><Check size={14} /></button>
                                  <button onClick={() => setEditandoValor(null)} className="text-[#A0A0A0] hover:text-[#F0F0F0]"><X size={14} /></button>
                                </div>
                              ) : (
                                <span className="text-[#F0F0F0] font-medium">
                                  {formatValor(v.valor)}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap" style={{ color: s.cor, backgroundColor: s.bg }}>{s.label}</span>
                            </td>
                            <td className="px-4 py-3">
                              {errosViagem[v.id] && (
                                <p className="text-[#EF4444] text-xs mb-1.5">{errosViagem[v.id]}</p>
                              )}
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
                <div className="flex items-center gap-3">
                  {motoristas.filter(m => !m.ativo).length > 0 && (
                    <span className="text-xs text-[#555] tabular-nums">
                      {motoristas.filter(m => !m.ativo).length} desativado{motoristas.filter(m => !m.ativo).length > 1 ? "s" : ""}
                    </span>
                  )}
                  <button
                    onClick={() => setNovoMotoristaOpen(true)}
                    className="flex items-center gap-2 bg-[#CC0000] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#E50000] transition-colors"
                  >
                    <Plus size={16} />
                    Novo Motorista
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#2B2B2B] border border-[#22C55E]/20 rounded-xl p-4 text-center">
                  <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-[#22C55E] animate-pulse" />
                  <p className="text-2xl font-bold text-[#22C55E]">{motoristas.filter(m => m.online).length}</p>
                  <p className="text-xs text-[#A0A0A0] mt-0.5">Online</p>
                </div>
                <div className="bg-[#2B2B2B] border border-[#444] rounded-xl p-4 text-center">
                  <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-[#555]" />
                  <p className="text-2xl font-bold text-[#F0F0F0]">{motoristas.filter(m => !m.online).length}</p>
                  <p className="text-xs text-[#A0A0A0] mt-0.5">Offline</p>
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
                    const menuAberto = menuMotorista === m.id;
                    return (
                      <div key={m.id} className={`relative bg-[#2B2B2B] border rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] ${m.ativo ? "border-[#444]" : "border-[#333] opacity-60"}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 flex-shrink-0">
                              <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center text-[#F0F0F0] font-bold">
                                {iniciais}
                              </div>
                              {m.ativo && <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#2B2B2B] ${m.online ? "bg-[#22C55E]" : "bg-[#555]"}`} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-[#F0F0F0] font-semibold">{m.nome}</p>
                                {!m.ativo && <span className="text-xs px-2 py-0.5 rounded-full bg-[#333] text-[#A0A0A0]">Inativo</span>}
                              </div>
                              <p className={`text-xs mt-0.5 ${m.ativo && m.online ? "text-[#22C55E]" : "text-[#A0A0A0]"}`}>
                                {m.ativo ? (m.online ? "Online" : "Offline") : "—"} ·{" "}
                                {m.telefone ? (
                                  <a href={`https://wa.me/55${m.telefone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
                                    {formatPhone(m.telefone)}
                                  </a>
                                ) : "Sem telefone"}
                              </p>
                            </div>
                          </div>

                          {/* Menu */}
                          <div className="relative">
                            <button
                              onClick={() => setMenuMotorista(menuAberto ? null : m.id)}
                              className="text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors p-1 rounded"
                            >
                              <ChevronDown size={15} className={`transition-transform ${menuAberto ? "rotate-180" : ""}`} />
                            </button>
                            {menuAberto && (
                              <div className="absolute right-0 top-7 w-48 bg-[#1E1E1E] border border-[#444] rounded-lg shadow-xl z-10 overflow-hidden">
                                <button
                                  onClick={() => { setVeiculoMotoristaId(m.id); setMenuMotorista(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-[#F0F0F0] transition-colors hover:bg-[#2B2B2B] flex items-center gap-2"
                                >
                                  <Car size={14} className="text-[#A0A0A0]" />
                                  Cadastrar veículo
                                </button>
                                <div className="border-t border-[#333]" />
                                <button
                                  onClick={() => handleToggleAtivo(m.id, m.ativo)}
                                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#2B2B2B] ${m.ativo ? "text-[#EF4444]" : "text-[#22C55E]"}`}
                                >
                                  {m.ativo ? "Inativar perfil" : "Reativar perfil"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-[#333] flex items-center justify-between gap-4">
                          <p className="text-[#A0A0A0] text-xs">
                            Cadastrado em {new Date(m.created_at).toLocaleDateString("pt-BR")}
                          </p>
                          {m.veiculo_modelo ? (
                            <div className="flex items-center gap-1.5 text-xs text-[#A0A0A0]">
                              <Car size={12} className="flex-shrink-0" />
                              <span className="text-[#F0F0F0]">{m.veiculo_modelo}</span>
                              {m.veiculo_placa && <span className="bg-[#1E1E1E] border border-[#444] px-1.5 py-0.5 rounded font-mono">{m.veiculo_placa}</span>}
                              {m.veiculo_cor && <span>· {m.veiculo_cor}</span>}
                            </div>
                          ) : (
                            <span className="text-xs text-[#555] italic">Sem veículo</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Relatórios ── */}
          {abaAtiva === "relatorios" && (() => {
            const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

            // Meses disponíveis (com viagens concluídas)
            const mesesDisponiveis = Array.from(
              new Set(
                viagens
                  .filter(v => v.status === "concluida")
                  .map(v => v.data_hora.slice(0, 7))
              )
            ).sort((a, b) => b.localeCompare(a));

            const nomesMes = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
            function labelMes(ym: string) {
              const [y, m] = ym.split("-");
              return `${nomesMes[parseInt(m) - 1]} ${y}`;
            }

            const concluidasMes = relatorioTodos
              ? viagens.filter(v => v.status === "concluida")
              : viagens.filter(v => v.status === "concluida" && v.data_hora.startsWith(mesRelatorio));
            const faturamentoTotal = concluidasMes.filter(v => v.valor).reduce((acc, v) => acc + (v.valor ?? 0), 0);
            const comissao = faturamentoTotal * 0.1;
            const ticketMedio = concluidasMes.filter(v => v.valor).length
              ? faturamentoTotal / concluidasMes.filter(v => v.valor).length
              : null;

            // Faturamento por motorista no mês
            const porMotorista: Record<string, { id: string; nome: string; total: number; viagens: number }> = {};
            for (const v of concluidasMes) {
              if (!v.motorista_id || !v.valor) continue;
              const nome = v.motorista?.nome ?? "Sem nome";
              if (!porMotorista[v.motorista_id]) porMotorista[v.motorista_id] = { id: v.motorista_id, nome, total: 0, viagens: 0 };
              porMotorista[v.motorista_id].total += v.valor;
              porMotorista[v.motorista_id].viagens += 1;
            }
            const rankingMotoristas = Object.values(porMotorista).sort((a, b) => b.total - a.total);

            return (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-1">Gerencial</p>
                    <h1 className="text-3xl font-bold text-[#F0F0F0] uppercase" style={{ fontFamily: "var(--font-oswald)" }}>Relatórios</h1>
                  </div>
                  <button
                    onClick={exportarExcel}
                    disabled={exportando}
                    className="flex items-center gap-2 bg-[#22C55E] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#16A34A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {exportando ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {exportando ? "Gerando..." : "Exportar Excel"}
                  </button>
                </div>

                {/* Seletor de mês */}
                {mesesDisponiveis.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setRelatorioTodos(true)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                        relatorioTodos
                          ? "bg-[#CC0000] border-[#CC0000] text-white"
                          : "bg-[#2B2B2B] border-[#444] text-[#A0A0A0] hover:text-[#F0F0F0] hover:border-[#666]"
                      }`}
                    >
                      Todos os tempos
                    </button>
                    {mesesDisponiveis.map(ym => (
                      <button
                        key={ym}
                        onClick={() => { setMesRelatorio(ym); setRelatorioTodos(false); }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                          !relatorioTodos && mesRelatorio === ym
                            ? "bg-[#CC0000] border-[#CC0000] text-white"
                            : "bg-[#2B2B2B] border-[#444] text-[#A0A0A0] hover:text-[#F0F0F0] hover:border-[#666]"
                        }`}
                      >
                        {labelMes(ym)}
                      </button>
                    ))}
                  </div>
                )}

                {/* KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Faturamento total",  valor: loading ? "—" : fmt(faturamentoTotal), sub: "viagens concluídas",                          icon: DollarSign, cor: "#22C55E", hide: false },
                    { label: "Comissão (10%)",      valor: loading ? "—" : fmt(comissao),         sub: "a receber",                                   icon: TrendingUp, cor: "#CC0000", hide: false },
                    { label: "Viagens concluídas", valor: loading ? "—" : concluidasMes.length.toString(), sub: relatorioTodos ? "no total" : `de ${viagens.filter(v => v.data_hora.startsWith(mesRelatorio)).length} solicitadas`, icon: Car, cor: "#3B82F6", hide: false },
                    { label: "Ticket médio",        valor: loading ? "—" : (ticketMedio ? fmt(ticketMedio) : "—"), sub: "por viagem",                 icon: Star,       cor: "#F59E0B", hide: false },
                  ].filter(k => !k.hide).map((k) => {
                    const Icon = k.icon;
                    return (
                      <div key={k.label} className="bg-[#2B2B2B] border border-[#444] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[#A0A0A0] text-sm">{k.label}</span>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: k.cor + "22" }}>
                            <Icon size={18} style={{ color: k.cor }} />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-[#F0F0F0]">{k.valor}</p>
                        <p className="text-xs text-[#A0A0A0] mt-1">{k.sub}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Faturamento por motorista */}
                <div className="bg-[#2B2B2B] border border-[#444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                  <div className="px-6 py-4 border-b border-[#444] flex items-center justify-between">
                    <h2 className="text-[#F0F0F0] font-semibold">Faturamento por motorista</h2>
                    <span className="text-[#A0A0A0] text-xs">{relatorioTodos ? "Todos os tempos" : labelMes(mesRelatorio)}</span>
                  </div>
                  {loading ? (
                    <p className="px-6 py-8 text-center text-[#A0A0A0] text-sm animate-pulse">Carregando...</p>
                  ) : rankingMotoristas.length === 0 ? (
                    <p className="px-6 py-8 text-center text-[#A0A0A0] text-sm">Nenhum dado para este mês.</p>
                  ) : (
                    <div className="divide-y divide-[#333]">
                      {rankingMotoristas.map((m, i) => {
                        const pagoKey = `${m.id}_${mesRelatorio}`;
                        const pago = !!comissoesPagas[pagoKey];
                        return (
                          <div key={m.id} className="px-6 py-4 flex items-center gap-4">
                            <span className="text-[#444] text-sm font-mono w-5 text-right flex-shrink-0">{i + 1}</span>
                            <div className="w-9 h-9 rounded-full bg-[#CC0000]/10 border border-[#CC0000]/20 flex items-center justify-center text-[#CC0000] text-sm font-bold flex-shrink-0">
                              {m.nome.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[#F0F0F0] text-sm font-medium truncate">{m.nome}</p>
                              <p className="text-[#A0A0A0] text-xs">{m.viagens} viagem{m.viagens !== 1 ? "s" : ""}</p>
                            </div>
                            <div className="text-right flex-shrink-0 mr-4">
                              <p className="text-[#F0F0F0] font-semibold text-sm">{fmt(m.total)}</p>
                              {!relatorioTodos && <p className={`text-xs ${pago ? "line-through text-[#555]" : "text-[#CC0000]"}`}>10% = {fmt(m.total * 0.1)}</p>}
                            </div>
                            {!relatorioTodos && (
                              <button
                                onClick={() => togglePago(m.id, mesRelatorio)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex-shrink-0 ${
                                  pago
                                    ? "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]"
                                    : "bg-[#1E1E1E] border-[#444] text-[#A0A0A0] hover:border-[#22C55E]/40 hover:text-[#22C55E]"
                                }`}
                              >
                                <Check size={12} />
                                {pago ? "Pago" : "Marcar pago"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {abaAtiva === "buscar" && <BuscarViagem viagens={viagens} motoristas={motoristas} clientes={clientes} onReload={loadData} />}

        </div>
      </main>

      {/* ── Modal Detalhes da Viagem ── */}
      {viagemDetalhes && (() => {
        const v = viagemDetalhes;
        const s = statusViagem[v.status];
        return (
          <Modal title={`Viagem #${v.id.slice(0, 8).toUpperCase()}`} onClose={() => setViagemDetalhes(null)}>
            <div className="space-y-5">
              {/* Status + Valor */}
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: s.cor, backgroundColor: s.bg }}>{s.label}</span>
                <span className="text-[#F0F0F0] font-semibold text-sm">{formatValor(v.valor)}</span>
              </div>

              {/* Trajeto completo */}
              <div>
                <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2">Trajeto</p>
                <div className="space-y-1">
                  <div className="flex items-start gap-2 text-[#A0A0A0] text-sm">
                    <Navigation size={13} className="flex-shrink-0 mt-0.5" />
                    <span>{v.origem}</span>
                  </div>
                  {(v.paradas ?? []).map((p, i) => (
                    <div key={i}>
                      <div className="flex items-center pl-[4px]">
                        <ChevronDown size={11} className="text-[#555]" />
                      </div>
                      <div className="flex items-start gap-2 text-[#888] text-sm">
                        <MapPin size={13} className="flex-shrink-0 mt-0.5 text-[#666]" />
                        <span>{p}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center pl-[4px]">
                    <ChevronDown size={11} className="text-[#555]" />
                  </div>
                  <div className="flex items-start gap-2 text-[#F0F0F0] text-sm">
                    <MapPin size={13} className="flex-shrink-0 mt-0.5 text-[#CC0000]" />
                    <span>{v.destino}</span>
                  </div>
                </div>
              </div>

              {/* Informações */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#444]">
                <div>
                  <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-1">Cliente</p>
                  <p className="text-[#F0F0F0] text-sm">{v.cliente?.nome ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-1">Motorista</p>
                  <p className="text-[#F0F0F0] text-sm">{v.motorista?.nome ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-1">Data / Hora</p>
                  <p className="text-[#F0F0F0] text-sm">{formatDataHora(v.data_hora)}</p>
                </div>
                <div>
                  <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-1">ID completo</p>
                  <p className="text-[#A0A0A0] text-xs font-mono break-all">{v.id}</p>
                </div>
              </div>

              {/* Observações */}
              {v.observacoes && (
                <div className="pt-1 border-t border-[#444]">
                  <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-1">Observações</p>
                  <p className="text-[#D0D0D0] text-sm italic border-l-2 border-[#444] pl-3">{v.observacoes}</p>
                </div>
              )}
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
