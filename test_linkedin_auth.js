import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Credenciais do usuário
const USER_CREDENTIALS = {
  email: 'fabriciocardosolima@gmail.com',
  password: '123456'
};

async function loginUser() {
  console.log('🔐 Fazendo login...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: USER_CREDENTIALS.email,
    password: USER_CREDENTIALS.password
  });
  
  if (error) {
    throw new Error(`Erro no login: ${error.message}`);
  }
  
  console.log('✅ Login realizado com sucesso!');
  console.log('📊 Dados da sessão:', JSON.stringify(data, null, 2));
  return data;
}

async function testLinkedInAuth(sessionData) {
  console.log('🔗 Testando autenticação LinkedIn...');
  
  try {
    const token = sessionData.session.access_token;
    console.log('🔑 Usando token:', token.substring(0, 20) + '...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/linkedin-auth`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'authorize'
      })
    });
    
    console.log('📊 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
      return null;
    }
    
    const authData = await response.json();
    console.log('✅ Resposta da autenticação:', authData);
    
    if (authData.authUrl) {
      console.log('🌐 URL de autorização gerada:');
      console.log(authData.authUrl);
      console.log('\n📝 Para testar a integração completa:');
      console.log('1. Acesse a URL acima');
      console.log('2. Autorize a aplicação no LinkedIn');
      console.log('3. Você será redirecionado de volta');
    }
    
    return authData;
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
    return null;
  }
}

async function checkLinkedInCredentials() {
  console.log('🔑 Verificando credenciais LinkedIn...');
  
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  
  console.log('📋 Client ID:', clientId ? `${clientId.substring(0, 8)}...` : 'NÃO ENCONTRADO');
  console.log('📋 Client Secret:', clientSecret ? `${clientSecret.substring(0, 8)}...` : 'NÃO ENCONTRADO');
  
  if (!clientId || !clientSecret) {
    console.error('❌ Credenciais LinkedIn não encontradas!');
    console.log('💡 Verifique se as variáveis LINKEDIN_CLIENT_ID e LINKEDIN_CLIENT_SECRET estão configuradas no Doppler.');
    return false;
  }
  
  return true;
}

async function main() {
  try {
    console.log('🚀 Iniciando teste de autenticação LinkedIn...');
    console.log('=' .repeat(60));
    
    // 1. Verificar credenciais
    const hasCredentials = await checkLinkedInCredentials();
    if (!hasCredentials) {
      return;
    }
    
    // 2. Fazer login
    const session = await loginUser();
    
    // 3. Testar autenticação LinkedIn
    const authResult = await testLinkedInAuth(session);
    
    console.log('\n' + '=' .repeat(60));
    if (authResult) {
      console.log('🎉 SUCESSO! A autenticação LinkedIn está funcionando!');
      console.log('📝 Próximos passos:');
      console.log('   1. Acesse a URL de autorização gerada');
      console.log('   2. Complete o fluxo OAuth no LinkedIn');
      console.log('   3. Tente publicar um post novamente');
    } else {
      console.log('❌ FALHA! Há problemas na autenticação LinkedIn.');
      console.log('🔧 Possíveis soluções:');
      console.log('   1. Verificar se as credenciais LinkedIn estão corretas');
      console.log('   2. Verificar se a aplicação LinkedIn está configurada corretamente');
      console.log('   3. Verificar se o Supabase está rodando');
    }
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    process.exit(1);
  }
}

// Executar o teste
main().catch(console.error);