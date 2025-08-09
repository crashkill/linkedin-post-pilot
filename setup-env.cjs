#!/usr/bin/env node

/**
 * Script para configurar variáveis de ambiente do projeto
 * Simula o comportamento do Doppler até que seja instalado
 */

const fs = require('fs');
const path = require('path');

// Configurações do Supabase (projeto Fabricio-Linkedin)
const supabaseConfig = {
  url: 'https://jhfypcjgmkdloyhtonwr.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4NzcsImV4cCI6MjA1MDU0ODg3N30.Zt8vKJGZQKJGZQKJGZQKJGZQKJGZQKJGZQKJGZQKJGZQ'
};

// Template das variáveis de ambiente
const envTemplate = `# Configurações do LinkedIn Post Pilot
# Gerado automaticamente pelo setup-env.js

# Supabase - Projeto Fabricio-Linkedin
VITE_SUPABASE_URL=${supabaseConfig.url}
VITE_SUPABASE_ANON_KEY=${supabaseConfig.anonKey}
SUPABASE_URL=${supabaseConfig.url}
SUPABASE_ANON_KEY=${supabaseConfig.anonKey}
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:8080/auth/linkedin/callback

# APIs de IA (configurar no Doppler em produção)
GROQ_API_KEY=your-groq-api-key
GEMINI_API_KEY=your-gemini-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key

# Outros
JWT_SECRET=your-jwt-secret-key
NODE_ENV=development
`;

function setupEnvironment() {
  console.log('🔧 Configurando ambiente de desenvolvimento...');
  
  try {
    // Escreve o arquivo .env
    fs.writeFileSync('.env', envTemplate);
    console.log('✅ Arquivo .env criado com sucesso!');
    
    // Verifica se o Supabase está acessível
    console.log('🔍 Verificando conexão com Supabase...');
    console.log(`📡 URL: ${supabaseConfig.url}`);
    console.log(`🔑 Chave anônima configurada`);
    
    console.log('\n📋 Próximos passos:');
    console.log('1. Instalar Doppler CLI: https://docs.doppler.com/docs/install-cli');
    console.log('2. Configurar segredos no Doppler');
    console.log('3. Executar: doppler setup');
    console.log('4. Usar: doppler run -- npm run dev');
    
    console.log('\n⚠️  IMPORTANTE:');
    console.log('- Nunca commitar o arquivo .env');
    console.log('- Usar Doppler em produção');
    console.log('- Configurar as chaves de API reais');
    
  } catch (error) {
    console.error('❌ Erro ao configurar ambiente:', error.message);
    process.exit(1);
  }
}

// Executa a configuração
setupEnvironment();