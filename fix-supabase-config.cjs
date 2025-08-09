const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações corretas do Supabase
const SUPABASE_URL = 'https://jhfypcjgmkdloyhtonwr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI2MTc0NTEsImV4cCI6MjAzODE5MzQ1MX0.8vQCQzNz8rKqp9p7VQzNz8rKqp9p7VQzNz8rKqp9p7VQ';

console.log('🔧 Configurando variáveis do Supabase...');

// Atualizar arquivo supabase.ts
const supabaseFilePath = path.join(__dirname, 'src', 'lib', 'supabase.ts');
let supabaseContent = fs.readFileSync(supabaseFilePath, 'utf8');

// Substituir as configurações
supabaseContent = supabaseContent.replace(
  /const supabaseUrl = .*/,
  `const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '${SUPABASE_URL}'`
);

supabaseContent = supabaseContent.replace(
  /const supabaseAnonKey = .*/,
  `const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '${SUPABASE_ANON_KEY}'`
);

fs.writeFileSync(supabaseFilePath, supabaseContent);

console.log('✅ Configurações do Supabase atualizadas!');
console.log('📝 URL:', SUPABASE_URL);
console.log('🔑 Chave configurada');

// Criar arquivo .env.local temporário para desenvolvimento
const envContent = `VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
`;
fs.writeFileSync('.env.local', envContent);

console.log('📄 Arquivo .env.local criado para desenvolvimento local');
console.log('🚀 Reinicie o servidor de desenvolvimento para aplicar as mudanças');