-- Corrigir políticas RLS para banner_analytics

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Permitir inserção de analytics" ON banner_analytics;
DROP POLICY IF EXISTS "Permitir leitura de analytics" ON banner_analytics;
DROP POLICY IF EXISTS "Permitir inserção pública" ON banner_analytics;
DROP POLICY IF EXISTS "Permitir leitura pública" ON banner_analytics;

-- Criar política para permitir inserção pública (para tracking)
CREATE POLICY "Permitir inserção pública de analytics" ON banner_analytics
  FOR INSERT
  WITH CHECK (true);

-- Criar política para permitir leitura apenas para usuários autenticados
CREATE POLICY "Permitir leitura de analytics para autenticados" ON banner_analytics
  FOR SELECT
  USING (auth.role() = 'authenticated');