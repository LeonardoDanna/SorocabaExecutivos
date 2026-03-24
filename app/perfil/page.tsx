"use client";

import { useState } from "react";
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
} from "lucide-react";

// Mock — substituir por dados reais do Supabase depois
const usuarioMock = {
  nome: "Ana Paula Souza",
  email: "ana.paula@email.com",
  telefone: "(15) 99123-4567",
  perfil: "cliente",
  membro_desde: "Janeiro de 2025",
  total_viagens: 8,
  avaliacao_media: 4.9,
};

export default function PerfilPage() {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(usuarioMock.nome);
  const [telefone, setTelefone] = useState(usuarioMock.telefone);
  const [nomeTemp, setNomeTemp] = useState(nome);
  const [telefoneTemp, setTelefoneTemp] = useState(telefone);
  const [salvo, setSalvo] = useState(false);

  function handleEditar() {
    setNomeTemp(nome);
    setTelefoneTemp(telefone);
    setEditando(true);
  }

  function handleCancelar() {
    setEditando(false);
  }

  function handleSalvar() {
    setNome(nomeTemp);
    setTelefone(telefoneTemp);
    setEditando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  }

  const iniciais = nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
              <p className="text-[#A0A0A0] text-sm mt-0.5 capitalize">{usuarioMock.perfil}</p>
              <p className="text-[#A0A0A0] text-xs mt-1 flex items-center justify-center sm:justify-start gap-1">
                <Calendar size={12} />
                Membro desde {usuarioMock.membro_desde}
              </p>
            </div>
            <div className="flex sm:flex-col gap-6 sm:gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Car size={14} className="text-[#CC0000]" />
                  <span className="text-xl font-bold text-[#F0F0F0]">{usuarioMock.total_viagens}</span>
                </div>
                <p className="text-[#A0A0A0] text-xs">Viagens</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Star size={14} className="text-[#F59E0B]" />
                  <span className="text-xl font-bold text-[#F0F0F0]">{usuarioMock.avaliacao_media}</span>
                </div>
                <p className="text-[#A0A0A0] text-xs">Avaliação</p>
              </div>
            </div>
          </div>

          {/* Toast salvo */}
          {salvo && (
            <div className="bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-lg px-4 py-3 flex items-center gap-2">
              <Check size={16} className="text-[#22C55E]" />
              <span className="text-[#22C55E] text-sm">Perfil atualizado com sucesso.</span>
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
                    className="flex items-center gap-1.5 text-sm bg-[#CC0000] text-white px-3 py-1.5 rounded hover:bg-[#E50000] transition-colors"
                  >
                    <Check size={14} />
                    Salvar
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 space-y-5">
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
                  {usuarioMock.email}
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
                  <p className="text-[#F0F0F0] px-4 py-3 bg-[#1E1E1E] rounded border border-[#333]">{telefone}</p>
                )}
                {editando && (
                  <p className="text-[#A0A0A0] text-xs mt-1.5">
                    Usado para notificações de corrida via WhatsApp.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-[#2B2B2B] border border-[#444444] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="px-6 py-4 border-b border-[#444444]">
              <h3 className="text-[#F0F0F0] font-semibold">Segurança</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#CC0000]/10 flex items-center justify-center">
                    <Shield size={16} className="text-[#CC0000]" />
                  </div>
                  <div>
                    <p className="text-[#F0F0F0] text-sm font-medium">Senha</p>
                    <p className="text-[#A0A0A0] text-xs">Última alteração desconhecida</p>
                  </div>
                </div>
                <button className="text-sm border border-[#444444] text-[#A0A0A0] px-4 py-2 rounded hover:border-[#CC0000] hover:text-[#F0F0F0] transition-colors">
                  Alterar senha
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}