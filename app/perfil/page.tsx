"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  User,
  Mail,
  Phone,
  Shield,
  Edit2,
  Check,
  X,
  Car,
  Star,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cancelarViagem } from "@/app/actions/viagens";

const perfilLabel: Record<string, string> = {
  admin: "Administrador",
  motorista: "Motorista",
  cliente: "Cliente",
};

export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [perfilTipo, setPerfilTipo] = useState("");
  const [membroDesde, setMembroDesde] = useState("");
  const [totalViagens, setTotalViagens] = useState(0);

  type Viagem = {
    id: string;
    origem: string;
    destino: string;
    data_hora: string;
    status: string;
    valor: number | null;
    avaliacao?: number | null;
  };
  const [proximasViagens, setProximasViagens] = useState<Viagem[]>([]);
  const [viagensAnteriores, setViagensAnteriores] = useState<Viagem[]>([]);

  const [nomeTemp, setNomeTemp] = useState("");
  const [telefoneTemp, setTelefoneTemp] = useState("");
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState("");
  const [senhaAtualizada, setSenhaAtualizada] = useState(false);
  const [cancelamentoSucesso, setCancelamentoSucesso] = useState(false);
  const [hover, setHover] = useState<{ id: string; nota: number } | null>(null);
  const [salvandoAv, setSalvandoAv] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState<string | null>(null);
  const [confirmandoCancel, setConfirmandoCancel] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && window.location.hash === "#proximas-viagens") {
      document.getElementById("proximas-viagens")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? "");

      const { data: perfil } = await supabase
        .from("perfis")
        .select("*")
        .eq("id", user.id)
        .single();

      if (perfil) {
        setNome(perfil.nome);
        setTelefone(perfil.telefone ?? "");
        setPerfilTipo(perfil.perfil);
        const data = new Date(perfil.created_at);
        const label = data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
        setMembroDesde(label.charAt(0).toUpperCase() + label.slice(1));
      }

      const { count } = await supabase
        .from("viagens")
        .select("id", { count: "exact", head: true })
        .eq("cliente_id", user.id)
        .eq("status", "concluida");
      setTotalViagens(count ?? 0);

      const { data: proximas } = await supabase
        .from("viagens")
        .select("id, origem, destino, data_hora, status, valor")
        .eq("cliente_id", user.id)
        .in("status", ["pendente", "agendada", "confirmada", "em_rota"])
        .order("data_hora", { ascending: true });
      setProximasViagens(proximas ?? []);

      const { data: anterioresRaw } = await supabase
        .from("viagens")
        .select("id, origem, destino, data_hora, status, valor")
        .eq("cliente_id", user.id)
        .in("status", ["concluida", "cancelada"])
        .order("data_hora", { ascending: false })
        .limit(10);

      const { data: avsData } = await supabase
        .from("avaliacoes")
        .select("viagem_id, nota")
        .eq("avaliador_id", user.id);
      const avMap: Record<string, number> = {};
      for (const a of avsData ?? []) avMap[a.viagem_id] = a.nota;

      setViagensAnteriores(
        (anterioresRaw ?? []).map((v) => ({ ...v, avaliacao: avMap[v.id] ?? null }))
      );

      setLoading(false);
    }
    load();
  }, []);

  function handleEditar() {
    setNomeTemp(nome);
    setTelefoneTemp(telefone);
    setEditando(true);
  }

  function handleCancelar() {
    setEditando(false);
    setErro("");
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("perfis")
      .upsert({ id: user.id, nome: nomeTemp, telefone: telefoneTemp, perfil: perfilTipo || "cliente" });

    setSalvando(false);

    if (error) {
      setErro("Erro ao salvar. Tente novamente.");
      return;
    }

    setNome(nomeTemp);
    setTelefone(telefoneTemp);
    setEditando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  }

  async function handleCancelarViagem(viagemId: string) {
    setCancelando(viagemId);
    const result = await cancelarViagem(viagemId);
    setCancelando(null);
    setConfirmandoCancel(null);
    if (result?.erro) { setErro(result.erro); return; }
    setProximasViagens((prev) => prev.filter((v) => v.id !== viagemId));
    setCancelamentoSucesso(true);
    setTimeout(() => setCancelamentoSucesso(false), 3000);
  }

  async function handleAlterarSenha() {
    setErroSenha("");
    if (novaSenha.length < 6) { setErroSenha("A senha deve ter pelo menos 6 caracteres."); return; }
    if (novaSenha !== confirmarSenha) { setErroSenha("As senhas não coincidem."); return; }
    setSalvandoSenha(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setSalvandoSenha(false);
    if (error) { setErroSenha("Erro ao atualizar senha. Tente novamente."); return; }
    setAlterandoSenha(false);
    setNovaSenha("");
    setConfirmarSenha("");
    setSenhaAtualizada(true);
    setTimeout(() => setSenhaAtualizada(false), 3000);
  }

  async function handleAvaliar(viagemId: string, nota: number) {
    setSalvandoAv(viagemId);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("avaliacoes").insert({ viagem_id: viagemId, avaliador_id: user.id, nota });
    setViagensAnteriores((prev) =>
      prev.map((v) => v.id === viagemId ? { ...v, avaliacao: nota } : v)
    );
    setSalvandoAv(null);
    setHover(null);
  }

  const iniciais = nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#1E1E1E] pt-24 flex items-center justify-center">
          <p className="text-[#A0A0A0] text-sm animate-pulse">Carregando perfil...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#1E1E1E] pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Cabeçalho */}
          <div>
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-2">
              Minha conta
            </p>
            <h1
              className="text-4xl font-bold text-[#F0F0F0] uppercase"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Perfil
            </h1>
          </div>

          {/* Card avatar + stats */}
          <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-[#CC0000]/20 border-2 border-[#CC0000] flex items-center justify-center text-[#CC0000] text-2xl font-bold flex-shrink-0">
              {iniciais}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-[#F0F0F0]">{nome}</h2>
              <p className="text-[#A0A0A0] text-sm mt-0.5">{perfilLabel[perfilTipo] ?? perfilTipo}</p>
              <p className="text-[#A0A0A0] text-xs mt-1 flex items-center justify-center sm:justify-start gap-1">
                <Calendar size={12} />
                Membro desde {membroDesde}
              </p>
            </div>
            <div className="flex sm:flex-col gap-6 sm:gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Car size={14} className="text-[#CC0000]" />
                  <span className="text-xl font-bold text-[#F0F0F0]">{totalViagens}</span>
                </div>
                <p className="text-[#A0A0A0] text-xs">Viagens</p>
              </div>
            </div>
          </div>

          {/* Toasts */}
          {salvo && (
            <div className="bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-lg px-4 py-3 flex items-center gap-2">
              <Check size={16} className="text-[#22C55E]" />
              <span className="text-[#22C55E] text-sm">Perfil atualizado com sucesso.</span>
            </div>
          )}
          {cancelamentoSucesso && (
            <div className="bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-lg px-4 py-3 flex items-center gap-2">
              <Check size={16} className="text-[#22C55E]" />
              <span className="text-[#22C55E] text-sm">Viagem cancelada com sucesso.</span>
            </div>
          )}

          {/* Dados pessoais */}
          <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#444444]">
              <h3 className="text-[#F0F0F0] font-semibold">Dados pessoais</h3>
              {!editando ? (
                <button
                  onClick={handleEditar}
                  className="flex items-center gap-1.5 text-sm text-[#CC0000] hover:text-[#E50000] transition-colors"
                >
                  <Edit2 size={14} />
                  Editar
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelar}
                    className="flex items-center gap-1.5 text-sm text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvar}
                    disabled={salvando}
                    className="flex items-center gap-1.5 text-sm bg-[#CC0000] text-white px-3 py-1.5 rounded hover:bg-[#E50000] transition-colors disabled:opacity-60"
                  >
                    <Check size={14} />
                    {salvando ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 space-y-5">
              {erro && (
                <p className="text-[#EF4444] text-sm bg-[#EF4444]/10 border border-[#EF4444]/30 rounded px-4 py-2">
                  {erro}
                </p>
              )}

              {/* Nome */}
              <div>
                <label className="flex items-center gap-2 text-[#A0A0A0] text-xs mb-2 uppercase tracking-wider">
                  <User size={12} />
                  Nome completo
                </label>
                {editando ? (
                  <input
                    value={nomeTemp}
                    onChange={(e) => setNomeTemp(e.target.value)}
                    className="w-full bg-[#1E1E1E] border border-[#444444] text-[#F0F0F0] rounded px-4 py-3 focus:outline-none focus:border-[#CC0000] transition-colors"
                  />
                ) : (
                  <p className="text-[#F0F0F0] px-4 py-3 bg-[#1E1E1E] rounded border border-[#333]">{nome}</p>
                )}
              </div>

              {/* Email — não editável */}
              <div>
                <label className="flex items-center gap-2 text-[#A0A0A0] text-xs mb-2 uppercase tracking-wider">
                  <Mail size={12} />
                  E-mail
                </label>
                <p className="text-[#A0A0A0] px-4 py-3 bg-[#1E1E1E] rounded border border-[#333] flex items-center justify-between">
                  {email}
                  <span className="text-xs text-[#444444]">não editável</span>
                </p>
              </div>

              {/* Telefone */}
              <div>
                <label className="flex items-center gap-2 text-[#A0A0A0] text-xs mb-2 uppercase tracking-wider">
                  <Phone size={12} />
                  Telefone (WhatsApp)
                </label>
                {editando ? (
                  <input
                    value={telefoneTemp}
                    onChange={(e) => setTelefoneTemp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-[#1E1E1E] border border-[#444444] text-[#F0F0F0] rounded px-4 py-3 focus:outline-none focus:border-[#CC0000] transition-colors"
                  />
                ) : (
                  <p className="text-[#F0F0F0] px-4 py-3 bg-[#1E1E1E] rounded border border-[#333]">
                    {telefone || <span className="text-[#A0A0A0]">Não informado</span>}
                  </p>
                )}
                {editando && (
                  <p className="text-[#A0A0A0] text-xs mt-1.5">
                    Usado para notificações de corrida via WhatsApp.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Próximas viagens */}
          <div id="proximas-viagens" className="bg-[#2B2B2B] border border-[#444444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="px-6 py-4 border-b border-[#444444]">
              <h3 className="text-[#F0F0F0] font-semibold">Próximas viagens</h3>
            </div>
            <div className="p-4 space-y-3">
              {proximasViagens.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar size={32} className="text-[#444] mx-auto mb-3" />
                  <p className="text-[#F0F0F0] text-sm font-medium">Nenhuma viagem agendada</p>
                  <p className="text-[#A0A0A0] text-xs mt-1">Solicite uma corrida para começar.</p>
                  <a href="/solicitar" className="inline-block mt-4 text-xs bg-[#CC0000] text-white px-4 py-2 rounded hover:bg-[#E50000] transition-colors">Solicitar corrida</a>
                </div>
              ) : (
                proximasViagens.map((v) => {
                  const dt = new Date(v.data_hora);
                  const data = dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
                  const hora = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                  const statusColor: Record<string, string> = {
                    pendente:   "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30",
                    agendada:   "text-[#A855F7] bg-[#A855F7]/10 border-[#A855F7]/30",
                    confirmada: "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/30",
                    em_rota:    "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30",
                  };
                  const statusLabel: Record<string, string> = {
                    pendente:   "Pendente",
                    agendada:   "Aguard. aceite",
                    confirmada: "Confirmada",
                    em_rota:    "Em rota",
                  };
                  return (
                    <div key={v.id} className="bg-[#1E1E1E] border border-[#333] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#444] text-xs font-mono">#{v.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 ${statusColor[v.status] ?? "text-[#A0A0A0] bg-[#333] border-[#444]"}`}>
                          {statusLabel[v.status] ?? v.status}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-sm text-[#F0F0F0]">
                          <MapPin size={13} className="text-[#CC0000] flex-shrink-0" />
                          <span className="truncate">{v.origem}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-[#A0A0A0]">
                          <MapPin size={13} className="text-[#A0A0A0] flex-shrink-0" />
                          <span className="truncate">{v.destino}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-xs text-[#A0A0A0]">
                        <span className="flex items-center gap-1"><Calendar size={11} />{data}</span>
                        <span className="flex items-center gap-1"><Clock size={11} />{hora}</span>
                        {v.valor && <span className="ml-auto text-[#F0F0F0] font-medium">R$ {v.valor.toFixed(2).replace(".", ",")}</span>}
                      </div>
                      {["pendente", "agendada"].includes(v.status) && (
                        <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
                          {confirmandoCancel === v.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[#A0A0A0] text-xs flex-1">Confirmar cancelamento?</span>
                              <button
                                onClick={() => handleCancelarViagem(v.id)}
                                disabled={cancelando === v.id}
                                className="text-xs px-3 py-1.5 bg-[#EF4444] text-white rounded hover:bg-[#DC2626] transition-colors disabled:opacity-60"
                              >
                                {cancelando === v.id ? "Cancelando..." : "Sim, cancelar"}
                              </button>
                              <button
                                onClick={() => setConfirmandoCancel(null)}
                                className="text-xs px-3 py-1.5 border border-[#444] text-[#A0A0A0] rounded hover:border-[#666] transition-colors"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmandoCancel(v.id)}
                              className="text-xs text-[#EF4444] hover:text-[#DC2626] transition-colors"
                            >
                              Cancelar viagem
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Viagens anteriores */}
          <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="px-6 py-4 border-b border-[#444444]">
              <h3 className="text-[#F0F0F0] font-semibold">Viagens anteriores</h3>
            </div>
            <div className="p-4 space-y-3">
              {viagensAnteriores.length === 0 ? (
                <div className="py-8 text-center">
                  <Car size={32} className="text-[#444] mx-auto mb-3" />
                  <p className="text-[#F0F0F0] text-sm font-medium">Nenhuma viagem realizada ainda</p>
                  <p className="text-[#A0A0A0] text-xs mt-1">Seu histórico aparecerá aqui após a primeira corrida.</p>
                </div>
              ) : (
                viagensAnteriores.map((v) => {
                  const dt = new Date(v.data_hora);
                  const data = dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
                  const hora = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                  const statusColor: Record<string, string> = {
                    concluida: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30",
                    cancelada: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30",
                  };
                  const statusLabel: Record<string, string> = {
                    concluida: "Concluída",
                    cancelada: "Cancelada",
                  };
                  const avAtiva = hover?.id === v.id ? hover.nota : (v.avaliacao ?? 0);
                  return (
                    <div key={v.id} className="bg-[#1E1E1E] border border-[#333] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#444] text-xs font-mono">#{v.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 ${statusColor[v.status] ?? "text-[#A0A0A0] bg-[#333] border-[#444]"}`}>
                          {statusLabel[v.status] ?? v.status}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-sm text-[#F0F0F0]">
                          <MapPin size={13} className="text-[#CC0000] flex-shrink-0" />
                          <span className="truncate">{v.origem}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-[#A0A0A0]">
                          <MapPin size={13} className="text-[#A0A0A0] flex-shrink-0" />
                          <span className="truncate">{v.destino}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-xs text-[#A0A0A0]">
                        <span className="flex items-center gap-1"><Calendar size={11} />{data}</span>
                        <span className="flex items-center gap-1"><Clock size={11} />{hora}</span>
                        {v.valor && <span className="ml-auto text-[#F0F0F0] font-medium">R$ {v.valor.toFixed(2).replace(".", ",")}</span>}
                      </div>
                      {v.status === "concluida" && (
                        <div className="mt-3 pt-3 border-t border-[#2A2A2A] space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[#A0A0A0] text-xs">
                              {salvandoAv === v.id ? "Salvando..." : v.avaliacao ? "Sua avaliação:" : "Avaliar:"}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <button
                                  key={i}
                                  disabled={!!v.avaliacao || salvandoAv === v.id}
                                  onClick={() => handleAvaliar(v.id, i)}
                                  onMouseEnter={() => !v.avaliacao && setHover({ id: v.id, nota: i })}
                                  onMouseLeave={() => !v.avaliacao && setHover(null)}
                                  className="transition-colors disabled:cursor-default"
                                >
                                  <Star
                                    size={16}
                                    className={i <= avAtiva ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#444444]"}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <a
                            href={`/solicitar?origem=${encodeURIComponent(v.origem)}&destino=${encodeURIComponent(v.destino)}`}
                            className="block w-full text-center text-xs border border-[#444] text-[#A0A0A0] py-2 rounded hover:border-[#CC0000] hover:text-[#CC0000] transition-colors"
                          >
                            Repetir esta viagem
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="px-6 py-4 border-b border-[#444444]">
              <h3 className="text-[#F0F0F0] font-semibold">Segurança</h3>
            </div>
            <div className="p-6 space-y-4">
              {senhaAtualizada && (
                <div className="bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-lg px-4 py-3 flex items-center gap-2">
                  <Check size={15} className="text-[#22C55E]" />
                  <span className="text-[#22C55E] text-sm">Senha atualizada com sucesso.</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#CC0000]/10 flex items-center justify-center">
                    <Shield size={16} className="text-[#CC0000]" />
                  </div>
                  <div>
                    <p className="text-[#F0F0F0] text-sm font-medium">Senha</p>
                    <p className="text-[#A0A0A0] text-xs">Altere sua senha de acesso</p>
                  </div>
                </div>
                {!alterandoSenha && (
                  <button
                    onClick={() => { setAlterandoSenha(true); setErroSenha(""); }}
                    className="text-sm border border-[#444444] text-[#A0A0A0] px-4 py-2 rounded hover:border-[#CC0000] hover:text-[#F0F0F0] transition-colors"
                  >
                    Alterar senha
                  </button>
                )}
              </div>

              {alterandoSenha && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[#A0A0A0] text-xs mb-1.5">Nova senha</label>
                    <input
                      type="password"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-[#1E1E1E] border border-[#444444] text-[#F0F0F0] rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] transition-colors placeholder-[#555]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A0A0A0] text-xs mb-1.5">Confirmar nova senha</label>
                    <input
                      type="password"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-[#1E1E1E] border border-[#444444] text-[#F0F0F0] rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] transition-colors placeholder-[#555]"
                    />
                  </div>
                  {erroSenha && (
                    <p className="text-[#EF4444] text-xs bg-[#EF4444]/10 border border-[#EF4444]/30 rounded px-3 py-2">{erroSenha}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleAlterarSenha}
                      disabled={salvandoSenha}
                      className="flex-1 bg-[#CC0000] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#E50000] transition-colors disabled:opacity-60"
                    >
                      {salvandoSenha ? "Salvando..." : "Salvar nova senha"}
                    </button>
                    <button
                      onClick={() => { setAlterandoSenha(false); setNovaSenha(""); setConfirmarSenha(""); setErroSenha(""); }}
                      className="px-4 py-2.5 border border-[#444] text-[#A0A0A0] rounded text-sm hover:border-[#666] transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
