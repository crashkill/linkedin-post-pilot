#!/usr/bin/env node

import https from 'https';

console.log('🚀 Criando e publicando post sobre desenvolvimento com IA generativa...');

// Obter ACCESS_TOKEN do ambiente (Doppler)
const accessToken = process.env.ACCESS_TOKEN;

if (!accessToken) {
    console.error('❌ ACCESS_TOKEN não encontrado nas variáveis de ambiente');
    process.exit(1);
}

console.log('✅ ACCESS_TOKEN encontrado');
console.log(`🔑 Token: ${accessToken.substring(0, 20)}...`);

// Função para fazer requisições HTTPS
const makeRequest = (path, method, body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
        const defaultHeaders = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
            ...headers
        };

        if (body && method === 'POST') {
            const bodyString = JSON.stringify(body);
            defaultHeaders['Content-Length'] = Buffer.byteLength(bodyString);
        }

        const options = {
            hostname: 'api.linkedin.com',
            port: 443,
            path: path,
            method: method,
            headers: defaultHeaders
        };

        console.log(`\n📡 ${method} ${path}`);
        if (body) {
            console.log('📤 Enviando post...');
        }

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📊 Status: ${res.statusCode}`);
                
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('✅ SUCESSO!');
                    try {
                        const parsed = JSON.parse(data);
                        console.log('📄 Resposta:', JSON.stringify(parsed, null, 2));
                        resolve({ success: true, data: parsed, status: res.statusCode });
                    } catch (e) {
                        console.log('📄 Resposta (texto):', data);
                        resolve({ success: true, data: data, status: res.statusCode });
                    }
                } else {
                    console.log('❌ FALHOU');
                    console.log(`📄 Erro: ${data}`);
                    resolve({ success: false, status: res.statusCode, error: data });
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Erro na requisição:', error.message);
            reject(error);
        });
        
        if (body && method === 'POST') {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
};

// Obter informações do usuário
const getUserInfo = async () => {
    console.log('👤 Obtendo informações do usuário...');
    
    try {
        const result = await makeRequest('/v2/userinfo', 'GET');
        if (result.success) {
            console.log('✅ Informações do usuário obtidas!');
            console.log(`👋 Olá, ${result.data.name}!`);
            return result.data;
        } else {
            throw new Error('Falha ao obter informações do usuário');
        }
    } catch (error) {
        console.error('❌ Erro ao obter informações do usuário:', error.message);
        throw error;
    }
};

// Criar e publicar post sobre desenvolvimento com IA
const createAIPost = async (userInfo) => {
    console.log('\n📝 Criando post sobre desenvolvimento com IA generativa...');
    
    const postContent = `🚀 Transformando o Desenvolvimento de Software com IA Generativa

💡 Acabei de finalizar a integração completa do LinkedIn Post Pilot - uma aplicação que demonstra o poder da IA no desenvolvimento moderno!

🔧 Stack Tecnológica:
• React + TypeScript + Tailwind CSS
• Node.js + Supabase
• APIs de IA: Groq, Gemini, Hugging Face
• LinkedIn API v2 + OAuth 2.0
• Doppler para gerenciamento seguro de credenciais

✨ Funcionalidades Implementadas:
• Autenticação OAuth com LinkedIn
• Geração de conteúdo com múltiplas IAs
• Criação de imagens com Flux 1 Schnell
• Publicação automatizada de posts
• Interface moderna e responsiva

🎯 Principais Aprendizados:
• Integração segura de APIs usando Doppler
• Implementação de fluxos OAuth 2.0
• Arquitetura modular com React + Supabase
• Boas práticas de segurança em aplicações web

🔮 O futuro do desenvolvimento está na colaboração entre humanos e IA. Esta aplicação é um exemplo prático de como podemos usar ferramentas de IA para acelerar o desenvolvimento, mantendo qualidade e segurança.

#DesenvolvimentoSoftware #IAGenerativa #React #NodeJS #LinkedIn #Inovação #TechBrasil #Programação #IA #Automação`;
    
    const postData = {
        "author": `urn:li:person:${userInfo.sub}`,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": postContent
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    };
    
    try {
        const result = await makeRequest('/v2/ugcPosts', 'POST', postData);
        
        if (result.success) {
            console.log('🎉 POST PUBLICADO COM SUCESSO NO LINKEDIN!');
            console.log(`📍 ID do post: ${result.data.id}`);
            console.log('🔗 Você pode verificar o post no seu perfil do LinkedIn!');
            return result.data;
        } else {
            console.log('❌ Falha na publicação do post');
            console.log('📄 Detalhes do erro:', result.error);
            return null;
        }
    } catch (error) {
        console.error('💥 Erro na publicação:', error.message);
        return null;
    }
};

// Função principal
const main = async () => {
    try {
        console.log('🔍 Iniciando processo de publicação...');
        
        // 1. Obter informações do usuário
        const userInfo = await getUserInfo();
        
        // 2. Criar e publicar post
        const postResult = await createAIPost(userInfo);
        
        // 3. Resumo final
        console.log('\n📋 RESUMO FINAL:');
        console.log('=' .repeat(60));
        
        if (postResult) {
            console.log('✅ POST PUBLICADO COM SUCESSO!');
            console.log('🚀 Seu post sobre desenvolvimento com IA está no ar!');
            console.log('📱 Acesse seu perfil do LinkedIn para visualizar.');
            console.log('💬 Não esqueça de interagir com os comentários!');
            console.log('');
            console.log('🎯 Próximos passos sugeridos:');
            console.log('• Acompanhar engajamento do post');
            console.log('• Responder comentários');
            console.log('• Criar posts sobre outros tópicos técnicos');
            console.log('• Explorar recursos de agendamento');
        } else {
            console.log('⚠️ FALHA NA PUBLICAÇÃO');
            console.log('🔧 Verifique:');
            console.log('• Se o ACCESS_TOKEN não expirou');
            console.log('• Se todos os escopos estão ativos');
            console.log('• Se a aplicação está aprovada');
        }
        
    } catch (error) {
        console.error('💥 Erro geral:', error.message);
        console.log('\n🆘 Em caso de problemas:');
        console.log('1. Verificar credenciais no Doppler');
        console.log('2. Confirmar permissões no LinkedIn Developer Portal');
        console.log('3. Testar conectividade com a API');
    }
};

// Executar
main();