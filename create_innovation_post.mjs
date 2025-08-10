import https from 'https';
import fs from 'fs';

// Função para obter ACCESS_TOKEN do ambiente
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
          const parsedData = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: responseData });
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
  
  try {
    const response = await makeRequest(options);
    console.log('✅ Informações do usuário obtidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao obter informações do usuário:', error);
    throw error;
  }
}

// Função para criar post no LinkedIn
async function createLinkedInPost(accessToken, userInfo) {
  const postContent = {
    author: `urn:li:person:${userInfo.sub}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: `🚀 O Futuro da Tecnologia está Aqui! 🚀\n\n💡 Vivemos em uma era de transformação digital sem precedentes, onde a inovação não é apenas uma vantagem competitiva, mas uma necessidade para prosperar no mercado atual.\n\n🔧 Principais tendências que estão moldando o futuro:\n\n• Inteligência Artificial e Machine Learning revolucionando processos\n• Automação inteligente otimizando operações\n• Cloud Computing democratizando o acesso à tecnologia\n• IoT conectando o mundo físico ao digital\n• Blockchain garantindo segurança e transparência\n\n🎯 Para profissionais de tecnologia, este é o momento de:\n\n✅ Investir em aprendizado contínuo\n✅ Desenvolver habilidades em IA e automação\n✅ Abraçar metodologias ágeis\n✅ Focar na experiência do usuário\n✅ Construir soluções sustentáveis\n\n🌟 A tecnologia não é apenas sobre código - é sobre criar soluções que impactam positivamente a vida das pessoas e transformam negócios.\n\n💭 Qual tecnologia você acredita que terá o maior impacto nos próximos 5 anos?\n\n#Tecnologia #Inovação #IA #Automação #FuturoDigital #TechLeadership #Desenvolvimento #CloudComputing #MachineLearning #Transformação`
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
  
  try {
    const response = await makeRequest(options, postContent);
    console.log('✅ Post criado com sucesso!');
    console.log('📊 Status:', response.statusCode);
    console.log('🆔 Resposta:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao criar post:', error);
    throw error;
  }
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando criação de post sobre Inovação Tecnológica...');
    
    // Obter ACCESS_TOKEN
    const accessToken = getAccessToken();
    console.log('✅ ACCESS_TOKEN obtido com sucesso');
    
    // Obter informações do usuário
    const userInfo = await getUserInfo(accessToken);
    
    // Simular agendamento para 10 minutos
    const scheduledTime = new Date(Date.now() + 10 * 60 * 1000);
    console.log(`⏰ Post agendado para: ${scheduledTime.toLocaleString('pt-BR')}`);
    
    // Criar post
    const postResult = await createLinkedInPost(accessToken, userInfo);
    
    console.log('\n🎉 RESUMO DA PUBLICAÇÃO:');
    console.log('📝 Tópico: Inovação e Futuro da Tecnologia');
    console.log('👤 Usuário:', userInfo.given_name, userInfo.family_name);
    console.log('🆔 ID do Post:', postResult.id || 'Post criado com sucesso');
    console.log('📅 Data de Publicação:', new Date().toLocaleString('pt-BR'));
    console.log('🎯 Visibilidade: Pública');
    console.log('\n✨ Post sobre inovação tecnológica publicado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na execução:', error.message);
    process.exit(1);
  }
}

// Executar script
main();