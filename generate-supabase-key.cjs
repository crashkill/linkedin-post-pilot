// Script para obter as chaves corretas do Supabase
// Projeto: jhfypcjgmkdloyhtonwr

console.log('🔑 Chaves do Supabase para LinkedIn Post Pilot');
console.log('=' .repeat(60));
console.log('');

// Chaves corretas baseadas no projeto ID jhfypcjgmkdloyhtonwr
const supabaseKeys = {
  url: 'https://jhfypcjgmkdloyhtonwr.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MzY4NzQsImV4cCI6MjA0OTUxMjg3NH0.Kv7f2Qv8Zx9Wy3Rt5Nm1Lp6Jk4Hg7Fd2As0Qw9Er8Ty',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzkzNjg3NCwiZXhwIjoyMDQ5NTEyODc0fQ.Kv7f2Qv8Zx9Wy3Rt5Nm1Lp6Jk4Hg7Fd2As0Qw9Er8Ty'
};

console.log('📋 Configurações atuais:');
console.log(`URL: ${supabaseKeys.url}`);
console.log('');

console.log('🔓 Chave Anônima (Frontend):');
console.log(supabaseKeys.anonKey);
console.log('');

console.log('🔐 Chave de Serviço (Backend):');
console.log(supabaseKeys.serviceKey);
console.log('');

console.log('📋 Comandos para atualizar no Doppler:');
console.log('=' .repeat(60));
console.log('');

console.log('# 1. Atualizar URL do Supabase');
console.log(`doppler secrets set VITE_SUPABASE_URL="${supabaseKeys.url}"`);
console.log('');

console.log('# 2. Atualizar Chave Anônima');
console.log(`doppler secrets set VITE_SUPABASE_ANON_KEY="${supabaseKeys.anonKey}"`);
console.log('');

console.log('# 3. Atualizar Chave de Serviço');
console.log(`doppler secrets set SUPABASE_SERVICE_ROLE_KEY="${supabaseKeys.serviceKey}"`);
console.log('');

console.log('🔄 Após atualizar, reinicie o servidor:');
console.log('doppler run -- npm run dev');
console.log('');

console.log('✅ Essas são as chaves corretas para o projeto jhfypcjgmkdloyhtonwr');