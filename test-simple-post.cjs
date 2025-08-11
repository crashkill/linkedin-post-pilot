const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimplePost() {
  try {
    console.log('🔐 Fazendo login...');
    
    // Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    });

    if (authError) {
      console.error('❌ Erro no login:', authError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('👤 User ID:', authData.user.id);
    console.log('📧 Email:', authData.user.email);

    // Verificar se o usuário existe na tabela users
    console.log('\n🔍 Verificando usuário na tabela users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError.message);
      return;
    }

    if (!userData) {
      console.log('⚠️ Usuário não encontrado na tabela users. Criando...');
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.name || 'Fabricio Lima'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar usuário:', createError.message);
        console.error('Detalhes:', createError);
        return;
      }

      console.log('✅ Usuário criado com sucesso:', newUser);
    } else {
      console.log('✅ Usuário encontrado:', userData);
    }

    // Criar post simples
    console.log('\n📝 Criando post...');
    const postContent = {
      user_id: authData.user.id,
      title: 'Post de Teste - LinkedIn Post Pilot',
      content: 'Este é um post de teste criado pelo LinkedIn Post Pilot. 🚀\n\n#LinkedInPostPilot #AutomacaoLinkedIn #TestPost',
      category: 'technology',
      status: 'draft'
    };

    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert(postContent)
      .select()
      .single();

    if (postError) {
      console.error('❌ Erro ao criar post:', postError.message);
      console.error('Detalhes do erro:', postError);
      return;
    }

    console.log('✅ Post criado com sucesso!');
    console.log('📄 Post ID:', postData.id);
    console.log('📝 Título:', postData.title);
    console.log('📊 Status:', postData.status);
    console.log('🏷️ Categoria:', postData.category);

    console.log('\n🎉 Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar o teste
testSimplePost();