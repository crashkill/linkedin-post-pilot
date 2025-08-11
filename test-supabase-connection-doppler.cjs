console.log('🔍 Verificando conexão com Supabase usando Doppler...');

// Verificar se as variáveis estão carregadas
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n📋 Variáveis de ambiente carregadas:');
console.log('- VITE_SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Não encontrada');
console.log('- VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Definida' : '❌ Não encontrada');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Definida' : '❌ Não encontrada');

if (supabaseUrl) {
  console.log('\n🔗 URL do Supabase:', supabaseUrl.substring(0, 30) + '...');
}

if (supabaseAnonKey) {
  console.log('🔑 Anon Key:', supabaseAnonKey.substring(0, 20) + '...');
}

if (supabaseServiceKey) {
  console.log('🔐 Service Key:', supabaseServiceKey.substring(0, 20) + '...');
}

console.log('\n✅ Verificação de variáveis concluída!');

// Testar importação do Supabase
try {
  const { createClient } = require('@supabase/supabase-js');
  console.log('✅ Biblioteca @supabase/supabase-js carregada com sucesso!');
  
  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Cliente Supabase criado com sucesso!');
  }
} catch (error) {
  console.log('❌ Erro ao carregar biblioteca Supabase:', error.message);
}

console.log('\n🎉 Teste concluído!');