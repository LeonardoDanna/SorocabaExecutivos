# Sorocaba Executivos

> **"Segurança, conforto e pontualidade"**

Plataforma web de transporte executivo premium atendendo Sorocaba/SP e todo o Estado de São Paulo. Reúne clientes, motoristas e administradores em um único sistema com design dark mode, identidade visual em vermelho e cinza, e deploy contínuo na Vercel.

🌐 **[sorocabaexecutivos.vercel.app](https://sorocabaexecutivos.vercel.app)**

---

## Sobre a empresa

A **Sorocaba Executivos** foi fundada por Vagner Rodrigues Alberto, que iniciou como motorista de aplicativo em 2017 e construiu uma carteira fiel de clientes pelo comprometimento e direção cuidadosa. Hoje conta com uma rede de motoristas experientes e frota de alto padrão, atendendo exclusivamente a região de Sorocaba e todo o Estado de São Paulo com agilidade, conforto e segurança.

---

## Serviços

- Carro Sedan e Van Executiva com Ar Condicionado
- Táxi Executivo e Transfer
- Atendimento nos aeroportos Viracopos (VCP), Congonhas (CGH) e Guarulhos (GRU)
- Transfer para todas as cidades do Estado de São Paulo
- Traslado entre aeroportos, residências, hotéis, spas, resorts e rodoviárias
- Eventos corporativos, congressos, reuniões e seminários
- Transporte de palestrantes, professores, VIPs e particulares

---

## Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Estilização | Tailwind CSS |
| Banco de dados | Supabase (PostgreSQL + RLS) |
| Autenticação | Supabase Auth |
| E-mail transacional | Resend |
| Mapas / Endereços | Google Places API |
| Relatórios Excel | ExcelJS |
| Hospedagem | Vercel |

---

## Estrutura do projeto

```
app/
├── page.tsx                        # Landing page pública
├── login/page.tsx                  # Login com e-mail e senha
├── cadastro/page.tsx               # Cadastro de cliente
├── esqueci-senha/page.tsx          # Recuperação de senha
├── atualizar-senha/page.tsx        # Redefinição de senha
├── solicitar/
│   ├── page.tsx                    # Formulário de solicitação de corrida
│   └── confirmacao/page.tsx        # Confirmação com dados do motorista e veículo
├── perfil/page.tsx                 # Perfil do cliente
├── motorista/page.tsx              # Painel do motorista
├── painel/page.tsx                 # Painel do administrador
├── not-found.tsx                   # Página 404
├── actions/
│   ├── admin.ts                    # Server actions do admin (criar viagem, motorista, Excel)
│   ├── auth.ts                     # Server actions de autenticação
│   └── viagens.ts                  # Server actions de viagens (solicitar, cancelar, confirmar)
├── api/
│   └── places/route.ts             # Proxy seguro para Google Places API
└── components/
    ├── Footer.tsx
    ├── LangDropdown.tsx            # Alternância de idioma PT/EN
    ├── Logo.tsx
    ├── Navbar.tsx
    ├── PlacesInput.tsx             # Input com autocomplete de endereços
    └── ScrollButton.tsx

lib/
├── email.ts                        # Notificação de nova viagem via Resend
└── supabase/
    ├── admin.ts                    # Cliente Supabase com service role (server-side)
    ├── client.ts                   # Cliente Supabase (browser)
    └── server.ts                   # Cliente Supabase (Server Components / Actions)
```

---

## Perfis de usuário

### Cliente
- Cadastro e login com e-mail e senha
- Solicitar corrida com origem, destino, paradas, data, horário e observações
- Autocomplete de endereços via Google Places
- Acompanhar status da viagem e dados do motorista atribuído (nome, telefone, veículo, avaliação)
- Cancelar viagens pendentes ou agendadas
- Editar perfil

### Motorista
- Painel pessoal com métricas por mês ou todos os tempos (viagens, faturamento, comissão de 10%)
- Agenda de próximas viagens com detalhes completos (paradas, observações, cliente)
- Histórico de viagens concluídas
- Controle de status online/offline

### Administrador
- **Dashboard** com KPIs em tempo real, pendentes sem motorista e próximas viagens
- **Fila de viagens** com atribuição de motorista, definição de valor e acompanhamento de status
- **Motoristas** — cadastro, edição, cadastro de veículo (modelo, placa, cor) e atribuição de perfil
- **Clientes** — busca e atribuição de perfil
- **Buscar** — pesquisa unificada de corridas, motoristas e clientes com filtros
- **Relatórios** — KPIs mensais ou todos os tempos, faturamento por motorista com controle de comissão paga, exportação Excel com 3 abas (Visão Geral, Por Motorista, Viagens Detalhadas)
- Notificação por e-mail a cada nova solicitação de viagem

---

## Banco de dados

### Tabelas principais

| Tabela | Campos relevantes |
|---|---|
| `perfis` | id, nome, telefone, perfil (`cliente \| motorista \| admin`), ativo, online, veiculo_modelo, veiculo_placa, veiculo_cor |
| `viagens` | id, cliente_id, motorista_id, origem, destino, paradas, data_hora, status, valor, observacoes |
| `avaliacoes` | id, viagem_id, avaliador_id, nota (1–5) |

### Status de viagem

`pendente` → `agendada` → `confirmada` → `em_rota` → `concluida` | `cancelada`

---

## Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_PLACES_KEY=
RESEND_API_KEY=
ADMIN_EMAIL=
NEXT_PUBLIC_APP_URL=https://sorocabaexecutivos.vercel.app
```

---

## Rodando localmente

```bash
npm install
npm run dev
```

---

## Licença

Projeto privado — Sorocaba Executivos © 2025
