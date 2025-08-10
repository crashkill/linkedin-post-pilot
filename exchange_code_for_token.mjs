// Script para trocar o código de autorização por ACCESS_TOKEN
// Uso: node exchange_code_for_token.mjs YOUR_AUTHORIZATION_CODE

const authCode = process.argv[2];

if (!authCode) {
  console.error('❌ Erro: Código de autorização não fornecido');
  console.log('📝 Uso: doppler run -- node exchange_code_for_token.mjs YOUR_AUTHORIZATION_CODE');
  console.log('\n🔍 Para obter o código:');
  console.log('1. Acesse: https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=776n0i9m37tkpu&redirect_uri=http://localhost:8080/auth/linkedin/callback&scope=r_liteprofile%20w_member_social');
  console.log('2. Autorize a aplicação');
  console.log('3. Copie o "code" da URL de redirecionamento');
  process.exit(1);
}

async function exchangeCodeForToken() {
  try {
    console.log('🔄 Trocando código de autorização por ACCESS_TOKEN...');
    
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('❌ CLIENT_ID ou CLIENT_SECRET não encontrados no Doppler');
      return;
    }
    
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: 'http://localhost:8080/auth/linkedin/callback',
      client_id: clientId,
      client_secret: clientSecret
    });
    
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Erro ao trocar código por token:', response.status, errorData);
      return;
    }
    
    const tokenData = await response.json();
    
    console.log('✅ ACCESS_TOKEN obtido com sucesso!');
    console.log('📋 Detalhes do token:');
    console.log('- Access Token:', tokenData.access_token);
    console.log('- Expires In:', tokenData.expires_in, 'segundos');
    console.log('- Scope:', tokenData.scope);
    
    console.log('\n🔧 Para configurar no Doppler, execute:');
    console.log(`doppler secrets set LINKEDIN_ACCESS_TOKEN="${tokenData.access_token}"`);
    
    console.log('\n🧪 Para testar o token, execute:');
    console.log('doppler run -- node test_new_access_token.mjs');
    
  } catch (error) {
    console.error('❌ Erro durante a troca:', error.message);
  }
}

exchangeCodeForToken();