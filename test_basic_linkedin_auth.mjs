#!/usr/bin/env node

/**
 * 🔍 Teste Básico de Autenticação LinkedIn
 * 
 * Este script testa apenas os escopos básicos que geralmente estão
 * disponíveis por padrão, sem necessidade de aprovação especial.
 */

import http from 'http';
import url from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configurações
const PORT = 8080;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

// Escopos básicos (geralmente disponíveis por padrão)
const BASIC_SCOPES = [
  'r_liteprofile',  // Perfil básico
  'r_emailaddress'  // Email
].join(' ');

// Função para obter variáveis do Doppler
async function getDopplerSecret(name) {
  try {
    const { stdout } = await execAsync(`doppler secrets get ${name} --plain`);
    return stdout.trim();
  } catch (error) {
    console.error(`❌ Erro ao obter ${name} do Doppler:`, error.message);
    return null;
  }
}

// Função para configurar token no Doppler
async function setDopplerSecret(name, value) {
  try {
    await execAsync(`doppler secrets set ${name}="${value}"`);
    console.log(`✅ ${name} configurado no Doppler`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao configurar ${name} no Doppler:`, error.message);
    return false;
  }
}

// Função para trocar código por token
async function exchangeCodeForToken(code, clientId, clientSecret) {
  const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
  
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI,
    client_id: clientId,
    client_secret: clientSecret
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Função para testar o token
async function testToken(accessToken) {
  try {
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Token válido! Dados do perfil:');
      console.log(`   Nome: ${data.localizedFirstName} ${data.localizedLastName}`);
      console.log(`   ID: ${data.id}`);
      return true;
    } else {
      console.log('❌ Token inválido:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao testar token:', error.message);
    return false;
  }
}

// Servidor HTTP para capturar o callback
function createServer(clientId, clientSecret) {
  return http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/') {
      // Página inicial com link de autorização
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `scope=${encodeURIComponent(BASIC_SCOPES)}&` +
        `state=test123`;

      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn Auth Test</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      max-width: 500px;
      width: 100%;
      text-align: center;
    }
    
    h1 {
      color: #333;
      margin-bottom: 8px;
      font-size: 24px;
    }
    
    .subtitle {
      color: #666;
      margin-bottom: 24px;
      font-size: 14px;
    }
    
    .info {
      background: #f8f9fa;
      border-left: 4px solid #0077b5;
      padding: 16px;
      margin: 16px 0;
      border-radius: 4px;
      text-align: left;
      font-size: 14px;
    }
    
    .auth-btn {
      background: #0077b5;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      margin: 16px 0;
      transition: background 0.2s;
    }
    
    .auth-btn:hover {
      background: #005885;
    }
    
    .steps {
      text-align: left;
      margin: 24px 0;
      font-size: 14px;
    }
    
    .step {
      margin: 8px 0;
      padding: 8px 12px;
      background: #f1f3f4;
      border-radius: 4px;
    }
    
    .warning {
      background: #fff3cd;
      border-left: 3px solid #ffc107;
      padding: 12px;
      margin: 16px 0;
      border-radius: 4px;
      font-size: 13px;
    }
    
    code {
      background: #e9ecef;
      padding: 2px 4px;
      border-radius: 2px;
      font-family: monospace;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 LinkedIn Auth Test</h1>
    <p class="subtitle">Teste básico de autenticação</p>
    
    <div class="info">
      <strong>Escopos testados:</strong><br>
      • <code>r_liteprofile</code> - Perfil básico<br>
      • <code>r_emailaddress</code> - Email
    </div>
    
    <a href="${authUrl}" class="auth-btn">
      🔗 Autorizar LinkedIn
    </a>
    
    <div class="steps">
      <strong>Passos:</strong>
      <div class="step">1. Clique em "Autorizar LinkedIn"</div>
      <div class="step">2. Faça login se necessário</div>
      <div class="step">3. Autorize a aplicação</div>
      <div class="step">4. Aguarde o redirecionamento</div>
    </div>
    
    <div class="warning">
      <strong>Nota:</strong> Se falhar, configuraremos produtos no Developer Portal.
    </div>
  </div>
</body>
</html>`;
      
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      
    } else if (parsedUrl.pathname === '/callback') {
      const { code, error, error_description } = parsedUrl.query;
      
      if (error) {
        console.log(`❌ Erro na autorização: ${error}`);
        console.log(`📝 Descrição: ${error_description}`);
        
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html>
          <body style="font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h1>❌ Erro na Autorização</h1>
            <p><strong>Erro:</strong> ${error}</p>
            <p><strong>Descrição:</strong> ${error_description}</p>
            <p><a href="/">🔄 Tentar Novamente</a></p>
          </body>
          </html>
        `);
        return;
      }
      
      if (code) {
        console.log('✅ Código de autorização recebido!');
        console.log('🔄 Trocando código por token...');
        
        const tokenResult = await exchangeCodeForToken(code, clientId, clientSecret);
        
        if (tokenResult.success) {
          const { access_token } = tokenResult.data;
          console.log('✅ Token obtido com sucesso!');
          
          // Testar o token
          const isValid = await testToken(access_token);
          
          if (isValid) {
            // Configurar no Doppler
            await setDopplerSecret('LINKEDIN_ACCESS_TOKEN', access_token);
            
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
              <html>
              <body style="font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px;">
                <h1>🎉 Sucesso!</h1>
                <p>✅ Token básico configurado com sucesso!</p>
                <p>✅ Token salvo no Doppler</p>
                <p>✅ Perfil LinkedIn acessível</p>
                <h3>📋 Próximos Passos</h3>
                <ol>
                  <li>Configure os produtos no Developer Portal</li>
                  <li>Adicione "Share on LinkedIn" aos produtos</li>
                  <li>Teste novamente com escopos completos</li>
                </ol>
                <p><strong>Token:</strong> ${access_token.substring(0, 20)}...</p>
              </body>
              </html>
            `);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
              <html>
              <body style="font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px;">
                <h1>❌ Token Inválido</h1>
                <p>O token foi obtido mas não está funcionando.</p>
                <p><a href="/">🔄 Tentar Novamente</a></p>
              </body>
              </html>
            `);
          }
        } else {
          console.log('❌ Erro ao obter token:', tokenResult.error);
          
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
            <body style="font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px;">
              <h1>❌ Erro ao Obter Token</h1>
              <p>${JSON.stringify(tokenResult.error, null, 2)}</p>
              <p><a href="/">🔄 Tentar Novamente</a></p>
            </body>
            </html>
          `);
        }
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Página não encontrada');
    }
  });
}

// Função principal
async function main() {
  console.log('🔍 Iniciando teste básico de autenticação LinkedIn...');
  console.log('📋 Testando apenas escopos básicos (sem necessidade de aprovação)');
  
  // Obter credenciais do Doppler
  const clientId = await getDopplerSecret('LINKEDIN_CLIENT_ID');
  const clientSecret = await getDopplerSecret('LINKEDIN_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    console.log('❌ Credenciais não encontradas no Doppler');
    process.exit(1);
  }
  
  console.log('✅ Credenciais encontradas no Doppler');
  
  // Criar e iniciar servidor
  const server = createServer(clientId, clientSecret);
  
  server.listen(PORT, () => {
    console.log(`🌐 Servidor de teste rodando em http://localhost:${PORT}`);
    console.log(`🔗 Acesse: http://localhost:${PORT} para testar`);
    console.log('⏳ Aguardando autorização...');
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando servidor...');
    server.close(() => {
      console.log('✅ Servidor encerrado');
      process.exit(0);
    });
  });
}

// Executar
main().catch(console.error);