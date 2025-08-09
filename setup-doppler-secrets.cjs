#!/usr/bin/env node

/**
 * Script para configurar todas as variáveis no Doppler
 * Execute este script após instalar o Doppler CLI
 */

const { execSync } = require('child_process');

const commands = [
  `doppler secrets set VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4NzcsImV4cCI6MjA1MDU0ODg3N30.Zt8vKJGZQKJGZQKJGZQKJGZQKJGZQKJGZQKJGZQKJGZQ"`,
  `doppler secrets set SUPABASE_URL="https://jhfypcjgmkdloyhtonwr.supabase.co"`,
  `doppler secrets set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4NzcsImV4cCI6MjA1MDU0ODg3N30.Zt8vKJGZQKJGZQKJGZQKJGZQKJGZQKJGZQKJGZQKJGZQ"`,
  `doppler secrets set LINKEDIN_CLIENT_ID="776n0i9m37tkpu"`,
  `doppler secrets set LINKEDIN_CLIENT_SECRET="WPL_AP1.DSD9paGhUlTtepYR.l8THTg=="`,
  `doppler secrets set LINKEDIN_REDIRECT_URI="http://localhost:8080/auth/linkedin/callback"`,
];

console.log('🔐 Configurando variáveis no Doppler...');

for (const command of commands) {
  try {
    console.log(`\n📝 Executando: ${command}`);
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Sucesso!');
  } catch (error) {
    console.error(`\n❌ Erro ao executar: ${command}`);
    console.error(error.message);
  }
}

console.log('\n🎉 Configuração do Doppler concluída!');
console.log('💡 Para executar o projeto: doppler run -- npm run dev');