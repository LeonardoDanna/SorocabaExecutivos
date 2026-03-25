# Sorocaba Executivos

> **"Segurança, conforto e pontualidade"**

Plataforma web de transporte executivo premium focada na região de Sorocaba/SP e cidades do estado de São Paulo. O projeto reúne clientes, motoristas e administradores em um único sistema com design dark mode e identidade visual em vermelho e cinza.

---

## Sobre a empresa

A **Sorocaba Executivos** foi fundada por Vagner Rodrigues Alberto, que iniciou como motorista de aplicativo em 2017 e construiu uma carteira fiel de clientes pelo comprometimento e direção cuidadosa. Hoje conta com uma rede de motoristas experientes e frota de alto padrão, atendendo exclusivamente a região de Sorocaba com agilidade, comodidade e segurança.

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
| Frontend | Next.js + Tailwind CSS |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | NextAuth / Supabase Auth |
| E-mail | Resend |
| WhatsApp | Z-API |
| Hospedagem | Vercel |
| Domínio | Hostinger |

---

## Perfis de usuário

### Cliente
- Cadastro e login com e-mail e senha
- Solicitar corrida (origem, destino, data e horário)
- Selecionar destinos pré-definidos (aeroportos, hotéis)
- Acompanhar status da viagem em tempo real
- Visualizar histórico de viagens
- Receber notificações via WhatsApp e e-mail

### Motorista
- Painel pessoal com resumo do dia
- Agenda semanal de viagens programadas
- Aceite ou recusa de novas solicitações
- Controle de status online/offline
- Métricas de desempenho e avaliações recebidas

### Supervisor / Admin
- Dashboard com KPIs em tempo real (solicitações ativas, motoristas disponíveis, faturamento, satisfação)
- Fila de viagens em aberto com atribuição manual a motoristas
- Mapa ao vivo com monitoramento de frota via GPS
- Gestão do status de cada motorista
- Alertas do sistema e relatórios gerenciais

---

## Telas implementadas

```
app/
├── page.tsx                       # Landing page
├── login/page.tsx                 # Login
├── cadastro/page.tsx              # Cadastro de cliente
├── solicitar/page.tsx             # Solicitação de corrida
├── solicitar/confirmacao/page.tsx # Confirmação da corrida
├── perfil/page.tsx                # Perfil do usuário
├── historico/page.tsx             # Histórico de viagens
├── motorista/page.tsx             # Painel do motorista
├── painel/page.tsx                # Painel do administrador
└── components/
    ├── Navbar.tsx
    ├── Footer.tsx
    └── Logo.tsx
```

---

## Banco de dados (ERD)

- **Usuários** — id, nome, e-mail, senha (hash), telefone, perfil (`cliente | motorista | admin`), created_at
- **Viagens** — id, cliente_id, motorista_id, origem, destino, data_hora, status (`pendente | confirmada | em_rota | concluída | cancelada`), created_at
- **Destinos Pré-definidos** — id, nome, endereço, tipo (`aeroporto | hotel | corporativo | outro`)
- **Avaliações** — id, viagem_id, avaliador_id, nota (1–5), comentário, created_at
- **Notificações** — id, usuário_id, viagem_id, tipo (`whatsapp | email | push`), mensagem, status (`enviada | falha`), created_at

---

## Ordem de desenvolvimento

1. Telas estáticas com Next.js e Tailwind
2. Conexão com Supabase e criação das tabelas do ERD
3. Autenticação com NextAuth ou Supabase Auth
4. Formulário de solicitação de corrida salvando no banco
5. Painel do administrador
6. Integração com Z-API (WhatsApp) e Resend (e-mail)

---

## Idiomas

O site suporta alternância entre **Português** e **Inglês**.

---

## Licença

Projeto privado — Sorocaba Executivos © 2024
