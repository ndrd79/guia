-- Script para criar usuário admin no Supabase
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos criar um usuário admin na tabela auth.users
-- IMPORTANTE: Execute este comando no SQL Editor do Supabase

-- Inserir usuário admin diretamente na tabela auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@portal.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Inserir identidade correspondente na tabela auth.identities
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'admin@portal.com'),
  format('{"sub":"%s","email":"%s"}', (SELECT id FROM auth.users WHERE email = 'admin@portal.com'), 'admin@portal.com')::jsonb,
  'email',
  NOW(),
  NOW(),
  NOW()
);

-- Verificar se o usuário foi criado
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'admin@portal.com';