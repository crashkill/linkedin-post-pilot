-- Criar usuário de teste no auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
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
  'fabriciocardosolima@gmail.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Criar entrada correspondente na tabela users
INSERT INTO users (
  id,
  email,
  name,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'fabriciocardosolima@gmail.com'),
  'fabriciocardosolima@gmail.com',
  'Fabricio Cardoso',
  NOW(),
  NOW()
);