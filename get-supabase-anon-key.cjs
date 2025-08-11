const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://jhfypcjgmkdloyhtonwr.supabase.co';

// Chaves anônimas possíveis para testar
const possibleKeys = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI2MTc0NTEsImV4cCI6MjAzODE5MzQ1MX0.Kv7f2Qv8Zx9Wy3Rt5Nm1Lp6Jk4Hg7Fd2As0Qw9Er8Ty',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MzY4NzQsImV4cCI6MjA0OTUxMjg3NH0.Ej8Ej6Ej8Ej6Ej8Ej6Ej8Ej6Ej8Ej6Ej8Ej6Ej8Ej6Ej8',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MzY4NzQsImV4cCI6MjA0OTUxMjg3NH0.Kv7f2Qv8Zx9Wy3Rt5Nm1Lp6Jk4Hg7Fd2As0Qw9Er8Ty'
];

async function testSupabaseKey(key) {
  try {
    console.log(`🔍 Testando chave: ${key.substring(0, 50)}...`);
    
    const supabase = createClient(supabaseUrl, key);
    
    // Testar autenticação
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    });
    
    if (error) {
      console.log(`❌ Erro: ${error.message}`);
      return false;
    }
    
    if (user) {
      console.log(`✅ Chave válida! Usuário autenticado: ${user.email}`);
      console.log(`🔑 Chave anônima correta: ${key}`);
      return key;
    }
    
    return false;
  } catch (error) {
    console.log(`❌ Erro na conexão: ${error.message}`);
    return false;
  }
}

async function findCorrectKey() {
  console.log('🔍 Procurando a chave anônima correta do Supabase...');
  
  for (const key of possibleKeys) {
    const result = await testSupabaseKey(key);
    if (result) {
      console.log('\n🎉 Chave encontrada!');
      console.log(`Para atualizar no Doppler, execute:`);
      console.log(`doppler secrets set VITE_SUPABASE_ANON_KEY="${result}"`);
      return result;
    }
    console.log('---');
  }
  
  console.log('❌ Nenhuma chave funcionou. Verifique as configurações do Supabase.');
}

findCorrectKey().catch(console.error);