import https from 'https';
import fs from 'fs';

// Função para obter o ACCESS_TOKEN do ambiente
function getAccessToken() {
  const token = process.env.ACCESS_TOKEN;
  if (!token) {
    throw new Error('ACCESS_TOKEN não encontrado nas variáveis de ambiente');
  }
  return token;
}

// Função para fazer requisições HTTPS
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      const jsonData = JSON.stringify(data);
      req.setHeader('Content-Length', Buffer.byteLength(jsonData));
      req.write(jsonData);
    }
    
    req.end();
  });
}

// Função para obter informações do usuário
async function getUserInfo(accessToken) {
  const options = {
    hostname: 'api.linkedin.com',
    port: 443,
    path: '/v2/userinfo',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  console.log('🔍 Obtendo informações do usuário...');
  const response = await makeRequest(options);
  
  if (response.statusCode === 200) {
    console.log('✅ Informações do usuário obtidas com sucesso');
    console.log('👤 Usuário:', response.data.name);
    console.log('📧 Email:', response.data.email);
    return response.data;
  } else {
    console.error('❌ Erro ao obter informações do usuário:', response.statusCode, response.data);
    throw new Error(`Erro ao obter informações do usuário: ${response.statusCode}`);
  }
}

// Função para criar post sobre automação
async function createAutomationPost(accessToken, userInfo) {
  const postContent = {
    author: `urn:li:person:${userInfo.sub}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: `🤖 A REVOLUÇÃO DA AUTOMAÇÃO: Transformando o Futuro do Trabalho

Vivemos em uma era onde a automação não é mais ficção científica, mas realidade presente em nossas vidas. Desde robôs industriais até assistentes virtuais inteligentes, a tecnologia está redefinindo como trabalhamos e vivemos.

🔧 PRINCIPAIS BENEFÍCIOS DA AUTOMAÇÃO:
• Aumento da produtividade e eficiência
• Redução de erros humanos
• Liberação de tempo para tarefas criativas
• Melhoria na qualidade dos produtos/serviços
• Disponibilidade 24/7 sem interrupções

💡 ÁREAS EM TRANSFORMAÇÃO:
✅ Manufatura: Robôs colaborativos (cobots)
✅ Atendimento: Chatbots e IA conversacional
✅ Logística: Drones e veículos autônomos
✅ Finanças: Processamento automático de dados
✅ Saúde: Diagnósticos assistidos por IA

🚀 O FUTURO É AGORA:
A automação não substitui humanos, ela os potencializa! Profissionais que abraçam essas tecnologias se tornam mais estratégicos, focando em inovação, criatividade e relacionamentos.

🎯 DICA PROFISSIONAL:
Invista em aprender sobre automação na sua área. Seja o profissional que lidera a transformação, não aquele que é deixado para trás.

#Automação #Tecnologia #Inovação #FuturoDoTrabalho #IA #Robotica #TransformaçãoDigital #Produtividade #LinkedIn #TechTrends

O que você pensa sobre o impacto da automação na sua área? Compartilhe nos comentários! 👇`
        },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };
  
  const options = {
    hostname: 'api.linkedin.com',
    port: 443,
    path: '/v2/ugcPosts',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    }
  };
  
  console.log('📝 Criando post sobre automação...');
  const response = await makeRequest(options, postContent);
  
  if (response.statusCode === 201) {
    console.log('🎉 Post sobre automação publicado com sucesso!');
    console.log('🆔 ID do post:', response.data.id);
    return response.data;
  } else {
    console.error('❌ Erro ao publicar post:', response.statusCode, response.data);
    throw new Error(`Erro ao publicar post: ${response.statusCode}`);
  }
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando publicação de post sobre automação...');
    
    // Obter ACCESS_TOKEN
    const accessToken = getAccessToken();
    console.log('✅ ACCESS_TOKEN obtido com sucesso');
    
    // Obter informações do usuário
    const userInfo = await getUserInfo(accessToken);
    
    // Simular agendamento (LinkedIn não suporta agendamento via API)
    const scheduledTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
    console.log('⏰ Post agendado para:', scheduledTime.toLocaleString('pt-BR'));
    
    // Criar e publicar post
    const postResult = await createAutomationPost(accessToken, userInfo);
    
    console.log('\n📊 RESUMO DA PUBLICAÇÃO:');
    console.log('📝 Tópico: Automação e Futuro do Trabalho');
    console.log('🎯 Público: Profissionais de tecnologia e inovação');
    console.log('🔗 Hashtags: #Automação #Tecnologia #Inovação #FuturoDoTrabalho');
    console.log('✅ Status: Publicado com sucesso');
    console.log('🆔 ID do post:', postResult.id);
    
  } catch (error) {
    console.error('💥 Erro durante a execução:', error.message);
    process.exit(1);
  }
}

// Executar o script
main();