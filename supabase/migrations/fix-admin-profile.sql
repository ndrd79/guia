-- Script para garantir que o perfil admin existe
-- Execute este script no SQL Editor do Supabase

-- Verificar se o perfil admin existe
SELECT 
  p.id, 
  p.email, 
  p.role,
  u.email as user_email
FROM profiles p
RIGHT JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@portal.com';

-- Inserir ou atualizar o perfil admin
INSERT INTO profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'admin@portal.com'
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  email = EXCLUDED.email,
  updated_at = NOW();

-- Verificar novamente
SELECT 
  p.id, 
  p.email, 
  p.role,
  p.created_at,
  p.updated_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@portal.com';