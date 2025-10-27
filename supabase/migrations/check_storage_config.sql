-- Verificar configuração dos buckets de storage
SELECT 
    id,
    name,
    public,
    created_at,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name IN ('noticias', 'banners');

-- Verificar políticas RLS para buckets
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename IN ('buckets', 'objects');

-- Verificar se RLS está habilitado nas tabelas de storage
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename IN ('buckets', 'objects');

-- Verificar objetos nos buckets
SELECT 
    bucket_id,
    name,
    created_at,
    metadata
FROM storage.objects 
WHERE bucket_id IN ('noticias', 'banners')
ORDER BY bucket_id, created_at DESC
LIMIT 10;