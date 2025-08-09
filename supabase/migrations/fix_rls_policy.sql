-- Remover políticas existentes que podem estar bloqueando
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can view their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Criar políticas mais permissivas para posts
CREATE POLICY "Allow authenticated users to insert posts" ON posts
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view posts" ON posts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update posts" ON posts
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete posts" ON posts
  FOR DELETE TO authenticated
  USING (true);

-- Políticas para anon (usuários não autenticados)
CREATE POLICY "Allow anon to view published posts" ON posts
  FOR SELECT TO anon
  USING (status = 'published');

-- Remover políticas existentes para images
DROP POLICY IF EXISTS "Users can insert images for their posts" ON images;
DROP POLICY IF EXISTS "Users can view images" ON images;

-- Criar políticas para images
CREATE POLICY "Allow authenticated users to insert images" ON images
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view images" ON images
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow anon to view images" ON images
  FOR SELECT TO anon
  USING (true);

-- Verificar se RLS está habilitado
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Mostrar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('posts', 'images')
ORDER BY tablename, policyname;