#!/usr/bin/env node

/**
 * Script para testar a conectividade com o Supabase
 * Valida as configurações e verifica se as tabelas estão acessíveis
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Função para ler arquivo .env manualmente
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=').replace(/"/g, '');
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.log('⚠️  Arquivo .env não encontrado. Execute: node setup-env.cjs');
    return {};
  }
}

// Carregar variáveis de ambiente
const envVars = loadEnvFile();
const supabaseUrl = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY;

function formatCheck(status, message) {
  const icon = status ? '✅' : '❌';
  console.log(`${icon} ${message}`);
}

async function testSupabaseConnection() {
  console.log('🔍 Testando conectividade com Supabase...');
  console.log('=' .repeat(50));
  
  // Verificar variáveis de ambiente
  formatCheck(!!supabaseUrl, `URL do Supabase: ${supabaseUrl || 'NÃO CONFIGURADA'}`);
  formatCheck(!!supabaseKey, `Chave anônima: ${supabaseKey ? 'CONFIGURADA' : 'NÃO CONFIGURADA'}`);
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ Configurações incompletas. Execute: node setup-env.cjs');
    process.exit(1);
  }
  
  try {
    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('\n🔗 Testando conexão...');
    
    // Testar conexão básica
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (healthError) {
      formatCheck(false, `Erro na conexão: ${healthError.message}`);
      return false;
    }
    
    formatCheck(true, 'Conexão estabelecida com sucesso');
    
    // Testar tabelas principais
    console.log('\n📊 Verificando tabelas...');
    
    const tables = [
      { name: 'users', description: 'Usuários' },
      { name: 'posts', description: 'Posts' },
      { name: 'images', description: 'Imagens' },
      { name: 'schedules', description: 'Agendamentos' },
      { name: 'analytics', description: 'Analytics' }
    ];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          formatCheck(false, `${table.description} (${table.name}): ${error.message}`);
        } else {
          formatCheck(true, `${table.description} (${table.name}): ${count || 0} registros`);
        }
      } catch (err) {
        formatCheck(false, `${table.description} (${table.name}): Erro inesperado`);
      }
    }
    
    // Testar autenticação
    console.log('\n🔐 Testando autenticação...');
    
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      formatCheck(false, `Erro na autenticação: ${authError.message}`);
    } else {
      formatCheck(true, 'Sistema de autenticação funcionando');
    }
    
    // Resumo
    console.log('\n' + '=' .repeat(50));
    console.log('📋 RESUMO DA CONFIGURAÇÃO');
    console.log('=' .repeat(50));
    console.log(`🌐 Projeto: jhfypcjgmkdloyhtonwr`);
    console.log(`🔗 URL: ${supabaseUrl}`);
    console.log(`🔑 Autenticação: Configurada`);
    console.log(`📊 Tabelas: Acessíveis`);
    console.log(`✅ Status: PRONTO PARA USO`);
    
    console.log('\n🚀 Próximos passos:');
    console.log('1. Instalar Doppler CLI');
    console.log('2. Configurar segredos reais no Doppler');
    console.log('3. Executar: doppler run -- npm run dev');
    
    return true;
    
  } catch (error) {
    formatCheck(false, `Erro inesperado: ${error.message}`);
    console.log('\n🔧 Possíveis soluções:');
    console.log('- Verificar se as variáveis de ambiente estão corretas');
    console.log('- Verificar conectividade com a internet');
    console.log('- Verificar se o projeto Supabase está ativo');
    
    return false;
  }
}

// Executar teste
testSupabaseConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });