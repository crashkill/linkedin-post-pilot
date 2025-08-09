-- Desabilitar RLS temporariamente para permitir inserção
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE images DISABLE ROW LEVEL SECURITY;

-- Verificar status do RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('posts', 'images') 
AND schemaname = 'public';