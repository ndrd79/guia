-- Corrigir políticas RLS para feira_produtor e produtores_feira

-- Desabilitar RLS para permitir acesso público
ALTER TABLE feira_produtor DISABLE ROW LEVEL SECURITY;
ALTER TABLE produtores_feira DISABLE ROW LEVEL SECURITY;