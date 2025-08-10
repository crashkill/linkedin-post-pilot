#!/usr/bin/env node

import https from 'https';

console.log('🔍 Testando ACCESS_TOKEN do LinkedIn...');

// Obter ACCESS_TOKEN do ambiente (Doppler)
const accessToken = process.env.ACCESS_TOKEN;

if (!accessToken) {
    console.error('❌ ACCESS_TOKEN não encontrado nas variáveis de ambiente');
    process.exit(1);
}

console.log('✅ ACCESS_TOKEN encontrado');
console.log(`📏 Tamanho do token: ${accessToken.length} caracteres`);
console.log(`🔑 Primeiros 20 caracteres: ${accessToken.substring(0, 20)}...`);

// Função para fazer requisições HTTPS
const makeRequest = (path, description, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.linkedin.com',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
        };

        if (body && method === 'POST') {
            const bodyString = JSON.stringify(body);
            options.headers['Content-Length'] = Buffer.byteLength(bodyString);
        }

        console.log(`\n🧪 Testando: ${description}`);
        console.log(`📡 Endpoint: ${method} ${path}`);

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
                        console.log('📄 Dados recebidos:', JSON.stringify(parsed, null, 2));
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

// Lista de endpoints para testar (usando APIs mais recentes)
const tests = [
    {
        path: '/v2/userinfo',
        description: 'Informações do usuário (OpenID Connect)',
        method: 'GET'
    },
    {
        path: '/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))',
        description: 'Perfil básico do usuário',
        method: 'GET'
    },
    {
        path: '/v2/emailAddress?q=members&projection=(elements*(handle~))',
        description: 'Email do usuário',
        method: 'GET'
    },
    {
        path: '/v2/ugcPosts',
        description: 'Verificar permissão para criar posts (UGC)',
        method: 'GET'
    }
];

// Teste de publicação de post (apenas simulação)
const testPostCreation = {
    path: '/v2/ugcPosts',
    description: 'Teste de criação de post (simulação)',
    method: 'POST',
    body: {
        "author": "urn:li:person:AUTHOR_ID", // Será substituído pelo ID real
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": "🧪 Teste de integração LinkedIn Post Pilot - Este é um post de teste para verificar se a API está funcionando corretamente!"
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }
};

// Executar testes sequencialmente
const runTests = async () => {
    console.log('\n🚀 Iniciando testes de permissões...');
    
    const results = [];
    let userInfo = null;
    
    for (const test of tests) {
        try {
            const result = await makeRequest(test.path, test.description, test.method);
            results.push({ ...test, ...result });
            
            // Capturar informações do usuário para usar no teste de post
            if (test.path.includes('people/~') && result.success) {
                userInfo = result.data;
            }
            
            // Pequena pausa entre requisições
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`💥 Erro no teste ${test.description}:`, error.message);
            results.push({ ...test, success: false, error: error.message });
        }
    }
    
    // Teste de criação de post se tivermos as informações do usuário
    if (userInfo && userInfo.id) {
        console.log('\n🎯 Testando criação de post...');
        testPostCreation.body.author = `urn:li:person:${userInfo.id}`;
        
        try {
            const postResult = await makeRequest(
                testPostCreation.path, 
                testPostCreation.description, 
                testPostCreation.method, 
                testPostCreation.body
            );
            results.push({ ...testPostCreation, ...postResult });
        } catch (error) {
            console.error('💥 Erro no teste de post:', error.message);
            results.push({ ...testPostCreation, success: false, error: error.message });
        }
    }
    
    // Resumo dos resultados
    console.log('\n📋 RESUMO DOS TESTES:');
    console.log('=' .repeat(50));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Sucessos: ${successful.length}/${results.length}`);
    console.log(`❌ Falhas: ${failed.length}/${results.length}`);
    
    if (successful.length > 0) {
        console.log('\n🎉 FUNCIONALIDADES DISPONÍVEIS:');
        successful.forEach(test => {
            console.log(`  ✅ ${test.description}`);
        });
    }
    
    if (failed.length > 0) {
        console.log('\n⚠️  FUNCIONALIDADES INDISPONÍVEIS:');
        failed.forEach(test => {
            console.log(`  ❌ ${test.description}`);
            if (test.status === 403) {
                console.log(`      → Erro de permissão`);
            } else if (test.status === 404) {
                console.log(`      → Endpoint não encontrado`);
            }
        });
    }
    
    // Verificar se podemos publicar posts
    const canPost = successful.some(test => test.path.includes('ugcPosts') && test.method === 'POST');
    const hasReadAccess = successful.some(test => test.success);
    
    console.log('\n🎯 CONCLUSÃO:');
    if (canPost) {
        console.log('🚀 TOKEN PRONTO PARA PUBLICAR POSTS!');
        console.log('✨ Todas as funcionalidades estão disponíveis!');
    } else if (hasReadAccess) {
        console.log('📖 Token válido para leitura de dados.');
        console.log('⚠️  Permissão de publicação pode estar limitada.');
        console.log('💡 Verifique se o escopo "w_member_social" está ativo no LinkedIn Developer Portal.');
    } else {
        console.log('❌ Token com problemas de autenticação.');
        console.log('🔧 Verifique se o token não expirou e se os escopos estão corretos.');
    }
};

// Executar todos os testes
runTests().catch(error => {
    console.error('💥 Erro geral:', error.message);
    process.exit(1);
});