import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Sorocaba Executivos <onboarding@resend.dev>";

function formatarDataHora(dataHora: string) {
  const dt = new Date(dataHora);
  return {
    data: dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }),
    hora: dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export async function notificarClienteCorridaConfirmada({
  clienteEmail,
  clienteNome,
  motoristaNome,
  motoristaFone,
  veiculoInfo,
  origem,
  destino,
  dataHora,
}: {
  clienteEmail: string;
  clienteNome: string;
  motoristaNome: string;
  motoristaFone: string | null;
  veiculoInfo: string;
  origem: string;
  destino: string;
  dataHora: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  const { data, hora } = formatarDataHora(dataHora);

  await resend.emails.send({
    from: FROM,
    to: clienteEmail,
    subject: `Sua corrida está confirmada — ${data} às ${hora}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#1a1a1a;color:#f0f0f0;border-radius:12px;overflow:hidden">
        <div style="background:#CC0000;padding:20px 24px">
          <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7)">Sorocaba Executivos</p>
          <h1 style="margin:6px 0 0;font-size:20px;font-weight:700">Corrida confirmada!</h1>
        </div>
        <div style="padding:24px">
          <p style="margin:0 0 20px;color:#a0a0a0">Olá, <strong style="color:#f0f0f0">${clienteNome}</strong>. Seu motorista foi atribuído.</p>

          <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Motorista</p>
          <p style="margin:0 0 4px;font-size:16px;font-weight:600">${motoristaNome}</p>
          ${motoristaFone ? `<p style="margin:0 0 20px;font-size:13px;color:#a0a0a0">WhatsApp: <a href="https://wa.me/55${motoristaFone.replace(/\D/g,"")}" style="color:#CC0000">${motoristaFone}</a></p>` : "<div style='margin-bottom:20px'></div>"}

          ${veiculoInfo ? `<p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Veículo</p><p style="margin:0 0 20px;font-size:14px">${veiculoInfo}</p>` : ""}

          <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Trajeto</p>
          <p style="margin:0 0 4px;font-size:14px">📍 ${origem}</p>
          <p style="margin:0 0 20px;font-size:14px">🏁 ${destino}</p>

          <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Data / Hora</p>
          <p style="margin:0 0 24px;font-size:14px">${data} às ${hora}</p>

          <p style="margin:0;font-size:12px;color:#555;border-top:1px solid #333;padding-top:16px">Segurança, conforto e pontualidade — Sorocaba Executivos</p>
        </div>
      </div>
    `,
  });
}

export async function notificarMotoristaNovaViagem({
  motoristaEmail,
  motoristaNome,
  clienteNome,
  clienteFone,
  origem,
  destino,
  dataHora,
  valor,
}: {
  motoristaEmail: string;
  motoristaNome: string;
  clienteNome: string;
  clienteFone: string | null;
  origem: string;
  destino: string;
  dataHora: string;
  valor: number | null;
}) {
  if (!process.env.RESEND_API_KEY) return;
  const { data, hora } = formatarDataHora(dataHora);

  await resend.emails.send({
    from: FROM,
    to: motoristaEmail,
    subject: `Nova corrida atribuída — ${data} às ${hora}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#1a1a1a;color:#f0f0f0;border-radius:12px;overflow:hidden">
        <div style="background:#CC0000;padding:20px 24px">
          <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7)">Sorocaba Executivos</p>
          <h1 style="margin:6px 0 0;font-size:20px;font-weight:700">Nova corrida para você</h1>
        </div>
        <div style="padding:24px">
          <p style="margin:0 0 20px;color:#a0a0a0">Olá, <strong style="color:#f0f0f0">${motoristaNome}</strong>. Uma corrida foi atribuída a você.</p>

          <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Cliente</p>
          <p style="margin:0 0 4px;font-size:16px;font-weight:600">${clienteNome}</p>
          ${clienteFone ? `<p style="margin:0 0 20px;font-size:13px;color:#a0a0a0">WhatsApp: <a href="https://wa.me/55${clienteFone.replace(/\D/g,"")}" style="color:#CC0000">${clienteFone}</a></p>` : "<div style='margin-bottom:20px'></div>"}

          <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Trajeto</p>
          <p style="margin:0 0 4px;font-size:14px">📍 ${origem}</p>
          <p style="margin:0 0 20px;font-size:14px">🏁 ${destino}</p>

          <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Data / Hora</p>
          <p style="margin:0 0 4px;font-size:14px">${data} às ${hora}</p>

          ${valor ? `<p style="margin:0 0 24px;font-size:14px;color:#a0a0a0">Valor: <strong style="color:#f0f0f0">R$ ${valor.toFixed(2).replace(".", ",")}</strong></p>` : "<div style='margin-bottom:24px'></div>"}

          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/motorista"
             style="display:inline-block;background:#CC0000;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">
            Ver no painel →
          </a>

          <p style="margin:24px 0 0;font-size:12px;color:#555;border-top:1px solid #333;padding-top:16px">Segurança, conforto e pontualidade — Sorocaba Executivos</p>
        </div>
      </div>
    `,
  });
}

export async function notificarMotoristaViagemCancelada({
  motoristaEmail,
  motoristaNome,
  clienteNome,
  origem,
  destino,
  dataHora,
}: {
  motoristaEmail: string;
  motoristaNome: string;
  clienteNome: string;
  origem: string;
  destino: string;
  dataHora: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  const { data, hora } = formatarDataHora(dataHora);

  await resend.emails.send({
    from: FROM,
    to: motoristaEmail,
    subject: `Viagem cancelada — ${data} às ${hora}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#1a1a1a;color:#f0f0f0;border-radius:12px;overflow:hidden">
        <div style="background:#CC0000;padding:20px 24px">
          <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7)">Sorocaba Executivos</p>
          <h1 style="margin:6px 0 0;font-size:20px;font-weight:700">Viagem cancelada</h1>
        </div>
        <div style="padding:24px">
          <p style="margin:0 0 20px;color:#a0a0a0">Olá, <strong style="color:#f0f0f0">${motoristaNome}</strong>. Uma corrida atribuída a você foi cancelada.</p>

          <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Cliente</p>
          <p style="margin:0 0 20px;font-size:16px;font-weight:600">${clienteNome}</p>

          <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Trajeto</p>
          <p style="margin:0 0 4px;font-size:14px">📍 ${origem}</p>
          <p style="margin:0 0 20px;font-size:14px">🏁 ${destino}</p>

          <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Data / Hora</p>
          <p style="margin:0 0 24px;font-size:14px">${data} às ${hora}</p>

          <p style="margin:0;font-size:12px;color:#555;border-top:1px solid #333;padding-top:16px">Sorocaba Executivos — Segurança, conforto e pontualidade</p>
        </div>
      </div>
    `,
  });
}

export async function notificarClienteViagemCancelada({
  clienteEmail,
  clienteNome,
  origem,
  destino,
  dataHora,
}: {
  clienteEmail: string;
  clienteNome: string;
  origem: string;
  destino: string;
  dataHora: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  const { data, hora } = formatarDataHora(dataHora);

  await resend.emails.send({
    from: FROM,
    to: clienteEmail,
    subject: `Sua viagem foi cancelada — ${data} às ${hora}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#1a1a1a;color:#f0f0f0;border-radius:12px;overflow:hidden">
        <div style="background:#CC0000;padding:20px 24px">
          <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7)">Sorocaba Executivos</p>
          <h1 style="margin:6px 0 0;font-size:20px;font-weight:700">Viagem cancelada</h1>
        </div>
        <div style="padding:24px">
          <p style="margin:0 0 20px;color:#a0a0a0">Olá, <strong style="color:#f0f0f0">${clienteNome}</strong>. Sua viagem foi cancelada pela central.</p>

          <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Trajeto</p>
          <p style="margin:0 0 4px;font-size:14px">📍 ${origem}</p>
          <p style="margin:0 0 20px;font-size:14px">🏁 ${destino}</p>

          <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Data / Hora</p>
          <p style="margin:0 0 24px;font-size:14px">${data} às ${hora}</p>

          <p style="margin:0 0 16px;font-size:13px;color:#a0a0a0">Em caso de dúvidas, entre em contato com a central.</p>

          <p style="margin:0;font-size:12px;color:#555;border-top:1px solid #333;padding-top:16px">Sorocaba Executivos — Segurança, conforto e pontualidade</p>
        </div>
      </div>
    `,
  });
}

export async function notificarAdminNovaViagem({
  viagemId,
  cliente,
  origem,
  destino,
  dataHora,
}: {
  viagemId: string;
  cliente: string;
  origem: string;
  destino: string;
  dataHora: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !process.env.RESEND_API_KEY) return;

  const data = new Date(dataHora).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  const hora = new Date(dataHora).toLocaleTimeString("pt-BR", {
    hour: "2-digit", minute: "2-digit",
  });

  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `Nova solicitação de viagem — ${cliente}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#1a1a1a;color:#f0f0f0;border-radius:12px;overflow:hidden">
        <div style="background:#CC0000;padding:20px 24px">
          <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7)">Sorocaba Executivos</p>
          <h1 style="margin:6px 0 0;font-size:20px;font-weight:700">Nova solicitação de viagem</h1>
        </div>
        <div style="padding:24px">
          <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Cliente</p>
          <p style="margin:0 0 20px;font-size:16px;font-weight:600">${cliente}</p>

          <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Trajeto</p>
          <p style="margin:0 0 4px;font-size:14px">📍 ${origem}</p>
          <p style="margin:0 0 20px;font-size:14px">🏁 ${destino}</p>

          <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Data / Hora</p>
          <p style="margin:0 0 24px;font-size:14px">${data} às ${hora}</p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/painel"
             style="display:inline-block;background:#CC0000;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">
            Atribuir motorista →
          </a>

          <p style="margin:24px 0 0;font-size:11px;color:#555">ID: ${viagemId}</p>
        </div>
      </div>
    `,
  });
}
