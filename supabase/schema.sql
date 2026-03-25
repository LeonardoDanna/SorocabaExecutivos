-- ============================================================
-- SOROCABA EXECUTIVOS — Schema do banco de dados
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PERFIS (extensão da tabela auth.users do Supabase)
-- ============================================================
CREATE TABLE public.perfis (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  telefone    TEXT,
  perfil      TEXT NOT NULL DEFAULT 'cliente' CHECK (perfil IN ('cliente', 'motorista', 'admin')),
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê seu próprio perfil"
  ON public.perfis FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuário atualiza seu próprio perfil"
  ON public.perfis FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin vê todos os perfis"
  ON public.perfis FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'perfil') = 'admin'
  );

-- Trigger para criar perfil automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (id, nome, telefone, perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
    COALESCE(NEW.raw_user_meta_data->>'perfil', 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- DESTINOS PRÉ-DEFINIDOS
-- ============================================================
CREATE TABLE public.destinos (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome       TEXT NOT NULL,
  endereco   TEXT NOT NULL,
  tipo       TEXT NOT NULL CHECK (tipo IN ('aeroporto', 'hotel', 'corporativo', 'outro')),
  ativo      BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.destinos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Destinos são públicos para leitura"
  ON public.destinos FOR SELECT
  USING (true);

-- Dados iniciais
INSERT INTO public.destinos (nome, endereco, tipo) VALUES
  ('Aeroporto de Guarulhos (GRU)', 'Rod. Hélio Smidt, s/n - Guarulhos, SP', 'aeroporto'),
  ('Aeroporto de Congonhas (CGH)', 'Av. Washington Luís, s/n - São Paulo, SP', 'aeroporto'),
  ('Aeroporto de Viracopos (VCP)', 'Rod. Santos Dumont, km 66 - Campinas, SP', 'aeroporto'),
  ('Rodoviária de Sorocaba', 'Av. Itavuvu, 1650 - Sorocaba, SP', 'outro'),
  ('Shopping Iguatemi Sorocaba', 'Av. Itavuvu, 11443 - Sorocaba, SP', 'outro'),
  ('Hospital Santa Lucinda', 'R. Dr. Pereira Barreto, 130 - Sorocaba, SP', 'outro');

-- ============================================================
-- VIAGENS
-- ============================================================
CREATE TABLE public.viagens (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id   UUID NOT NULL REFERENCES public.perfis(id),
  motorista_id UUID REFERENCES public.perfis(id),
  origem       TEXT NOT NULL,
  destino      TEXT NOT NULL,
  data_hora    TIMESTAMPTZ NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pendente'
                 CHECK (status IN ('pendente', 'agendada', 'confirmada', 'em_rota', 'concluida', 'cancelada')),
  valor        NUMERIC(10,2),
  observacoes  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.viagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cliente vê suas próprias viagens"
  ON public.viagens FOR SELECT
  USING (auth.uid() = cliente_id);

CREATE POLICY "Cliente cria viagens"
  ON public.viagens FOR INSERT
  WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Motorista vê suas viagens"
  ON public.viagens FOR SELECT
  USING (auth.uid() = motorista_id);

CREATE POLICY "Motorista atualiza status das suas viagens"
  ON public.viagens FOR UPDATE
  USING (auth.uid() = motorista_id);

CREATE POLICY "Admin vê todas as viagens"
  ON public.viagens FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'perfil') = 'admin'
  );

-- ============================================================
-- AVALIAÇÕES
-- ============================================================
CREATE TABLE public.avaliacoes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  viagem_id    UUID NOT NULL REFERENCES public.viagens(id) ON DELETE CASCADE,
  avaliador_id UUID NOT NULL REFERENCES public.perfis(id),
  nota         SMALLINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (viagem_id, avaliador_id)
);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê avaliações das suas viagens"
  ON public.avaliacoes FOR SELECT
  USING (auth.uid() = avaliador_id);

CREATE POLICY "Motorista vê avaliações das suas viagens"
  ON public.avaliacoes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.viagens
      WHERE viagens.id = avaliacoes.viagem_id
        AND viagens.motorista_id = auth.uid()
    )
  );

CREATE POLICY "Usuário cria sua avaliação"
  ON public.avaliacoes FOR INSERT
  WITH CHECK (auth.uid() = avaliador_id);

-- ============================================================
-- NOTIFICAÇÕES
-- ============================================================
CREATE TABLE public.notificacoes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id  UUID NOT NULL REFERENCES public.perfis(id),
  viagem_id   UUID REFERENCES public.viagens(id),
  tipo        TEXT NOT NULL CHECK (tipo IN ('whatsapp', 'email', 'push')),
  mensagem    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviada', 'falha')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê suas notificações"
  ON public.notificacoes FOR SELECT
  USING (auth.uid() = usuario_id);
