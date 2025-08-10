#!/usr/bin/env node

import https from 'https';

console.log('🚀 Testando publicação no LinkedIn...');

// Obter ACCESS_TOKEN do ambiente (Doppler)
const accessToken = process.env.ACCESS_TOKEN;

if (!accessToken) {
    console.error('❌ ACCESS_TOKEN não encontrado nas variáveis de ambiente');
    process.exit(1);
}

console.log('✅ ACCESS_TOKEN encontrado');

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
            console.log('📤 Payload:', JSON.stringify(body, null, 2));
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

// Obter informações do usuário primeiro
const getUserInfo = async () => {
    console.log('👤 Obtendo informações do usuário...');
    
    try {
        const result = await makeRequest('/v2/userinfo', 'GET');
        if (result.success) {
            console.log('✅ Informações do usuário obtidas com sucesso!');
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

// Obter ID da pessoa para usar na publicação
const getPersonId = async () => {
    console.log('🆔 Obtendo ID da pessoa...');
    
    try {
        // Tentar diferentes endpoints para obter o ID
        const endpoints = [
            '/v2/people/~:(id)',
            '/v2/me'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const result = await makeRequest(endpoint, 'GET');
                if (result.success && result.data.id) {
                    console.log(`✅ ID da pessoa obtido: ${result.data.id}`);
                    return result.data.id;
                }
            } catch (e) {
                console.log(`⚠️ Endpoint ${endpoint} falhou, tentando próximo...`);
            }
        }
        
        // Se não conseguir obter o ID, usar o sub do userinfo
        const userInfo = await getUserInfo();
        if (userInfo.sub) {
            console.log(`✅ Usando sub como ID: ${userInfo.sub}`);
            return userInfo.sub;
        }
        
        throw new Error('Não foi possível obter ID da pessoa');
    } catch (error) {
        console.error('❌ Erro ao obter ID da pessoa:', error.message);
        throw error;
    }
};

// Testar publicação de post
const testPostPublication = async (personId) => {
    console.log('\n📝 Testando publicação de post...');
    
    const postData = {
        "author": `urn:li:person:${personId}`,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": "🧪 Teste de integração LinkedIn Post Pilot\n\n✨ Este é um post de teste para verificar se nossa integração com a API do LinkedIn está funcionando perfeitamente!\n\n🚀 Desenvolvido com amor usando Node.js e a API v2 do LinkedIn.\n\n#LinkedInAPI #NodeJS #Desenvolvimento #Teste"
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
            console.log('🎉 POST PUBLICADO COM SUCESSO!');
            console.log(`📍 ID do post: ${result.data.id}`);
            return result.data;
        } else {
            console.log('❌ Falha na publicação do post');
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
        console.log('🔍 Iniciando teste completo de publicação...');
        
        // 1. Obter informações do usuário
        const userInfo = await getUserInfo();
        
        // 2. Obter ID da pessoa
        const personId = await getPersonId();
        
        // 3. Testar publicação
        const postResult = await testPostPublication(personId);
        
        // 4. Resumo final
        console.log('\n📋 RESUMO FINAL:');
        console.log('=' .repeat(50));
        
        if (postResult) {
            console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
            console.log('🚀 A integração LinkedIn está funcionando perfeitamente!');
            console.log('📱 Você pode verificar o post no seu perfil do LinkedIn.');
        } else {
            console.log('⚠️ TESTE PARCIALMENTE CONCLUÍDO');
            console.log('📖 Conseguimos autenticar e obter dados do usuário.');
            console.log('❌ Mas a publicação de posts ainda não está funcionando.');
            console.log('💡 Verifique se o escopo "w_member_social" está ativo.');
        }
        
    } catch (error) {
        console.error('💥 Erro geral no teste:', error.message);
        console.log('\n🔧 Possíveis soluções:');
        console.log('1. Verificar se o ACCESS_TOKEN não expirou');
        console.log('2. Confirmar se todos os escopos estão ativos no LinkedIn Developer Portal');
        console.log('3. Verificar se a aplicação está aprovada para produção');
    }
};

// Executar teste
main();