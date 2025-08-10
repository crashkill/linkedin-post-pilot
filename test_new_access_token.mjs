import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewAccessToken() {
  try {
    console.log('🔍 Testando novo ACCESS_TOKEN do LinkedIn...');
    
    // Verificar se as credenciais estão disponíveis
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    
    if (!clientId || !clientSecret || !accessToken) {
      console.error('❌ Credenciais do LinkedIn não encontradas no Doppler');
      console.log('CLIENT_ID:', clientId ? '✅ Configurado' : '❌ Não encontrado');
      console.log('CLIENT_SECRET:', clientSecret ? '✅ Configurado' : '❌ Não encontrado');
      console.log('ACCESS_TOKEN:', accessToken ? '✅ Configurado' : '❌ Não encontrado');
      return;
    }
    
    console.log('✅ Todas as credenciais encontradas no Doppler');
    
    // Testar o token fazendo uma requisição para obter informações do perfil
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!profileResponse.ok) {
      const errorData = await profileResponse.text();
      console.error('❌ Erro ao testar ACCESS_TOKEN:', profileResponse.status, errorData);
      return;
    }
    
    const profileData = await profileResponse.json();
    console.log('✅ ACCESS_TOKEN válido! Perfil obtido:', {
      id: profileData.id,
      firstName: profileData.localizedFirstName,
      lastName: profileData.localizedLastName
    });
    
    // Testar permissões de publicação
    console.log('🔍 Testando permissões de publicação...');
    
    const testPost = {
      author: `urn:li:person:${profileData.id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: 'Teste de integração - Post criado via API do LinkedIn Post Pilot 🚀'
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };
    
    const publishResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(testPost)
    });
    
    if (!publishResponse.ok) {
      const errorData = await publishResponse.text();
      console.error('❌ Erro ao testar publicação:', publishResponse.status, errorData);
      return;
    }
    
    const publishData = await publishResponse.json();
    console.log('✅ Teste de publicação bem-sucedido! ID do post:', publishData.id);
    
    console.log('🎉 ACCESS_TOKEN configurado corretamente com permissões w_member_social!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar o teste
testNewAccessToken();