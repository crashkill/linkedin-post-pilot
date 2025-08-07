-- Corrigir política RLS para permitir INSERT na tabela users
-- Isso é necessário para que usuários autenticados possam criar seu perfil

-- Adicionar política para permitir que usuários autenticados criem seu próprio registro
CREATE POLICY "Users can insert own data" ON users FOR INSERT 
WITH CHECK (auth.uid() = id);