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
    // Se há dados, calcular Content-Length
    if (data) {
      const dataBuffer = Buffer.from(data, 'utf8');
      options.headers = {
        ...options.headers,
        'Content-Length': dataBuffer.length
      };
    }
    
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
      req.write(data);
    }
    
    req.end();
  });
}

// Função para obter informações do usuário
async function getUserInfo(accessToken) {
  const options = {
    hostname: 'api.linkedin.com',
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

// Função para criar post sobre IAs Generativas
async function createGenerativeAIPost(accessToken, userInfo) {
  // Conteúdo do post sobre IAs Generativas
  const postContent = `🤖 O Futuro da Criação: IAs Generativas Transformando o Mundo Digital

🚀 Estamos vivenciando uma revolução silenciosa que está redefinindo como criamos, inovamos e trabalhamos. As Inteligências Artificiais Generativas não são apenas uma tendência tecnológica - são o catalisador de uma nova era criativa.

💡 O que torna as IAs Generativas tão revolucionárias?

🎨 CRIATIVIDADE AMPLIFICADA
• Geração de imagens fotorrealistas em segundos
• Criação de textos persuasivos e envolventes
• Composição musical e design automatizados
• Desenvolvimento de código inteligente

⚡ PRODUTIVIDADE EXPONENCIAL
• Automação de tarefas repetitivas
• Prototipagem rápida de ideias
• Personalização em massa
• Otimização de processos criativos

🌐 DEMOCRATIZAÇÃO DA CRIAÇÃO
• Ferramentas profissionais acessíveis a todos
• Redução de barreiras técnicas
• Empoderamento de pequenos negócios
• Inovação colaborativa humano-IA

🔮 IMPACTO TRANSFORMADOR
As IAs Generativas estão revolucionando:
✨ Marketing e Publicidade
✨ Educação e Treinamento
✨ Entretenimento e Mídia
✨ Desenvolvimento de Software
✨ Design e Arquitetura
✨ Pesquisa e Desenvolvimento

🎯 REFLEXÃO ESTRATÉGICA
Não se trata de substituir a criatividade humana, mas de amplificá-la. As IAs Generativas são ferramentas que potencializam nossa capacidade de inovar, criar e resolver problemas complexos.

🚀 O futuro pertence àqueles que souberem combinar a intuição humana com o poder computacional das IAs Generativas.

💬 Como você está utilizando IAs Generativas em seus projetos? Compartilhe sua experiência!

#InteligenciaArtificial #IAGenerativa #Inovacao #Tecnologia #Futuro #Criatividade #Transformacao #Digital #AI #MachineLearning #DeepLearning #TechTrends #Innovation #DigitalTransformation`;

  // Dados do post
  const postData = {
    author: `urn:li:person:${userInfo.sub}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: postContent
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
    path: '/v2/ugcPosts',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    }
  };

  console.log('📝 Criando post sobre IAs Generativas...');
  const response = await makeRequest(options, JSON.stringify(postData));

  if (response.statusCode === 201) {
    console.log('✅ Post sobre IAs Generativas publicado com sucesso!');
    console.log('🆔 ID do Post:', response.data.id);
    console.log('🔗 Post criado em:', new Date().toLocaleString('pt-BR'));
    return response.data;
  } else {
    console.error('❌ Erro ao publicar post:', response.statusCode, response.data);
    throw new Error(`Erro ao publicar post: ${response.statusCode}`);
  }
}

// Função para agendar post (simulação - LinkedIn não suporta agendamento via API)
function schedulePost(minutes = 10) {
  console.log(`⏰ Post agendado para ser publicado em ${minutes} minutos`);
  console.log(`🕐 Horário de publicação: ${new Date(Date.now() + minutes * 60000).toLocaleString('pt-BR')}`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('🚀 Executando publicação agendada...');
      resolve();
    }, minutes * 60000);
  });
}

// Função principal
async function main() {
  try {
    console.log('🤖 === LINKEDIN POST PILOT - IAs GENERATIVAS ===');
    console.log('🚀 Iniciando criação de post sobre IAs Generativas...');
    
    // Obter ACCESS_TOKEN
    const accessToken = getAccessToken();
    console.log('🔑 ACCESS_TOKEN obtido com sucesso');
    
    // Obter informações do usuário
    const userInfo = await getUserInfo(accessToken);
    
    // Agendar para 10 minutos (ou publicar imediatamente se preferir)
    const publishNow = process.argv.includes('--now');
    
    if (publishNow) {
      console.log('📤 Publicando imediatamente...');
      await createGenerativeAIPost(accessToken, userInfo);
    } else {
      console.log('⏰ Agendando post para 10 minutos...');
      await schedulePost(10);
      await createGenerativeAIPost(accessToken, userInfo);
    }
    
    console.log('\n🎉 === RESUMO DA PUBLICAÇÃO ===');
    console.log('📋 Tópico: IAs Generativas - Transformação Digital');
    console.log('🎯 Público: Profissionais de Tecnologia e Inovação');
    console.log('📊 Conteúdo: Post educativo e inspiracional sobre IA');
    console.log('🔗 Plataforma: LinkedIn via API v2');
    console.log('✅ Status: Publicado com sucesso!');
    
  } catch (error) {
    console.error('💥 Erro durante a execução:', error.message);
    process.exit(1);
  }
}

// Executar o script
main();