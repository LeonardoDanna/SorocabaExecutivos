-- ============================================================
--  Sorocaba Executivos — RLS Policies
--  Execute no SQL Editor do Supabase Dashboard
--  O service_role (createAdminClient) ignora RLS por padrão.
-- ============================================================

-- ── 1. Habilitar RLS nas tabelas ────────────────────────────
ALTER TABLE viagens    ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis     ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- ============================================================
--  TABELA: viagens
-- ============================================================

-- Clientes veem apenas suas próprias viagens
CREATE POLICY "cliente_select_own_viagens"
  ON viagens FOR SELECT
  USING (cliente_id = auth.uid());

-- Motoristas veem viagens atribuídas a eles OU viagens pendentes (para aceitar)
CREATE POLICY "motorista_select_viagens"
  ON viagens FOR SELECT
  USING (
    motorista_id = auth.uid()
    OR (status = 'pendente' AND auth.jwt() ->> 'perfil' = 'motorista')
  );

-- Cliente pode criar viagem apenas para si mesmo, sem motorista, status pendente
CREATE POLICY "cliente_insert_viagem"
  ON viagens FOR INSERT
  WITH CHECK (
    cliente_id = auth.uid()
    AND motorista_id IS NULL
    AND status = 'pendente'
  );

-- Cliente pode cancelar suas próprias viagens (pendente ou agendada)
CREATE POLICY "cliente_cancel_viagem"
  ON viagens FOR UPDATE
  USING (
    cliente_id = auth.uid()
    AND status IN ('pendente', 'agendada')
  )
  WITH CHECK (
    cliente_id = auth.uid()
    AND status = 'cancelada'
  );

-- Motorista pode atualizar status de viagens atribuídas a ele
CREATE POLICY "motorista_update_viagem"
  ON viagens FOR UPDATE
  USING (motorista_id = auth.uid())
  WITH CHECK (motorista_id = auth.uid());

-- DELETE bloqueado para todos via RLS (admin usa service_role)
-- Nenhuma policy de DELETE = nenhum usuário autenticado pode deletar

-- ============================================================
--  TABELA: perfis
-- ============================================================

-- Qualquer usuário autenticado pode ver perfis
-- (necessário para exibir nome do motorista/cliente nas telas)
CREATE POLICY "authenticated_select_perfis"
  ON perfis FOR SELECT
  TO authenticated
  USING (true);

-- Usuário pode inserir apenas seu próprio perfil (caso trigger não rode)
CREATE POLICY "user_insert_own_perfil"
  ON perfis FOR INSERT
  WITH CHECK (id = auth.uid());

-- Usuário pode atualizar apenas seu próprio perfil
CREATE POLICY "user_update_own_perfil"
  ON perfis FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- DELETE bloqueado para todos via RLS

-- ============================================================
--  TABELA: avaliacoes
-- ============================================================

-- Avaliador vê suas próprias avaliações
CREATE POLICY "avaliador_select_own"
  ON avaliacoes FOR SELECT
  USING (avaliador_id = auth.uid());

-- Motorista vê avaliações de viagens onde ele foi o motorista
CREATE POLICY "motorista_select_avaliacoes"
  ON avaliacoes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM viagens v
      WHERE v.id = avaliacoes.viagem_id
        AND v.motorista_id = auth.uid()
    )
  );

-- Usuário autenticado pode inserir avaliação como avaliador
CREATE POLICY "user_insert_avaliacao"
  ON avaliacoes FOR INSERT
  WITH CHECK (avaliador_id = auth.uid());

-- UPDATE e DELETE bloqueados (avaliações são imutáveis)

-- ============================================================
--  NOTA: perfil do usuário está em auth.jwt() ->> 'perfil'
--  via user_metadata. Certifique-se que o campo 'perfil'
--  está sendo salvo em user_metadata ao criar o usuário.
--  Exemplo para a policy de motorista acima funcionar,
--  o JWT custom claim precisa estar configurado.
--
--  Alternativa mais simples: usar a tabela perfis para checar:
--    EXISTS (SELECT 1 FROM perfis p WHERE p.id = auth.uid() AND p.perfil = 'motorista')
-- ============================================================

-- Versão alternativa da policy de motorista (sem JWT claims):
-- DROP POLICY IF EXISTS "motorista_select_viagens" ON viagens;
-- CREATE POLICY "motorista_select_viagens"
--   ON viagens FOR SELECT
--   USING (
--     motorista_id = auth.uid()
--     OR (
--       status = 'pendente'
--       AND EXISTS (
--         SELECT 1 FROM perfis p
--         WHERE p.id = auth.uid() AND p.perfil = 'motorista'
--       )
--     )
--   );
