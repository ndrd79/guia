-- Script de verificação e ajuste de roles de usuários (admin)
-- Execute no SQL Editor do Supabase (produção) com cuidado.

-- 1) Verificar mapeamento entre auth.users e profiles
SELECT 
  u.id AS user_id,
  u.email AS auth_email,
  p.email AS profile_email,
  p.role AS profile_role,
  p.created_at,
  p.updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.email;

-- 2) Verificar especificamente se um usuário é admin (substitua pelo e-mail desejado)
-- Troque 'admin@portal.com' pelo e-mail do usuário que deveria ser admin
SELECT 
  u.id AS user_id,
  u.email AS auth_email,
  p.role AS profile_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@portal.com';

-- 3) Criar/ajustar perfil para ser admin (por e-mail)
-- ATENÇÃO: Substitua o e-mail abaixo pelo do usuário correto
INSERT INTO public.profiles (id, email, role)
SELECT u.id, u.email, 'admin'
FROM auth.users u
WHERE u.email = 'admin@portal.com'
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  email = EXCLUDED.email,
  updated_at = NOW();

-- 4) Ajustar por ID diretamente (se preferir)
-- Substitua 'USER_UUID_AQUI' pelo ID do usuário
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE id = 'USER_UUID_AQUI';

-- 5) Conferir novamente
SELECT id, email, role, created_at, updated_at
FROM public.profiles
WHERE email IN ('admin@portal.com');