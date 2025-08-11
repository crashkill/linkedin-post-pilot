console.log('🔍 Testando conexão completa com Supabase...');

const { createClient } = require('@supabase/supabase-js');

// Configurações obtidas via MCP
const SUPABASE_URL = 'https://jhfypcjgmkdloyhtonwr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZnlwY2pnbWtkbG95aHRvbndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTA2NTEsImV4cCI6MjA2OTcyNjY1MX0.cDCd3l5STja3Cl1s5Z2-Px2fbdsSUqYe35IzJZzqLH0';

async function testSupabaseConnection() {
  try {
    console.log('\n📡 Criando cliente Supabase...');
    
    // Criar cliente com chave anônima
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('✅ Cliente Supabase criado com sucesso');
    console.log('🌐 URL:', SUPABASE_URL);
    console.log('🔑 Chave anônima configurada');
    
    // Testar autenticação
    console.log('\n🔐 Testando autenticação...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    });
    
    if (authError) {
      console.error('❌ Erro na autenticação:', authError.message);
      return;
    }
    
    console.log('✅ Autenticação bem-sucedida');
    console.log('👤 Usuário:', authData.user.email);
    console.log('🆔 ID do usuário:', authData.user.id);
    
    // Testar acesso à tabela users
    console.log('\n👥 Testando acesso à tabela users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (userError) {
      console.error('❌ Erro ao acessar tabela users:', userError.message);
    } else {
      console.log('✅ Dados do usuário encontrados:', userData);
    }
    
    // Testar acesso à tabela posts
    console.log('\n📝 Testando acesso à tabela posts...');
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', authData.user.id)
      .limit(5);
    
    if (postsError) {
      console.error('❌ Erro ao acessar tabela posts:', postsError.message);
    } else {
      console.log(`✅ Posts encontrados: ${postsData.length}`);
      if (postsData.length > 0) {
        console.log('📄 Último post:', postsData[0].title || postsData[0].content?.substring(0, 50) + '...');
      }
    }
    
    // Testar acesso à tabela linkedin_integrations
    console.log('\n🔗 Testando acesso à tabela linkedin_integrations...');
    const { data: linkedinData, error: linkedinError } = await supabase
      .from('linkedin_integrations')
      .select('*')
      .eq('user_id', authData.user.id);
    
    if (linkedinError) {
      console.error('❌ Erro ao acessar tabela linkedin_integrations:', linkedinError.message);
    } else {
      console.log(`✅ Integrações LinkedIn encontradas: ${linkedinData.length}`);
      if (linkedinData.length > 0) {
        console.log('🔗 Status da integração:', linkedinData[0].is_active ? 'Ativa' : 'Inativa');
      }
    }
    
    console.log('\n🎉 Teste de conexão concluído com sucesso!');
    
  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

// Executar teste
testSupabaseConnection();