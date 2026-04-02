import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    from: "Sorocaba Executivos <onboarding@resend.dev>",
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
