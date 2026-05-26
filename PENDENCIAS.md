# Pendências — Sorocaba Executivos

> Atualizado em 26/05/2026.

---

## O que está pronto

| Área | Status |
|---|---|
| Auth completo (cadastro, login, logout, esqueci-senha, atualizar-senha) | ✅ |
| Proteção de rotas (`proxy.ts`) | ✅ |
| Solicitação de corrida + confirmação | ✅ |
| Perfil do cliente (editar, histórico, avaliação, cancelar, trocar senha) | ✅ |
| Painel do motorista (agenda, métricas, toggle online/offline, status de corrida) | ✅ |
| Painel do admin (dashboard, fila de viagens, gestão de motoristas, busca, relatórios) | ✅ |
| `criarViagem`, `criarMotorista`, `gerarRelatorioExcel` (server actions) | ✅ |
| `atribuirMotorista` (server action) | ✅ |
| `cancelarViagem`, `cancelarViagemAdmin` (server actions) | ✅ |
| `avaliarViagem` | ✅ |
| Google Places autocomplete | ✅ |
| Multilíngue PT/EN/ES | ✅ |
| Banco de dados + RLS | ✅ |
| `.env.example` | ✅ |
| **E-mails (Resend)** | |
| E-mail ao admin quando nova viagem é criada | ✅ |
| E-mail ao cliente quando motorista é atribuído | ✅ |
| E-mail ao motorista quando nova corrida é atribuída | ✅ |
| E-mail ao motorista quando cliente cancela | ✅ |
| E-mail ao cliente + motorista quando admin cancela | ✅ |
| **WhatsApp (Z-API)** | |
| WhatsApp ao atribuir motorista (cliente + motorista) | ✅ |
| WhatsApp quando motorista aceita (`confirmada` → cliente) | ✅ |
| WhatsApp quando motorista inicia corrida (`em_rota` → cliente) | ✅ |
| WhatsApp quando cliente cancela (→ motorista) | ✅ |
| WhatsApp quando admin cancela (→ cliente + motorista) | ✅ |

---

## O que ainda falta

### P1 — Deploy

- [ ] Configurar domínio no Vercel
- [ ] Adicionar todas as variáveis de ambiente no painel do Vercel (ver `.env.example`)
- [ ] Verificar domínio no Resend e trocar `onboarding@resend.dev` pelo e-mail da empresa

### Fora do escopo atual (futuro)

- Mapa ao vivo / GPS em tempo real
- Gestão de destinos pré-definidos no painel admin
