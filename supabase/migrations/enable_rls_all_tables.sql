-- Migração para habilitar RLS em todas as tabelas com políticas
-- Corrige o problema de segurança onde tabelas têm políticas RLS mas RLS não está habilitado

-- Habilitar RLS na tabela banners
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela noticias
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela classificados
ALTER TABLE public.classificados ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela eventos
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela empresas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Verificar se RLS foi habilitado corretamente
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('banners', 'noticias', 'classificados', 'eventos', 'empresas', 'tenants')
ORDER BY tablename;