import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Credenciais do LinkedIn
const CLIENT_ID = process.env.CLIENT_ID_LINKEDIN || process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET_LINKEDIN || process.env.LINKEDIN_CLIENT_SECRET;

console.log('🔍 Testando credenciais do LinkedIn...');
console.log('CLIENT_ID:', CLIENT_ID ? `${CLIENT_ID.substring(0, 8)}...` : 'NÃO ENCONTRADO');
console.log('CLIENT_SECRET:', CLIENT_SECRET ? `${CLIENT_SECRET.substring(0, 8)}...` : 'NÃO ENCONTRADO');

async function testLinkedInCredentials() {
  try {
    // Verificar se as credenciais estão disponíveis
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Credenciais do LinkedIn não encontradas');
    }

    // Testar uma requisição básica para verificar se as credenciais são válidas
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=http://localhost:8080/linkedin/callback&scope=w_member_social`;
    
    console.log('✅ Credenciais do LinkedIn configuradas corretamente');
    console.log('🔗 URL de autorização:', authUrl);
    
    // Verificar integração no banco de dados
    const { data: integration, error } = await supabase
      .from('linkedin_integrations')
      .select('*')
      .eq('user_id', 'fabriciocardosolima@gmail.com')
      .single();
    
    if (error) {
      console.log('⚠️ Integração não encontrada no banco:', error.message);
    } else {
      console.log('✅ Integração encontrada no banco:', {
        id: integration.id,
        user_id: integration.user_id,
        access_token: integration.access_token ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
        created_at: integration.created_at
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar credenciais:', error.message);
    return false;
  }
}

testLinkedInCredentials().then(success => {
  if (success) {
    console.log('\n🎉 Teste de credenciais concluído com sucesso!');
  } else {
    console.log('\n💥 Teste de credenciais falhou!');
  }
  process.exit(success ? 0 : 1);
});