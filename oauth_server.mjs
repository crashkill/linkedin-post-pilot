import http from 'http';
import url from 'url';

const PORT = 8080;

// Servidor temporário para capturar o código OAuth
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/auth/linkedin/callback') {
    const code = parsedUrl.query.code;
    const error = parsedUrl.query.error;
    const errorDescription = parsedUrl.query.error_description;
    
    if (error) {
      console.error('❌ Erro na autorização:', error);
      console.error('📝 Descrição:', errorDescription);
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #d32f2f;">❌ Erro na Autorização LinkedIn</h2>
              <div style="background: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Erro:</strong> ${error}</p>
                <p><strong>Descrição:</strong> ${errorDescription || 'Não especificado'}</p>
              </div>
              <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4>🔧 Possíveis Soluções:</h4>
                <ul>
                  <li>Verificar se a aplicação LinkedIn está configurada corretamente</li>
                  <li>Confirmar se os escopos solicitados estão habilitados</li>
                  <li>Verificar se o redirect_uri está registrado</li>
                  <li>Confirmar se a aplicação está em modo de desenvolvimento</li>
                </ul>
              </div>
              <a href="/" style="display: inline-block; background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">🔄 Tentar Novamente</a>
              <a href="https://www.linkedin.com/developers/apps" target="_blank" style="display: inline-block; background: #0077b5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">⚙️ Configurar App</a>
            </div>
          </body>
        </html>
      `);
      return;
    }
    
    if (code) {
      console.log('✅ Código de autorização recebido:', code);
      
      try {
        // Trocar código por ACCESS_TOKEN
        const clientId = process.env.LINKEDIN_CLIENT_ID;
        const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
        
        if (!clientId || !clientSecret) {
          throw new Error('CLIENT_ID ou CLIENT_SECRET não encontrados no Doppler');
        }
        
        const params = new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: 'http://localhost:8080/auth/linkedin/callback',
          client_id: clientId,
          client_secret: clientSecret
        });
        
        console.log('🔄 Trocando código por ACCESS_TOKEN...');
        console.log('📋 Client ID:', clientId.substring(0, 10) + '...');
        
        const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: params.toString()
        });
        
        const responseText = await response.text();
        console.log('📤 Resposta do LinkedIn:', response.status, responseText);
        
        if (!response.ok) {
          console.error('❌ Erro ao trocar código por token:', response.status, responseText);
          throw new Error(`Erro ${response.status}: ${responseText}`);
        }
        
        const tokenData = JSON.parse(responseText);
        
        console.log('✅ ACCESS_TOKEN obtido com sucesso!');
        console.log('📋 Token:', tokenData.access_token?.substring(0, 20) + '...');
        console.log('⏰ Expira em:', tokenData.expires_in, 'segundos');
        console.log('🔐 Escopo:', tokenData.scope);
        
        // Configurar no Doppler automaticamente
        console.log('🔧 Configurando ACCESS_TOKEN no Doppler...');
        
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        try {
          const dopplerResult = await execAsync(`doppler secrets set LINKEDIN_ACCESS_TOKEN="${tokenData.access_token}"`);
          console.log('✅ ACCESS_TOKEN configurado no Doppler:', dopplerResult.stdout);
        } catch (dopplerError) {
          console.error('❌ Erro ao configurar no Doppler:', dopplerError.message);
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh;">
              <div style="max-width: 600px; margin: 0 auto; text-align: center; padding-top: 50px;">
                <h1>🎉 Autorização Bem-sucedida!</h1>
                <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; margin: 30px 0;">
                  <h3>✅ ACCESS_TOKEN Configurado</h3>
                  <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>Token:</strong> ${tokenData.access_token?.substring(0, 30)}...</p>
                    <p><strong>Expira em:</strong> ${Math.floor(tokenData.expires_in / 3600)} horas</p>
                    <p><strong>Permissões:</strong> ${tokenData.scope || 'Padrão'}</p>
                  </div>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <h4>🚀 Próximos Passos:</h4>
                  <ol style="text-align: left; display: inline-block;">
                    <li>✅ Token configurado no Doppler</li>
                    <li>🔄 Feche esta janela</li>
                    <li>📱 Teste a publicação no LinkedIn</li>
                  </ol>
                </div>
                <div style="margin-top: 30px;">
                  <button onclick="window.close()" style="background: #4caf50; color: white; border: none; padding: 15px 30px; border-radius: 5px; font-size: 16px; cursor: pointer;">✅ Fechar Janela</button>
                </div>
                <p style="margin-top: 20px; opacity: 0.8; font-size: 14px;">O servidor será fechado automaticamente em alguns segundos.</p>
              </div>
            </body>
          </html>
        `);
        
        // Fechar servidor após sucesso
        setTimeout(() => {
          console.log('🔚 Fechando servidor OAuth...');
          server.close();
          process.exit(0);
        }, 5000);
        
      } catch (error) {
        console.error('❌ Erro ao processar autorização:', error.message);
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #d32f2f;">❌ Erro no Processamento</h2>
                <div style="background: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Erro:</strong> ${error.message}</p>
                </div>
                <p>Verifique o terminal para mais detalhes.</p>
                <a href="/" style="display: inline-block; background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">🔄 Tentar Novamente</a>
              </div>
            </body>
          </html>
        `);
      }
    } else {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #d32f2f;">❌ Código de Autorização Não Encontrado</h2>
              <p>Não foi possível obter o código de autorização do LinkedIn.</p>
              <a href="/" style="display: inline-block; background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">🔄 Tentar Novamente</a>
            </div>
          </body>
        </html>
      `);
    }
  } else {
    // Página inicial com múltiplas opções de escopo
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <html>
        <head>
          <title>LinkedIn OAuth - Post Pilot</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh;">
          <div style="max-width: 700px; margin: 0 auto; text-align: center; padding-top: 50px;">
            <h1 style="font-size: 2.5em; margin-bottom: 10px;">🔑 LinkedIn OAuth</h1>
            <p style="font-size: 1.2em; opacity: 0.9;">Post Pilot - Autorização de Publicação</p>
            
            <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; margin: 30px 0; text-align: left;">
              <h3 style="text-align: center; margin-top: 0;">📋 Informações da Aplicação</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                  <strong>🆔 Client ID:</strong><br>
                  <code style="font-size: 12px; word-break: break-all;">776n0i9m37tkpu</code>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                  <strong>🔗 Redirect URI:</strong><br>
                  <code style="font-size: 12px;">http://localhost:8080/auth/linkedin/callback</code>
                </div>
              </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; margin: 30px 0;">
              <h3>🎯 Escolha o Tipo de Autorização</h3>
              <p style="margin-bottom: 25px;">Teste diferentes combinações de permissões:</p>
              
              <div style="display: grid; gap: 15px;">
                <a href="https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=776n0i9m37tkpu&redirect_uri=http://localhost:8080/auth/linkedin/callback&scope=r_liteprofile" 
                   style="display: block; background: #0077b5; color: white; padding: 15px; text-decoration: none; border-radius: 8px; transition: all 0.3s;">
                  <strong>📖 Básico - Apenas Leitura</strong><br>
                  <small>Escopo: r_liteprofile</small>
                </a>
                
                <a href="https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=776n0i9m37tkpu&redirect_uri=http://localhost:8080/auth/linkedin/callback&scope=r_liteprofile%20w_member_social" 
                   style="display: block; background: #2e7d32; color: white; padding: 15px; text-decoration: none; border-radius: 8px; transition: all 0.3s;">
                  <strong>✍️ Completo - Leitura + Escrita</strong><br>
                  <small>Escopo: r_liteprofile w_member_social</small>
                </a>
                
                <a href="https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=776n0i9m37tkpu&redirect_uri=http://localhost:8080/auth/linkedin/callback&scope=w_member_social" 
                   style="display: block; background: #f57c00; color: white; padding: 15px; text-decoration: none; border-radius: 8px; transition: all 0.3s;">
                  <strong>📝 Apenas Escrita</strong><br>
                  <small>Escopo: w_member_social</small>
                </a>
              </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-top: 30px;">
              <h4>ℹ️ Como Funciona</h4>
              <ol style="text-align: left; display: inline-block; font-size: 14px;">
                <li>Escolha uma opção de autorização acima</li>
                <li>Faça login no LinkedIn (se necessário)</li>
                <li>Autorize a aplicação</li>
                <li>Você será redirecionado automaticamente</li>
                <li>O ACCESS_TOKEN será configurado no Doppler</li>
              </ol>
            </div>
            
            <div style="margin-top: 30px;">
              <a href="https://www.linkedin.com/developers/apps" target="_blank" 
                 style="display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">
                ⚙️ Configurar App LinkedIn
              </a>
              <a href="https://developer.linkedin.com/docs/oauth" target="_blank" 
                 style="display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">
                📚 Documentação OAuth
              </a>
            </div>
          </div>
        </body>
      </html>
    `);
  }
});

server.listen(PORT, () => {
  console.log(`🌐 Servidor OAuth rodando em http://localhost:${PORT}`);
  console.log('🔗 Acesse: http://localhost:8080 para iniciar a autorização');
  console.log('⏳ Aguardando autorização do LinkedIn...');
  console.log('');
  console.log('📋 Credenciais configuradas:');
  console.log('   CLIENT_ID:', process.env.LINKEDIN_CLIENT_ID ? '✅ Configurado' : '❌ Não encontrado');
  console.log('   CLIENT_SECRET:', process.env.LINKEDIN_CLIENT_SECRET ? '✅ Configurado' : '❌ Não encontrado');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔚 Fechando servidor OAuth...');
  server.close();
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
});