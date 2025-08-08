const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Carregar variáveis de ambiente do .env.temp
const envTempPath = path.join(__dirname, '.env.temp');
if (fs.existsSync(envTempPath)) {
  const envContent = fs.readFileSync(envTempPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

console.log('🚀 Testando criação e envio de post no LinkedIn...');

// Configurar Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLinkedInPost() {
  try {
    // 1. Fazer login do usuário
    console.log('🔐 Fazendo login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    });

    if (authError) {
      console.error('❌ Erro no login:', authError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('👤 Usuário:', authData.user.email);

    // 2. Criar um post de teste
    const postContent = {
      content: `🚀 Testando o LinkedIn Post Pilot!\n\nEste é um post criado automaticamente pela nossa aplicação de automação de posts do LinkedIn.\n\n✨ Funcionalidades:\n• Criação automática de posts\n• Agendamento inteligente\n• Templates personalizáveis\n• Análise de performance\n\n#LinkedInAutomation #PostPilot #TechInnovation #SocialMedia`,
      scheduled_for: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutos no futuro
      status: 'draft'
    };

    console.log('📝 Criando post no banco de dados...');
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: authData.user.id,
        content: postContent.content,
        scheduled_for: postContent.scheduled_for,
        status: postContent.status,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (postError) {
      console.error('❌ Erro ao criar post:', postError.message);
      return;
    }

    console.log('✅ Post criado no banco de dados!');
    console.log('📊 ID do post:', postData.id);

    // 3. Simular envio para LinkedIn (aqui você integraria com a API do LinkedIn)
    console.log('📤 Simulando envio para LinkedIn...');
    
    // Atualizar status do post para 'published'
    const { error: updateError } = await supabase
      .from('posts')
      .update({ 
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', postData.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar status:', updateError.message);
      return;
    }

    console.log('✅ Post marcado como publicado!');
    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('📋 Resumo:');
    console.log(`   • Post ID: ${postData.id}`);
    console.log(`   • Conteúdo: ${postContent.content.substring(0, 50)}...`);
    console.log(`   • Status: published`);
    console.log(`   • Data de publicação: ${new Date().toLocaleString('pt-BR')}`);

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testLinkedInPost();