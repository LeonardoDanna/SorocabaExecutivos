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

  const clienteId    = (formData.get("cliente_id") as string || "").trim();
  const motoristaId  = (formData.get("motorista_id") as string || "").trim();
  const origem       = (formData.get("origem") as string || "").trim();
  const destino      = (formData.get("destino") as string || "").trim();
  const data         = (formData.get("data") as string || "").trim();
  const hora         = (formData.get("hora") as string || "").trim();
  const valor        = (formData.get("valor") as string || "").trim();
  const observacoes  = (formData.get("observacoes") as string || "").trim();

  if (!clienteId || !origem || !destino || !data || !hora) {
    return { erro: "Preencha todos os campos obrigatórios." };
  }

  if (origem.length > 300 || destino.length > 300)
    return { erro: "Endereço muito longo." };
  if (observacoes.length > 1000)
    return { erro: "Observações muito longas." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^\d{2}:\d{2}$/.test(hora))
    return { erro: "Data ou hora em formato inválido." };

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

  const nome     = (formData.get("nome") as string || "").trim();
  const email    = (formData.get("email") as string || "").trim().toLowerCase();
  const telefone = (formData.get("telefone") as string || "").trim();
  const senha    = (formData.get("senha") as string || "");

  if (!nome || !email || !senha) {
    return { erro: "Preencha todos os campos obrigatórios." };
  }

  if (nome.length > 100) return { erro: "Nome muito longo." };
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { erro: "E-mail inválido." };
  if (telefone && telefone.length > 20)
    return { erro: "Telefone muito longo." };
  if (senha.length < 8) return { erro: "A senha deve ter pelo menos 8 caracteres." };
  if (senha.length > 128) return { erro: "Senha muito longa." };

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

export async function gerarRelatorioExcel(mesFiltro: string | null = null) {
  try {
    await verificarAdmin();
  } catch {
    return { erro: "Acesso negado." };
  }

  const admin = createAdminClient();

  let query = admin
    .from("viagens")
    .select(`id, motorista_id, origem, destino, paradas, data_hora, status, valor, observacoes,
      cliente:perfis!cliente_id(nome, telefone),
      motorista:perfis!motorista_id(nome, telefone, veiculo_modelo, veiculo_placa, veiculo_cor)`)
    .eq("status", "concluida")
    .order("data_hora", { ascending: false });

  if (mesFiltro) {
    const [ano, mes] = mesFiltro.split("-").map(Number);
    const proximoMes = mes === 12 ? `${ano + 1}-01` : `${ano}-${String(mes + 1).padStart(2, "0")}`;
    query = query
      .gte("data_hora", `${mesFiltro}-01T00:00:00.000Z`)
      .lt("data_hora", `${proximoMes}-01T00:00:00.000Z`);
  }

  const { data: viagens } = await query;
  const concluidas = viagens ?? [];

  const nomesMes = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const periodoLabel = mesFiltro
    ? `${nomesMes[parseInt(mesFiltro.slice(5, 7)) - 1]} ${mesFiltro.slice(0, 4)}`
    : "Todos os tempos";

  // ── Calcular KPIs ─────────────────────────────────────
  const faturamentoTotal = concluidas.reduce((acc, v) => acc + (v.valor ?? 0), 0);
  const comissaoTotal = faturamentoTotal * 0.1;
  const ticketMedio = concluidas.filter(v => v.valor).length
    ? faturamentoTotal / concluidas.filter(v => v.valor).length
    : 0;

  type MotoristaRow = { nome: string; telefone: string | null; veiculo_modelo: string | null; veiculo_placa: string | null; veiculo_cor: string | null };
  const porMotorista: Record<string, { id: string; nome: string; telefone: string | null; veiculo: string; viagens: number; total: number }> = {};
  for (const v of concluidas) {
    if (!v.motorista_id || !v.valor) continue;
    const m = v.motorista as unknown as MotoristaRow | null;
    const nome = m?.nome ?? "Sem nome";
    const tel = m?.telefone ?? null;
    const veiculo = [m?.veiculo_modelo, m?.veiculo_placa, m?.veiculo_cor].filter(Boolean).join(" · ") || "—";
    if (!porMotorista[v.motorista_id]) porMotorista[v.motorista_id] = { id: v.motorista_id, nome, telefone: tel, veiculo, viagens: 0, total: 0 };
    porMotorista[v.motorista_id].viagens += 1;
    porMotorista[v.motorista_id].total += v.valor;
  }
  const ranking = Object.values(porMotorista).sort((a, b) => b.total - a.total);

  const wb = new ExcelJS.Workbook();
  wb.creator = "Sorocaba Executivos";
  wb.created = new Date();

  // helpers
  function headerStyle(cell: ExcelJS.Cell) {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFCC0000" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  }
  function titleStyle(cell: ExcelJS.Cell) {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A1A1A" } };
    cell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  }
  function totalStyle(cell: ExcelJS.Cell) {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFCC0000" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { horizontal: "center" };
  }
  const brl = "R$ #,##0.00";
  const rowBg = (i: number) => i % 2 === 0 ? "FFF5F5F5" : "FFFFFFFF";

  // ── Aba 1: Visão Geral ─────────────────────────────────
  const wsGeral = wb.addWorksheet("Visão Geral");
  wsGeral.columns = [
    { key: "label", width: 30 },
    { key: "valor", width: 25 },
  ];

  wsGeral.addRow([`Relatório Sorocaba Executivos`]);
  wsGeral.mergeCells(1, 1, 1, 2);
  titleStyle(wsGeral.getCell("A1"));
  wsGeral.getRow(1).height = 30;

  wsGeral.addRow([`Período: ${periodoLabel}`]);
  wsGeral.mergeCells(2, 1, 2, 2);
  wsGeral.getCell("A2").font = { italic: true, color: { argb: "FF888888" }, size: 10 };
  wsGeral.getCell("A2").alignment = { horizontal: "center" };
  wsGeral.addRow([]);

  const kpis = [
    ["Faturamento Total", faturamentoTotal],
    ["Comissão Admin (10%)", comissaoTotal],
    ["Viagens Concluídas", concluidas.length],
    ["Ticket Médio", ticketMedio],
    ["Motoristas ativos", ranking.length],
    ["Exportado em", new Date().toLocaleString("pt-BR")],
  ];
  kpis.forEach(([label, valor], i) => {
    const row = wsGeral.addRow({ label, valor });
    const bg = rowBg(i);
    row.eachCell(cell => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cell.alignment = { horizontal: "left", indent: 1 };
    });
    if (typeof valor === "number" && i < 4) {
      row.getCell("valor").numFmt = brl;
    }
  });

  // ── Aba 2: Faturamento por Motorista ──────────────────
  const wsResumo = wb.addWorksheet("Por Motorista");
  wsResumo.columns = [
    { header: "Motorista",          key: "nome",     width: 34 },
    { header: "Telefone",           key: "telefone", width: 22 },
    { header: "Veículo",            key: "veiculo",  width: 40 },
    { header: "Viagens",            key: "viagens",  width: 14 },
    { header: "Faturamento (R$)",   key: "total",    width: 22 },
    { header: "Comissão 10% (R$)",  key: "comissao", width: 22 },
  ];

  wsResumo.getRow(1).eachCell((cell) => { headerStyle(cell); cell.alignment = { vertical: "middle", horizontal: "center", indent: 1 }; });
  wsResumo.getRow(1).height = 26;

  ranking.forEach((m, i) => {
    const row = wsResumo.addRow({
      nome: m.nome,
      telefone: m.telefone ?? "—",
      veiculo: m.veiculo,
      viagens: m.viagens,
      total: m.total,
      comissao: +(m.total * 0.1).toFixed(2),
    });
    const bg = rowBg(i);
    row.height = 18;
    row.eachCell(cell => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } }; cell.alignment = { horizontal: "left", indent: 1 }; });
    row.getCell("viagens").alignment = { horizontal: "center" };
    row.getCell("total").numFmt = brl; row.getCell("total").alignment = { horizontal: "center" };
    row.getCell("comissao").numFmt = brl; row.getCell("comissao").alignment = { horizontal: "center" };
  });

  const totalRow = wsResumo.addRow({
    nome: "TOTAL GERAL", telefone: "", veiculo: "",
    viagens: ranking.reduce((a, m) => a + m.viagens, 0),
    total: faturamentoTotal,
    comissao: +(comissaoTotal).toFixed(2),
  });
  totalRow.eachCell(totalStyle);
  totalRow.getCell("total").numFmt = brl;
  totalRow.getCell("comissao").numFmt = brl;

  wsResumo.insertRow(1, [`Relatório Sorocaba Executivos — ${periodoLabel}`]);
  wsResumo.mergeCells(1, 1, 1, 6);
  titleStyle(wsResumo.getCell("A1"));
  wsResumo.getRow(1).height = 28;

  // ── Aba 3: Viagens Detalhadas ─────────────────────────
  const wsDetalhes = wb.addWorksheet("Viagens Detalhadas");
  wsDetalhes.columns = [
    { header: "#ID",           key: "id",        width: 14 },
    { header: "Data/Hora",     key: "data_hora", width: 22 },
    { header: "Cliente",       key: "cliente",   width: 26 },
    { header: "Motorista",     key: "motorista", width: 26 },
    { header: "Veículo",       key: "veiculo",   width: 38 },
    { header: "Origem",        key: "origem",    width: 42 },
    { header: "Destino",       key: "destino",   width: 42 },
    { header: "Paradas",       key: "paradas",   width: 36 },
    { header: "Observações",   key: "obs",       width: 32 },
    { header: "Valor (R$)",    key: "valor",     width: 16 },
  ];

  wsDetalhes.getRow(1).eachCell((cell) => { headerStyle(cell); cell.alignment = { vertical: "middle", horizontal: "center", indent: 1 }; });
  wsDetalhes.getRow(1).height = 26;

  concluidas.forEach((v, i) => {
    const cli = v.cliente as unknown as { nome: string } | null;
    const mot = v.motorista as unknown as MotoristaRow | null;
    const veiculo = [mot?.veiculo_modelo, mot?.veiculo_placa, mot?.veiculo_cor].filter(Boolean).join(" · ") || "—";
    const paradas = Array.isArray(v.paradas) && (v.paradas as string[]).length > 0
      ? (v.paradas as string[]).join(" → ")
      : "—";
    const row = wsDetalhes.addRow({
      id:        v.id.slice(0, 8).toUpperCase(),
      data_hora: new Date(v.data_hora).toLocaleString("pt-BR"),
      cliente:   cli?.nome ?? "—",
      motorista: mot?.nome ?? "—",
      veiculo,
      origem:    v.origem,
      destino:   v.destino,
      paradas,
      obs:       (v.observacoes as string | null) ?? "—",
      valor:     v.valor ?? 0,
    });
    const bg = rowBg(i);
    row.height = 18;
    row.eachCell(cell => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } }; cell.alignment = { horizontal: "left", indent: 1, wrapText: false }; });
    row.getCell("valor").numFmt = brl;
    row.getCell("valor").alignment = { horizontal: "center" };
  });

  wsDetalhes.insertRow(1, [`Relatório Sorocaba Executivos — ${periodoLabel}`]);
  wsDetalhes.mergeCells(1, 1, 1, 10);
  titleStyle(wsDetalhes.getCell("A1"));
  wsDetalhes.getRow(1).height = 28;

  const buffer = await wb.xlsx.writeBuffer();
  return { base64: Buffer.from(buffer).toString("base64"), periodoLabel };
}
