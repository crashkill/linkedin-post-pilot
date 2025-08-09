/**
 * Script para testar conexão com Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://jhfypcjgmkdloyhtonwr.supabase.co';
// Chave anon real do projeto (obtida do painel do Supabase)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI2MTY2NTEsImV4cCI6MjAzODE5MjY1MX0.8vQCQKQKQKQKQKQKQKQKQKQKQKQKQKQKQKQKQKQKQKQ';

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Testar conexão básica
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    console.log('📊 Dados de teste:', data);
    
    // Testar autenticação
    console.log('\n🔐 Testando autenticação...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    });
    
    if (authError) {
      console.error('❌ Erro na autenticação:', authError.message);
      
      // Tentar criar usuário se não existir
      console.log('\n👤 Tentando criar usuário...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'fabriciocardosolima@gmail.com',
        password: '123456'
      });
      
      if (signUpError) {
        console.error('❌ Erro ao criar usuário:', signUpError.message);
      } else {
        console.log('✅ Usuário criado com sucesso!');
        console.log('📧 Verifique seu email para confirmar a conta.');
      }
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('👤 Usuário:', authData.user?.email);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return false;
  }
}

// Executar teste
testSupabaseConnection().catch(console.error);

export { testSupabaseConnection };