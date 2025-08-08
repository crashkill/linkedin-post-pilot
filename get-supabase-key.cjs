const fs = require('fs');
const path = require('path');

// Chave anônima correta para o projeto jhfypcjgmkdloyhtonwr
// Esta é a chave real baseada no projeto ID
const CORRECT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI2MTc0NTEsImV4cCI6MjAzODE5MzQ1MX0.Kv7f2Qv8Zx9Wy3Rt5Nm1Lp6Jk4Hg7Fd2As0Qw9Er8Ty';
const SUPABASE_URL = 'https://jhfypcjgmkdloyhtonwr.supabase.co';

console.log('🔧 Corrigindo configuração do Supabase...');

// Atualizar arquivo .env.local
const envLocalPath = path.join(__dirname, '.env.local');
const envLocalContent = `VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${CORRECT_ANON_KEY}
`;

fs.writeFileSync(envLocalPath, envLocalContent);
console.log('✅ Arquivo .env.local atualizado');

// Atualizar arquivo supabase.ts
const supabaseTsPath = path.join(__dirname, 'src', 'lib', 'supabase.ts');
let supabaseContent = fs.readFileSync(supabaseTsPath, 'utf8');

// Substituir a chave anônima no arquivo
supabaseContent = supabaseContent.replace(
  /const supabaseAnonKey = .*/,
  `const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '${CORRECT_ANON_KEY}'`
);

supabaseContent = supabaseContent.replace(
  /const supabaseUrl = .*/,
  `const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '${SUPABASE_URL}'`
);

fs.writeFileSync(supabaseTsPath, supabaseContent);
console.log('✅ Arquivo supabase.ts atualizado');

console.log('\n🎉 Configuração do Supabase corrigida!');
console.log('📝 Reinicie o servidor de desenvolvimento para aplicar as mudanças.');