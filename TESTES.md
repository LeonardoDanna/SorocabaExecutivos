# Casos de Uso para Testes — Sorocaba Executivos

> Ambiente: https://sorocabaexecutivos.vercel.app  
> Atualizado em: 26/05/2026

---

## Como usar este documento

- Executar cada caso em ordem dentro do fluxo
- Marcar **✅ OK**, **❌ Falhou** ou **⚠️ Parcial** ao lado de cada item
- Registrar observações na coluna de notas quando necessário

---

## 1. Autenticação

### 1.1 Cadastro de cliente

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar `/cadastro` | Formulário exibido |
| 2 | Submeter com campos vazios | Mensagem de erro de validação |
| 3 | Submeter com e-mail inválido | Mensagem de erro de formato |
| 4 | Submeter com senha curta (< 6 caracteres) | Mensagem de erro de senha |
| 5 | Submeter com dados válidos (nome, e-mail, senha, telefone) | Redireciona para `/perfil` |
| 6 | Tentar cadastrar com e-mail já existente | Mensagem de erro de e-mail duplicado |

---

### 1.2 Login

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar `/login` | Formulário exibido |
| 2 | Submeter com senha incorreta | Mensagem de credenciais inválidas |
| 3 | Fazer login como **cliente** | Redireciona para `/perfil` |
| 4 | Fazer login como **motorista** | Redireciona para `/motorista` |
| 5 | Fazer login como **admin** | Redireciona para `/painel` |

---

### 1.3 Recuperação de senha

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar `/esqueci-senha` | Formulário exibido |
| 2 | Submeter e-mail não cadastrado | Mensagem genérica (sem revelar se existe) |
| 3 | Submeter e-mail válido | Mensagem de confirmação de envio |
| 4 | Clicar no link do e-mail recebido | Redireciona para `/atualizar-senha` |
| 5 | Submeter nova senha | Senha atualizada, redireciona para `/perfil` |

---

### 1.4 Proteção de rotas

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar `/perfil` sem estar logado | Redireciona para `/login` |
| 2 | Acessar `/motorista` logado como cliente | Redireciona (acesso negado) |
| 3 | Acessar `/painel` logado como motorista | Redireciona (acesso negado) |
| 4 | Acessar `/painel` logado como admin | Painel exibido normalmente |

---

## 2. Fluxo do Cliente

### 2.1 Solicitar corrida

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar `/solicitar` logado como cliente | Formulário exibido |
| 2 | Digitar origem | Autocomplete do Google Places sugere endereços |
| 3 | Submeter com campos obrigatórios vazios | Mensagem de erro |
| 4 | Submeter com data/hora no passado | Mensagem de erro |
| 5 | Adicionar parada intermediária | Campo de parada exibido e salvo |
| 6 | Submeter com todos os dados válidos | Redireciona para `/solicitar/confirmacao?id=...` |
| 7 | *(Verificar)* Admin recebe e-mail de nova viagem | E-mail recebido com dados da corrida |

---

### 2.2 Página de confirmação

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar confirmação logo após solicitar | Status `pendente` exibido |
| 2 | Admin atribui motorista | Status atualiza para `agendada` |
| 3 | *(Verificar)* Cliente recebe e-mail de atribuição | E-mail recebido com nome e veículo do motorista |
| 4 | *(Verificar)* Cliente recebe WhatsApp de atribuição | Mensagem recebida com detalhes da corrida |
| 5 | Motorista aceita corrida | Status atualiza para `confirmada` |
| 6 | *(Verificar)* Cliente recebe WhatsApp de aceite | Mensagem recebida confirmando o aceite |
| 7 | Motorista inicia corrida | Status atualiza para `em_rota` |
| 8 | *(Verificar)* Cliente recebe WhatsApp "a caminho" | Mensagem recebida informando que motorista saiu |

---

### 2.3 Cancelar corrida (pelo cliente)

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Cancelar corrida com status `pendente` | Status muda para `cancelada` |
| 2 | Cancelar corrida com status `agendada` | Status muda para `cancelada` |
| 3 | Tentar cancelar corrida `confirmada` | Botão de cancelar não disponível / erro |
| 4 | *(Verificar, se motorista atribuído)* Motorista recebe e-mail | E-mail de cancelamento recebido |
| 5 | *(Verificar, se motorista atribuído)* Motorista recebe WhatsApp | Mensagem de cancelamento recebida |

---

### 2.4 Avaliação de corrida

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar histórico no `/perfil` | Lista de viagens exibida |
| 2 | Avaliar corrida com status `concluida` | Nota registrada (1–5) |
| 3 | Tentar avaliar a mesma corrida novamente | Avaliação bloqueada |
| 4 | *(Verificar)* Média do motorista atualiza no painel admin | Nota refletida nas métricas |

---

### 2.5 Editar perfil

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Alterar nome e telefone em `/perfil` | Dados salvos |
| 2 | Trocar senha com senha atual incorreta | Mensagem de erro |
| 3 | Trocar senha com senha atual correta | Senha atualizada |

---

## 3. Fluxo do Motorista

### 3.1 Painel e agenda

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Fazer login como motorista | Painel exibido com métricas do mês |
| 2 | Alternar para "todos os tempos" | Métricas totais exibidas |
| 3 | Verificar agenda de próximas corridas | Corridas futuras listadas com detalhes |
| 4 | Verificar histórico de corridas concluídas | Lista exibida |

---

### 3.2 Toggle online/offline

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Ativar toggle para "online" | Status muda para online (verde) |
| 2 | *(Verificar)* Admin vê motorista online no painel | Contador de motoristas online atualiza |
| 3 | Desativar toggle para "offline" | Status muda para offline |

---

### 3.3 Aceitar / recusar corrida

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Com corrida atribuída, clicar em "Aceitar" | Status muda para `confirmada` |
| 2 | *(Verificar)* Cliente recebe WhatsApp de aceite | Mensagem recebida |
| 3 | Com corrida atribuída, clicar em "Recusar" | Corrida volta ao status anterior / admin é notificado |

---

### 3.4 Atualizar status da corrida

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Mudar status para `em_rota` | Status atualizado |
| 2 | *(Verificar)* Cliente recebe WhatsApp "a caminho" | Mensagem recebida |
| 3 | Mudar status para `concluida` | Status atualizado, corrida vai para histórico |
| 4 | Tentar atualizar corrida de outro motorista | Erro de acesso negado |

---

## 4. Fluxo do Administrador

### 4.1 Dashboard

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar `/painel` como admin | KPIs exibidos: viagens pendentes, motoristas online, faturamento |
| 2 | Verificar fila de viagens | Viagens pendentes listadas |
| 3 | Verificar lista de motoristas | Motoristas cadastrados com status |

---

### 4.2 Atribuir motorista

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Selecionar viagem pendente | Detalhes exibidos |
| 2 | Atribuir motorista e definir valor | Status muda para `agendada` |
| 3 | *(Verificar)* Cliente recebe e-mail | E-mail com dados do motorista e veículo |
| 4 | *(Verificar)* Motorista recebe e-mail | E-mail com dados da corrida e cliente |
| 5 | *(Verificar)* Cliente recebe WhatsApp | Mensagem com dados do motorista |
| 6 | *(Verificar)* Motorista recebe WhatsApp | Mensagem com dados do cliente e rota |

---

### 4.3 Cancelar corrida (pelo admin)

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Cancelar corrida sem motorista atribuído | Status muda para `cancelada` |
| 2 | Cancelar corrida com motorista atribuído | Status muda para `cancelada` |
| 3 | *(Verificar)* Cliente recebe e-mail | E-mail de cancelamento pelo admin |
| 4 | *(Verificar)* Cliente recebe WhatsApp | Mensagem de cancelamento |
| 5 | *(Verificar)* Motorista recebe e-mail | E-mail de cancelamento |
| 6 | *(Verificar)* Motorista recebe WhatsApp | Mensagem de cancelamento |

---

### 4.4 Gestão de motoristas

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Cadastrar novo motorista (nome, e-mail, senha, telefone, veículo) | Motorista criado e aparece na lista |
| 2 | Editar dados do motorista (modelo, placa, cor do veículo) | Dados salvos |
| 3 | Desativar motorista | Motorista não aparece mais para atribuição |
| 4 | Reativar motorista | Motorista volta a aparecer para atribuição |

---

### 4.5 Busca unificada

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Buscar por nome de cliente | Cliente encontrado com histórico |
| 2 | Buscar por nome de motorista | Motorista encontrado |
| 3 | Buscar por ID ou trecho de endereço de corrida | Corrida encontrada |
| 4 | Buscar termo inexistente | Resultado vazio sem erro |

---

### 4.6 Relatórios

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Acessar relatório do mês atual | KPIs mensais exibidos |
| 2 | Exportar Excel | Arquivo `.xlsx` baixado com 3 abas |
| 3 | Verificar aba de comissões | Motoristas, valores e status de pagamento |
| 4 | Marcar comissão como paga | Status atualizado |
| 5 | Exportar Excel após marcar comissão | Apenas comissões não pagas na exportação |

---

## 5. Casos de borda

| # | Cenário | Resultado esperado |
|---|---|---|
| 1 | Cliente sem telefone cadastrado solicita corrida | Corrida criada; WhatsApp não enviado (sem erro) |
| 2 | Motorista sem telefone recebe corrida | Atribuição funciona; WhatsApp não enviado (sem erro) |
| 3 | Sessão expirada ao submeter formulário | Redireciona para `/login` sem perder dados de tela |
| 4 | Campo "paradas" com mais de 10 itens | Erro de validação |
| 5 | Endereço com mais de 300 caracteres | Erro de validação |
| 6 | Observações com mais de 500 caracteres | Erro de validação |
| 7 | Acessar `/solicitar/confirmacao` com ID de outra pessoa | Retorna not found |
| 8 | Dois admins atribuem motorista ao mesmo tempo | Último a salvar prevalece; sem erro 500 |

---

## 6. Checklist final antes do deploy em produção

- [ ] Variáveis de ambiente configuradas no Vercel (todas as do `.env.example`)
- [ ] Domínio verificado no Resend (`from` trocado para e-mail da empresa)
- [ ] WhatsApp conectado na Z-API (QR Code lido no painel)
- [ ] Supabase: Site URL e Redirect URLs apontando para o domínio de produção
- [ ] Testar fluxo completo de corrida em produção (solicitar → atribuir → aceitar → em_rota → concluída)
- [ ] Confirmar recebimento de e-mails e WhatsApp em produção
