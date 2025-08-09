-- Verificar permissões atuais
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'posts'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Conceder permissões para a tabela posts
GRANT ALL PRIVILEGES ON posts TO authenticated;
GRANT SELECT, INSERT ON posts TO anon;

-- Conceder permissões para a tabela images
GRANT ALL PRIVILEGES ON images TO authenticated;
GRANT SELECT, INSERT ON images TO anon;

-- Verificar permissões após a concessão
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('posts', 'images')
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;