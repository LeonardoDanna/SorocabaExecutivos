# Sorocaba Executivos

> **"Segurança, conforto e pontualidade"**

Plataforma web de gestão de transporte executivo premium, atendendo Sorocaba/SP e todo o Estado de São Paulo. Reúne clientes, motoristas e administradores em um único sistema com notificações por e-mail e WhatsApp, design dark mode e deploy contínuo na Vercel.

---

## Sobre a empresa

A **Sorocaba Executivos** foi fundada por Vagner Rodrigues Alberto, que iniciou como motorista de aplicativo em 2017 e construiu uma carteira fiel de clientes pelo comprometimento e direção cuidadosa. Hoje conta com uma rede de motoristas experientes e frota de alto padrão, atendendo exclusivamente a região de Sorocaba e todo o Estado de São Paulo com agilidade, conforto e segurança.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js (App Router) |
| Estilização | Tailwind CSS |
| Banco de dados | Supabase (PostgreSQL + RLS) |
| Autenticação | Supabase Auth |
| E-mail transacional | Resend |
| WhatsApp | Z-API |
| Endereços | Google Places API |
| Relatórios | ExcelJS |
| Hospedagem | Vercel |

---

## Estrutura do projeto

```
app/
├── page.tsx                      # Landing page pública
├── login/page.tsx
├── cadastro/page.tsx
├── esqueci-senha/page.tsx
├── atualizar-senha/page.tsx
├── solicitar/
│   ├── page.tsx                  # Formulário de solicitação de corrida
│   └── confirmacao/page.tsx      # Confirmação com dados do motorista e veículo
├── perfil/page.tsx               # Painel do cliente
├── motorista/page.tsx            # Painel do motorista
├── painel/page.tsx               # Painel do administrador
├── not-found.tsx
├── actions/
│   ├── admin.ts                  # atribuirMotorista, cancelarViagemAdmin, criarViagem, criarMotorista, gerarRelatorioExcel
│   ├── auth.ts                   # login, logout, cadastro, esqueci-senha
│   ├── motorista.ts              # atualizarStatusViagem
│   └── viagens.ts                # solicitarCorrida, cancelarViagem, getConfirmacao
├── api/
│   └── places/route.ts           # Proxy seguro para Google Places API
└── components/
    ├── Footer.tsx
    ├── LangDropdown.tsx          # Alternância de idioma PT/EN/ES
    ├── Logo.tsx
    ├── Navbar.tsx
    ├── PlacesInput.tsx           # Input com autocomplete de endereços
    └── ScrollButton.tsx

lib/
├── email.ts                      # Todas as funções de e-mail (Resend)
├── whatsapp.ts                   # enviarMensagem via Z-API
└── supabase/
    ├── admin.ts                  # Cliente com service role (server-side)
    ├── client.ts                 # Cliente browser
    └── server.ts                 # Cliente para Server Components e Actions

proxy.ts                          # Middleware de proteção de rotas por perfil
```

---

## Perfis de usuário

### Cliente
- Cadastro e login com e-mail e senha
- Solicitar corrida: origem, destino, paradas, data, horário e observações
- Autocomplete de endereços via Google Places
- Acompanhar status da viagem em tempo real
- Ver dados do motorista atribuído (nome, telefone, veículo, avaliação média)
- Cancelar viagens pendentes ou agendadas
- Avaliar viagem concluída (nota 1–5)
- Editar perfil e trocar senha

### Motorista
- Painel com métricas por mês ou todos os tempos (viagens, faturamento, comissão)
- Agenda de próximas corridas com detalhes completos (paradas, observações, cliente)
- Histórico de viagens concluídas
- Aceitar ou recusar corridas atribuídas pelo admin
- Atualizar status da viagem (`confirmada` → `em_rota` → `concluida`)
- Toggle online/offline

### Administrador
- **Dashboard** com KPIs em tempo real: viagens pendentes, motoristas online, faturamento do mês
- **Fila de viagens**: atribuição de motorista, definição de valor, mudança de status
- **Motoristas**: cadastro, edição, dados de veículo (modelo, placa, cor), ativar/desativar
- **Clientes**: busca e visualização de perfil
- **Busca unificada**: corridas, motoristas e clientes com filtros
- **Relatórios**: KPIs mensais, faturamento por motorista com controle de comissão paga, exportação Excel com 3 abas

---

## Notificações

| Evento | E-mail | WhatsApp |
|---|---|---|
| Nova viagem criada | Admin | — |
| Motorista atribuído | Cliente · Motorista | Cliente · Motorista |
| Motorista aceita (`confirmada`) | — | Cliente |
| Motorista inicia (`em_rota`) | — | Cliente |
| Cliente cancela | Motorista | Motorista |
| Admin cancela | Cliente · Motorista | Cliente · Motorista |

---

## Banco de dados

### Tabelas

| Tabela | Campos relevantes |
|---|---|
| `perfis` | id, nome, telefone, perfil (`cliente \| motorista \| admin`), ativo, online, veiculo_modelo, veiculo_placa, veiculo_cor |
| `viagens` | id, cliente_id, motorista_id, origem, destino, paradas, data_hora, status, valor, observacoes |
| `avaliacoes` | id, viagem_id, avaliador_id, nota (1–5) |

### Fluxo de status

```
pendente → agendada → confirmada → em_rota → concluida
                                            ↘ cancelada
```

---

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Places
NEXT_PUBLIC_GOOGLE_PLACES_KEY=

# Resend (e-mails transacionais)
RESEND_API_KEY=
ADMIN_EMAIL=

# URL pública do app
NEXT_PUBLIC_APP_URL=

# WhatsApp via Z-API
ZAPI_INSTANCE_ID=
ZAPI_TOKEN=
ZAPI_CLIENT_TOKEN=
```

---

## Rodando localmente

```bash
npm install
npm run dev
```

---

## Licença

Projeto privado — Sorocaba Executivos © 2026
