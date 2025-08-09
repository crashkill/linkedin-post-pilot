import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLinkedInPublish() {
  try {
    console.log('🧪 Testando publicação no LinkedIn...')
    
    // Fazer login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fabriciocardosolima@gmail.com',
      password: '123456'
    })
    
    if (authError) {
      console.error('❌ Erro ao fazer login:', authError)
      return
    }
    
    console.log('✅ Login realizado')
    
    // Buscar o post mais recente em draft
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (postsError) {
      console.error('❌ Erro ao buscar posts:', postsError)
      return
    }
    
    if (!posts || posts.length === 0) {
      console.log('⚠️  Nenhum post em draft encontrado')
      return
    }
    
    const post = posts[0]
    console.log(`📄 Post encontrado: ${post.title}`)
    console.log(`📅 Criado em: ${post.created_at}`)
    
    // Simular token do LinkedIn (para teste)
    const testToken = 'AQVmrLdI1vEDuNE5DHUEBqjomUKiS1aOiTg0Bi'  // Token de exemplo
    
    console.log('🔑 Atualizando integração com token de teste...')
    
    const { error: updateError } = await supabase
      .from('linkedin_integrations')
      .update({
        access_token: testToken,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', authData.user.id)
    
    if (updateError) {
      console.error('❌ Erro ao atualizar token:', updateError)
      return
    }
    
    console.log('✅ Token de teste atualizado')
    
    // Chamar a Edge Function para publicar
    console.log('📤 Testando publicação no LinkedIn...')
    
    const { data: publishData, error: publishError } = await supabase.functions.invoke('linkedin-publish', {
      body: {
        postId: post.id,
        content: post.content,
        imageUrl: post.image_url
      }
    })
    
    if (publishError) {
      console.error('❌ Erro ao publicar:', publishError)
      console.log('📋 Detalhes do erro:', JSON.stringify(publishError, null, 2))
      return
    }
    
    console.log('✅ Resposta da publicação:', publishData)
    
    // Verificar se foi publicado com sucesso
    const { data: updatedPost, error: checkError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', post.id)
      .single()
    
    if (checkError) {
      console.error('❌ Erro ao verificar post:', checkError)
      return
    }
    
    console.log(`📊 Status final do post: ${updatedPost.status}`)
    console.log(`🔗 LinkedIn Post ID: ${updatedPost.linkedin_post_id || 'N/A'}`)
    
    if (updatedPost.status === 'published') {
      console.log('🎉 Post publicado com sucesso no LinkedIn!')
    } else {
      console.log('⚠️  Post não foi publicado. Verifique os logs.')
    }
    
    // Logout
    await supabase.auth.signOut()
    console.log('👋 Logout realizado')
    
    console.log('\n📝 IMPORTANTE:')
    console.log('Para publicar realmente no LinkedIn, você precisa:')
    console.log('1. Obter um access_token válido do LinkedIn OAuth')
    console.log('2. Adicionar LINKEDIN_ACCESS_TOKEN no Doppler')
    console.log('3. O token deve ter as permissões: w_member_social')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testLinkedInPublish().then(() => {
  console.log('\n✅ Teste concluído')
}).catch(error => {
  console.error('❌ Erro no teste:', error)
})