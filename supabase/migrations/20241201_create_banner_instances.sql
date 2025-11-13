-- Tabela de Instâncias de Banners
-- Gerencia quais banners estão ativos em cada posição e por quanto tempo

CREATE TABLE IF NOT EXISTS banner_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES banner_positions(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES banner_templates(id) ON DELETE RESTRICT,
  
  -- Array de banners com ordem e configurações individuais
  banners JSONB NOT NULL DEFAULT '[]', -- [{"banner_id": "uuid", "order": 1, "config": {}}]
  
  -- Configurações específicas desta instância
  config JSONB DEFAULT '{}', -- Sobrescreve config do template e position
  
  -- Período de vigência
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Status e controle
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Para quando há múltiplas instâncias na mesma posição
  
  -- Metadados
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índice composto para queries de banner ativo por posição
  CONSTRAINT unique_active_instance_per_position UNIQUE (position_id, is_active)
    DEFERRABLE INITIALLY DEFERRED
);

-- Índices para performance
CREATE INDEX idx_banner_instances_position ON banner_instances(position_id);
CREATE INDEX idx_banner_instances_template ON banner_instances(template_id);
CREATE INDEX idx_banner_instances_active ON banner_instances(is_active);
CREATE INDEX idx_banner_instances_dates ON banner_instances(start_date, end_date);
CREATE INDEX idx_banner_instances_priority ON banner_instances(priority DESC);

-- Índice GIN para busca dentro do JSONB de banners
CREATE INDEX idx_banner_instances_banners ON banner_instances USING GIN(banners);

-- Função para garantir que só haja uma instância ativa por posição
CREATE OR REPLACE FUNCTION ensure_single_active_instance()
RETURNS TRIGGER AS $$
BEGIN
  -- Se estiver ativando uma nova instância, desativar a atual
  IF NEW.is_active = true THEN
    UPDATE banner_instances 
    SET is_active = false, updated_at = NOW()
    WHERE position_id = NEW.position_id 
      AND id != NEW.id 
      AND is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para garantir unicidade de instância ativa
CREATE TRIGGER trigger_single_active_instance
  BEFORE INSERT OR UPDATE ON banner_instances
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_instance();

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
CREATE TRIGGER trigger_update_banner_instances_updated_at
  BEFORE UPDATE ON banner_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View para banner ativo por posição (muito usada)
CREATE OR REPLACE VIEW active_banner_instances AS
SELECT 
  bi.id,
  bi.position_id,
  bi.template_id,
  bp.name as position_name,
  bp.slug as position_slug,
  bt.name as template_name,
  bt.component_type,
  bi.banners,
  bi.config,
  bi.start_date,
  bi.end_date,
  bi.priority,
  bi.created_at
FROM banner_instances bi
JOIN banner_positions bp ON bi.position_id = bp.id
JOIN banner_templates bt ON bi.template_id = bt.id
WHERE bi.is_active = true 
  AND (bi.end_date IS NULL OR bi.end_date > NOW())
  AND bp.is_active = true
  AND bt.is_active = true;

-- Função auxiliar para obter banners ativos de uma posição
CREATE OR REPLACE FUNCTION get_active_banners_for_position(position_slug TEXT)
RETURNS TABLE (
  instance_id UUID,
  banners JSONB,
  template_type VARCHAR(50),
  config JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    abi.id,
    abi.banners,
    abi.component_type,
    abi.config
  FROM active_banner_instances abi
  WHERE abi.position_slug = position_slug;
END;
$$ LANGUAGE plpgsql;

-- Permissões
GRANT SELECT ON banner_instances TO anon;
GRANT ALL ON banner_instances TO authenticated;
GRANT SELECT ON banner_instances TO service_role;

-- RLS (Row Level Security)
ALTER TABLE banner_instances ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Permitir leitura pública de instâncias ativas" ON banner_instances
  FOR SELECT USING (is_active = true AND (end_date IS NULL OR end_date > NOW()));

CREATE POLICY "Permitir gerenciamento completo para administradores" ON banner_instances
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Permitir leitura de todas as instâncias para usuários autenticados" ON banner_instances
  FOR SELECT USING (auth.role() = 'authenticated');

-- Função para criar instância com validação
CREATE OR REPLACE FUNCTION create_banner_instance(
  p_position_id UUID,
  p_template_id UUID,
  p_banners JSONB,
  p_config JSONB DEFAULT '{}',
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_priority INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_instance_id UUID;
  v_position_exists BOOLEAN;
  v_template_exists BOOLEAN;
BEGIN
  -- Validar se position existe e está ativa
  SELECT EXISTS(
    SELECT 1 FROM banner_positions 
    WHERE id = p_position_id AND is_active = true
  ) INTO v_position_exists;
  
  IF NOT v_position_exists THEN
    RAISE EXCEPTION 'Posição não encontrada ou inativa';
  END IF;
  
  -- Validar se template existe e está ativo
  SELECT EXISTS(
    SELECT 1 FROM banner_templates 
    WHERE id = p_template_id AND is_active = true
  ) INTO v_template_exists;
  
  IF NOT v_template_exists THEN
    RAISE EXCEPTION 'Template não encontrado ou inativo';
  END IF;
  
  -- Validar se há banners suficientes
  IF jsonb_array_length(p_banners) = 0 THEN
    RAISE EXCEPTION 'É necessário pelo menos um banner';
  END IF;
  
  -- Criar a instância
  INSERT INTO banner_instances (
    position_id, template_id, banners, config, start_date, end_date, priority, created_by
  ) VALUES (
    p_position_id, p_template_id, p_banners, p_config, p_start_date, p_end_date, p_priority, auth.uid()
  ) RETURNING id INTO v_instance_id;
  
  RETURN v_instance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;