/**
 * Script para testar se o Doppler está configurado e funcionando
 * Verifica se as variáveis de ambiente estão sendo carregadas corretamente
 */

console.log('🔍 Testando configuração do Doppler...');
console.log('=' .repeat(50));

// Verificar variáveis do Supabase
console.log('\n📊 SUPABASE:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Configurado' : '❌ Não encontrado');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não encontrado');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ Não encontrado');

// Verificar variáveis do LinkedIn
console.log('\n🔗 LINKEDIN:');
console.log('LINKEDIN_CLIENT_ID:', process.env.LINKEDIN_CLIENT_ID ? '✅ Configurado' : '❌ Não encontrado');
console.log('LINKEDIN_CLIENT_SECRET:', process.env.LINKEDIN_CLIENT_SECRET ? '✅ Configurado' : '❌ Não encontrado');
console.log('LINKEDIN_REDIRECT_URI:', process.env.LINKEDIN_REDIRECT_URI ? '✅ Configurado' : '❌ Não encontrado');

// Verificar APIs de IA
console.log('\n🤖 APIs DE IA:');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Configurado' : '❌ Não encontrado');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Configurado' : '❌ Não encontrado');
console.log('HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? '✅ Configurado' : '❌ Não encontrado');

// Verificar outras variáveis
console.log('\n⚙️ OUTRAS:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurado' : '❌ Não encontrado');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Verificar se está usando Doppler
console.log('\n🔐 DOPPLER:');
console.log('DOPPLER_PROJECT:', process.env.DOPPLER_PROJECT ? '✅ Configurado' : '❌ Não encontrado');
console.log('DOPPLER_CONFIG:', process.env.DOPPLER_CONFIG ? '✅ Configurado' : '❌ Não encontrado');

// Resumo
console.log('\n' + '=' .repeat(50));
const totalVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'LINKEDIN_CLIENT_ID',
  'LINKEDIN_CLIENT_SECRET',
  'LINKEDIN_REDIRECT_URI',
  'GROQ_API_KEY',
  'GEMINI_API_KEY',
  'HUGGINGFACE_API_KEY',
  'JWT_SECRET'
];

const configuredVars = totalVars.filter(varName => process.env[varName]);

console.log(`📈 Status: ${configuredVars.length}/${totalVars.length} variáveis configuradas`);

if (configuredVars.length === totalVars.length) {
  console.log('🎉 Todas as variáveis estão configuradas!');
} else {
  console.log('⚠️ Algumas variáveis ainda precisam ser configuradas:');
  totalVars.forEach(varName => {
    if (!process.env[varName]) {
      console.log(`   - ${varName}`);
    }
  });
}

console.log('\n💡 Para executar com Doppler:');
console.log('   doppler run -- node test-doppler.cjs');
console.log('   doppler run -- npm run dev');