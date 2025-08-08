const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando variáveis do Supabase sem usar Doppler CLI...');

// Chaves corretas fornecidas pelo usuário
const SUPABASE_URL = 'https://jhfypcjgmkdloyhtonwr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTA2NTEsImV4cCI6MjA2OTcyNjY1MX0.cDCd3l5STja3Cl1s5Z2-Px2fbdsSUqYe35IzJZzqLH0';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE1MDY1MSwiZXhwIjoyMDY5NzI2NjUxfQ.wmsAYzTw4ihW8vNPE2CftMHQGFPYUTm7E0zqcPcjc8I';

try {
  // Criar arquivo temporário com as variáveis corretas
  const tempEnvPath = path.join(__dirname, '.env.temp');
  const envContent = `# Configuração temporária do Supabase\n# Estas variáveis devem ser migradas para o Doppler quando possível\nVITE_SUPABASE_URL=${SUPABASE_URL}\nVITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}\nSUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}\n`;
  
  fs.writeFileSync(tempEnvPath, envContent);
  console.log('✅ Arquivo .env.temp criado com as variáveis corretas');
  
  // Atualizar run-with-env.cjs para usar o arquivo temporário
  const runWithEnvPath = path.join(__dirname, 'run-with-env.cjs');
  let runWithEnvContent = fs.readFileSync(runWithEnvPath, 'utf8');
  
  // Modificar para carregar também do .env.temp
  if (!runWithEnvContent.includes('.env.temp')) {
    runWithEnvContent = runWithEnvContent.replace(
      /const envFiles = \[.*?\];/s,
      `const envFiles = ['.env.local', '.env.temp', '.env'];`
    );
    
    fs.writeFileSync(runWithEnvPath, runWithEnvContent);
    console.log('✅ run-with-env.cjs atualizado para carregar .env.temp');
  }
  
  // Atualizar arquivo supabase.ts para usar apenas variáveis de ambiente
  const supabaseTsPath = path.join(__dirname, 'src', 'lib', 'supabase.ts');
  let supabaseContent = fs.readFileSync(supabaseTsPath, 'utf8');
  
  // Garantir que não há fallbacks hardcoded
  supabaseContent = supabaseContent.replace(
    /const supabaseUrl = .*/,
    `const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!`
  );
  
  supabaseContent = supabaseContent.replace(
    /const supabaseAnonKey = .*/,
    `const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!`
  );
  
  fs.writeFileSync(supabaseTsPath, supabaseContent);
  console.log('✅ Arquivo supabase.ts atualizado para usar apenas variáveis de ambiente');
  
  // Remover arquivo .env.local se existir
  const envLocalPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    fs.unlinkSync(envLocalPath);
    console.log('🗑️ Arquivo .env.local removido');
  }
  
  console.log('\n🎉 Configuração atualizada com sucesso!');
  console.log('🔒 Variáveis do Supabase configuradas em .env.temp');
  console.log('📝 Reinicie o servidor para aplicar as mudanças');
  console.log('⚠️ IMPORTANTE: Migre essas variáveis para o Doppler quando o limite de tokens for resolvido');
  
} catch (error) {
  console.error('❌ Erro ao configurar variáveis:', error.message);
  process.exit(1);
}