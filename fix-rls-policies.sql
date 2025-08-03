-- Script para corrigir as políticas RLS
-- Execute este script no SQL Editor do Supabase

-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir CRUD para usuários autenticados" ON noticias;
DROP POLICY IF EXISTS "Permitir CRUD para usuários autenticados" ON classificados;
DROP POLICY IF EXISTS "Permitir CRUD para usuários autenticados" ON eventos;

-- Criar políticas específicas para cada operação

-- NOTÍCIAS
-- Permitir inserção para usuários autenticados
CREATE POLICY "Permitir inserção de notícias para usuários autenticados" ON noticias
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização para usuários autenticados
CREATE POLICY "Permitir atualização de notícias para usuários autenticados" ON noticias
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir exclusão para usuários autenticados
CREATE POLICY "Permitir exclusão de notícias para usuários autenticados" ON noticias
  FOR DELETE USING (auth.role() = 'authenticated');

-- CLASSIFICADOS
-- Permitir inserção para usuários autenticados
CREATE POLICY "Permitir inserção de classificados para usuários autenticados" ON classificados
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização para usuários autenticados
CREATE POLICY "Permitir atualização de classificados para usuários autenticados" ON classificados
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir exclusão para usuários autenticados
CREATE POLICY "Permitir exclusão de classificados para usuários autenticados" ON classificados
  FOR DELETE USING (auth.role() = 'authenticated');

-- EVENTOS
-- Permitir inserção para usuários autenticados
CREATE POLICY "Permitir inserção de eventos para usuários autenticados" ON eventos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização para usuários autenticados
CREATE POLICY "Permitir atualização de eventos para usuários autenticados" ON eventos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir exclusão para usuários autenticados
CREATE POLICY "Permitir exclusão de eventos para usuários autenticados" ON eventos
  FOR DELETE USING (auth.role() = 'authenticated');