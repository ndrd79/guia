-- Migração para Sistema de Importação em Lote de Empresas
-- Criação das tabelas import_batches e import_results

-- Tabela para controle de importações
CREATE TABLE IF NOT EXISTS import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    total_records INTEGER NOT NULL,
    successful_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_details JSONB,
    file_size INTEGER,
    processing_time_ms INTEGER
);

-- Tabela para resultados detalhados de cada empresa
CREATE TABLE IF NOT EXISTS import_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_batch_id UUID REFERENCES import_batches(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'warning')),
    data JSONB NOT NULL, -- dados originais da linha
    error_message TEXT,
    warning_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campos para controle de importação na tabela empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS imported_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS plano VARCHAR(20) DEFAULT 'basico' CHECK (plano IN ('basico', 'premium'));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_import_batches_user_id ON import_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_import_batches_created_at ON import_batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_batches_status ON import_batches(status);

CREATE INDEX IF NOT EXISTS idx_import_results_batch_id ON import_results(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_import_results_status ON import_results(status);
CREATE INDEX IF NOT EXISTS idx_import_results_row_number ON import_results(import_batch_id, row_number);

CREATE INDEX IF NOT EXISTS idx_empresas_plano ON empresas(plano);
CREATE INDEX IF NOT EXISTS idx_empresas_import_batch ON empresas(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_empresas_imported_at ON empresas(imported_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_results ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para import_batches
CREATE POLICY "Admins can manage import batches" ON import_batches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Políticas RLS para import_results
CREATE POLICY "Admins can view import results" ON import_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Função para atualizar estatísticas do batch automaticamente
CREATE OR REPLACE FUNCTION update_import_batch_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contadores na tabela import_batches
    UPDATE import_batches 
    SET 
        successful_records = (
            SELECT COUNT(*) FROM import_results 
            WHERE import_batch_id = NEW.import_batch_id AND status = 'success'
        ),
        failed_records = (
            SELECT COUNT(*) FROM import_results 
            WHERE import_batch_id = NEW.import_batch_id AND status = 'error'
        )
    WHERE id = NEW.import_batch_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estatísticas automaticamente
CREATE TRIGGER trigger_update_import_stats
    AFTER INSERT OR UPDATE ON import_results
    FOR EACH ROW
    EXECUTE FUNCTION update_import_batch_stats();

-- Função para marcar batch como completo quando todos os registros foram processados
CREATE OR REPLACE FUNCTION check_import_completion()
RETURNS TRIGGER AS $$
DECLARE
    batch_total INTEGER;
    processed_total INTEGER;
BEGIN
    -- Buscar total de registros do batch
    SELECT total_records INTO batch_total
    FROM import_batches 
    WHERE id = NEW.import_batch_id;
    
    -- Contar registros processados
    SELECT COUNT(*) INTO processed_total
    FROM import_results 
    WHERE import_batch_id = NEW.import_batch_id;
    
    -- Se todos os registros foram processados, marcar como completo
    IF processed_total >= batch_total THEN
        UPDATE import_batches 
        SET 
            status = 'completed',
            completed_at = NOW()
        WHERE id = NEW.import_batch_id AND status = 'processing';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar conclusão do batch
CREATE TRIGGER trigger_check_import_completion
    AFTER INSERT ON import_results
    FOR EACH ROW
    EXECUTE FUNCTION check_import_completion();

-- Conceder permissões para as tabelas
GRANT ALL PRIVILEGES ON import_batches TO authenticated;
GRANT ALL PRIVILEGES ON import_results TO authenticated;
GRANT SELECT ON import_batches TO anon;
GRANT SELECT ON import_results TO anon;