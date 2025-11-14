-- SQL Simplificado para garantir acesso administrativo
-- Execute este comando no SQL Editor do Supabase

-- Garantir que o usuário seja administrador
INSERT INTO profiles (id, email, role) 
VALUES ('2b1f63f0-192e-4818-8f9f-6f9713b05780', 'admin@portal.com', 'admin')
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin',
    email = 'admin@portal.com';