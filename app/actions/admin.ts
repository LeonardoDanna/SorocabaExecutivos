"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ExcelJS from "exceljs";

async function verificarAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.perfil !== "admin") {
    throw new Error("Acesso negado.");
  }
  return user;
}

export async function criarViagem(formData: FormData) {
  try {
    await verificarAdmin();
  } catch {
    return { erro: "Acesso negado." };
  }

  const clienteId    = formData.get("cliente_id") as string;
  const motoristaId  = formData.get("motorista_id") as string;
  const origem       = formData.get("origem") as string;
  const destino      = formData.get("destino") as string;
  const data         = formData.get("data") as string;
  const hora         = formData.get("hora") as string;
  const valor        = formData.get("valor") as string;
  const observacoes  = formData.get("observacoes") as string;

  if (!clienteId || !origem || !destino || !data || !hora) {
    return { erro: "Preencha todos os campos obrigatórios." };
  }

  const data_hora = new Date(`${data}T${hora}:00`).toISOString();

  if (new Date(data_hora) < new Date()) {
    return { erro: "Não é possível criar uma viagem no passado." };
  }

  const admin = createAdminClient();

  const { error } = await admin.from("viagens").insert({
    cliente_id:   clienteId,
    motorista_id: motoristaId || null,
    origem,
    destino,
    data_hora,
    status: motoristaId ? "agendada" : "pendente",
    valor: valor ? parseFloat(valor.replace(",", ".")) : null,
    observacoes: observacoes || null,
  });

  if (error) return { erro: "Erro ao criar viagem: " + error.message };
  return { sucesso: true };
}

export async function criarMotorista(formData: FormData) {
  try {
    await verificarAdmin();
  } catch {
    return { erro: "Acesso negado." };
  }

  const nome     = formData.get("nome") as string;
  const email    = formData.get("email") as string;
  const telefone = formData.get("telefone") as string;
  const senha    = formData.get("senha") as string;

  if (!nome || !email || !senha) {
    return { erro: "Preencha todos os campos obrigatórios." };
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, telefone, perfil: "motorista" },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { erro: "Já existe uma conta com esse e-mail." };
    }
    return { erro: "Erro ao criar motorista: " + error.message };
  }

  // Garante row em perfis caso o trigger não tenha rodado
  await admin.from("perfis").upsert({
    id: data.user.id,
    nome,
    telefone: telefone || null,
    perfil: "motorista",
  });

  return { sucesso: true };
}

export async function gerarRelatorioExcel() {
  try {
    await verificarAdmin();
  } catch {
    return { erro: "Acesso negado." };
  }

  const admin = createAdminClient();
  const { data: viagens } = await admin
    .from("viagens")
    .select("id, origem, destino, data_hora, status, valor, cliente:perfis!cliente_id(nome), motorista:perfis!motorista_id(nome)")
    .eq("status", "concluida")
    .order("data_hora", { ascending: false });

  const concluidas = viagens ?? [];
  const mes = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const porMotorista: Record<string, { nome: string; viagens: number; total: number }> = {};
  for (const v of concluidas) {
    if (!v.motorista) continue;
    const nome = (v.motorista as unknown as { nome: string }).nome;
    if (!porMotorista[nome]) porMotorista[nome] = { nome, viagens: 0, total: 0 };
    porMotorista[nome].viagens += 1;
    porMotorista[nome].total += v.valor ?? 0;
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "Sorocaba Executivos";
  wb.created = new Date();

  // ── Aba 1: Resumo ──────────────────────────────────────
  const wsResumo = wb.addWorksheet("Resumo por Motorista");
  wsResumo.columns = [
    { header: "Motorista",          key: "nome",     width: 30 },
    { header: "Viagens concluídas", key: "viagens",  width: 20 },
    { header: "Faturamento (R$)",   key: "total",    width: 20 },
    { header: "Comissão 10% (R$)",  key: "comissao", width: 20 },
  ];

  wsResumo.getRow(1).eachCell((cell) => {
    cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FFCC0000" } };
    cell.font      = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  wsResumo.getRow(1).height = 22;

  const ranking = Object.values(porMotorista).sort((a, b) => b.total - a.total);
  ranking.forEach((m, i) => {
    const row = wsResumo.addRow({ nome: m.nome, viagens: m.viagens, total: m.total, comissao: +(m.total * 0.1).toFixed(2) });
    const bg = i % 2 === 0 ? "FFF5F5F5" : "FFFFFFFF";
    row.eachCell((cell) => {
      cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cell.alignment = { horizontal: "center" };
    });
    row.getCell("total").numFmt   = "R$ #,##0.00";
    row.getCell("comissao").numFmt = "R$ #,##0.00";
  });

  const faturamentoTotal = ranking.reduce((acc, m) => acc + m.total, 0);
  const totalRow = wsResumo.addRow({
    nome: "TOTAL GERAL",
    viagens: ranking.reduce((acc, m) => acc + m.viagens, 0),
    total: faturamentoTotal,
    comissao: +(faturamentoTotal * 0.1).toFixed(2),
  });
  totalRow.eachCell((cell) => {
    cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFCC0000" } };
    cell.font  = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { horizontal: "center" };
  });
  totalRow.getCell("total").numFmt   = "R$ #,##0.00";
  totalRow.getCell("comissao").numFmt = "R$ #,##0.00";

  // Título aba 1
  wsResumo.insertRow(1, [`Relatório Sorocaba Executivos — ${mes}`]);
  wsResumo.mergeCells(1, 1, 1, 4);
  const t1 = wsResumo.getCell("A1");
  t1.font      = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  t1.alignment = { horizontal: "center", vertical: "middle" };
  t1.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A1A1A" } };
  wsResumo.getRow(1).height = 28;

  // ── Aba 2: Viagens Detalhadas ──────────────────────────
  const wsDetalhes = wb.addWorksheet("Viagens Detalhadas");
  wsDetalhes.columns = [
    { header: "#ID",        key: "id",        width: 12 },
    { header: "Cliente",    key: "cliente",   width: 25 },
    { header: "Motorista",  key: "motorista", width: 25 },
    { header: "Origem",     key: "origem",    width: 30 },
    { header: "Destino",    key: "destino",   width: 30 },
    { header: "Data/Hora",  key: "data_hora", width: 22 },
    { header: "Valor (R$)", key: "valor",     width: 15 },
  ];

  wsDetalhes.getRow(1).eachCell((cell) => {
    cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FFCC0000" } };
    cell.font      = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  wsDetalhes.getRow(1).height = 22;

  concluidas.forEach((v, i) => {
    const row = wsDetalhes.addRow({
      id:        v.id.slice(0, 8).toUpperCase(),
      cliente:   (v.cliente as unknown as { nome: string } | null)?.nome ?? "—",
      motorista: (v.motorista as unknown as { nome: string } | null)?.nome ?? "—",
      origem:    v.origem,
      destino:   v.destino,
      data_hora: new Date(v.data_hora).toLocaleString("pt-BR"),
      valor:     v.valor ?? 0,
    });
    const bg = i % 2 === 0 ? "FFF5F5F5" : "FFFFFFFF";
    row.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cell.alignment = { horizontal: "center" };
    });
    row.getCell("valor").numFmt = "R$ #,##0.00";
  });

  // Título aba 2
  wsDetalhes.insertRow(1, [`Relatório Sorocaba Executivos — ${mes}`]);
  wsDetalhes.mergeCells(1, 1, 1, 7);
  const t2 = wsDetalhes.getCell("A1");
  t2.font      = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  t2.alignment = { horizontal: "center", vertical: "middle" };
  t2.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A1A1A" } };
  wsDetalhes.getRow(1).height = 28;

  const buffer = await wb.xlsx.writeBuffer();
  return { base64: Buffer.from(buffer).toString("base64"), mes };
}
