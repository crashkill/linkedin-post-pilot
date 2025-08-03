import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, TrendingUp, Users, MessageSquare, Bell } from 'lucide-react'
import WebGLBackground from './components/WebGLBackground'
import PostCard from './components/PostCard'
import ThemeToggle from './components/ThemeToggle'
import Interactive3D from './components/Interactive3D'
import SmartNotifications from './components/SmartNotifications'
import SmartSearch from './components/SmartSearch'
import { Button } from './components/ui/button'
import { cn } from './lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import './index.css'

function App() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data para demonstração
  useEffect(() => {
    const mockPosts = [
      {
        id: 1,
        author: {
          name: 'Maria Silva',
          title: 'Desenvolvedora Full Stack | React & Node.js',
          avatar: null,
          verified: true
        },
        content: `🚀 Acabei de lançar meu novo projeto usando React + Vite + TailwindCSS!

Depois de semanas desenvolvendo, finalmente posso compartilhar com vocês esta aplicação moderna que combina:

✨ Interface elegante com glassmorphism
🎨 Animações WebGL em tempo real
⚡ Performance otimizada com Vite
🎯 Design system baseado em ShadCN/UI

O que vocês acham? Feedback é sempre bem-vindo! 💙

#React #Vite #TailwindCSS #WebGL #Frontend #Desenvolvimento`,
        hashtags: ['React', 'Vite', 'TailwindCSS', 'WebGL', 'Frontend'],
        media: {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
          thumbnail: null
        },
        likes: 127,
        comments: 23,
        shares: 8,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        sampleComments: [
          {
            author: { name: 'João Santos', avatar: null },
            content: 'Incrível! O design ficou muito clean e moderno. Parabéns! 👏',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
          },
          {
            author: { name: 'Ana Costa', avatar: null },
            content: 'Adorei as animações WebGL! Você poderia compartilhar algum tutorial sobre como implementar?',
            createdAt: new Date(Date.now() - 30 * 60 * 1000)
          }
        ]
      },
      {
        id: 2,
        author: {
          name: 'Carlos Mendes',
          title: 'Tech Lead | Especialista em Arquitetura de Software',
          avatar: null,
          verified: false
        },
        content: `💡 Dica rápida para devs React:

Sempre que possível, use o hook useMemo() para otimizar cálculos pesados que dependem de props ou state.

Exemplo prático:

const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])

Isso evita recálculos desnecessários a cada re-render! 🚀

#React #Performance #JavaScript #Otimização`,
        hashtags: ['React', 'Performance', 'JavaScript', 'Otimização'],
        media: null,
        likes: 89,
        comments: 15,
        shares: 12,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
        sampleComments: [
          {
            author: { name: 'Fernanda Lima', avatar: null },
            content: 'Ótima dica! Uso muito o useMemo em projetos grandes.',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          }
        ]
      },
      {
        id: 3,
        author: {
          name: 'Luciana Rodrigues',
          title: 'UX/UI Designer | Especialista em Design Systems',
          avatar: null,
          verified: true
        },
        content: `🎨 O futuro do design está na intersecção entre criatividade e tecnologia!

Estou fascinada com as possibilidades que o WebGL oferece para criar experiências imersivas na web. Combinar isso com bibliotecas como Three.js abre um mundo de possibilidades para interfaces mais dinâmicas e envolventes.

Qual a opinião de vocês sobre o uso de 3D em interfaces web? Vale a pena o trade-off de performance?

#UXDesign #WebGL #ThreeJS #Innovation #WebDesign`,
        hashtags: ['UXDesign', 'WebGL', 'ThreeJS', 'Innovation', 'WebDesign'],
        media: {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=400&fit=crop'
        },
        likes: 156,
        comments: 31,
        shares: 19,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
        sampleComments: [
          {
            author: { name: 'Pedro Oliveira', avatar: null },
            content: 'Concordo! Mas é importante balancear com acessibilidade e performance.',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
          },
          {
            author: { name: 'Camila Souza', avatar: null },
            content: 'Adorei o ponto sobre trade-offs. Nem sempre mais é melhor!',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
          }
        ]
      }
    ]

    // Simular loading
    setTimeout(() => {
      setPosts(mockPosts)
      setLoading(false)
    }, 1500)
  }, [])

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.hashtags && post.hashtags.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <WebGLBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-white/10 bg-black/20 backdrop-blur-xl fade-in-up">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold gradient-text micro-bounce">
                LinkedIn AI
              </h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-300 pulse-glow">
                <TrendingUp className="w-4 h-4" />
                <span>Trending Posts</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <SmartSearch 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                className="flex-1 max-w-md"
              />
              
              <SmartNotifications />
              
              <ThemeToggle />
              
              <Button variant="linkedin" className="hidden md:flex items-center space-x-2 magnetic-btn">
                <Plus className="w-4 h-4" />
                <span>Novo Post</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6 fade-in-up">
            {/* Profile Card */}
            <Card className="glass-effect border-white/10 bg-white/5 backdrop-blur-xl card-3d depth-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Interactive3D className="mx-auto" />
                </div>
                <img
                  src="https://ui-avatars.com/api/?name=Você&background=0077B5&color=fff&size=80"
                  alt="Seu perfil"
                  className="w-20 h-20 rounded-full mx-auto border-4 border-blue-400/30 shadow-lg micro-bounce"
                />
                <CardTitle className="text-white text-lg gradient-text">Seu Perfil</CardTitle>
                <p className="text-gray-300 text-sm typing-effect">Desenvolvedor Full Stack</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Visualizações do perfil</span>
                    <span className="text-blue-400 font-medium">127</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Conexões</span>
                    <span className="text-blue-400 font-medium">1.2k</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="glass-effect border-white/10 bg-white/5 backdrop-blur-xl card-3d depth-shadow">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-400 pulse-glow" />
                  <span>Estatísticas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 micro-bounce">
                    <Users className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium gradient-text">2.5k</p>
                      <p className="text-gray-400 text-xs">Seguidores</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 micro-bounce">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-white font-medium gradient-text">89</p>
                      <p className="text-gray-400 text-xs">Posts este mês</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Posts Feed */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-6 fade-in-up">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="glass-effect border-white/10 bg-white/5 backdrop-blur-xl card-3d">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full shimmer"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-white/20 rounded w-32 shimmer"></div>
                          <div className="h-3 bg-white/20 rounded w-24 shimmer"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-white/20 rounded w-full shimmer"></div>
                        <div className="h-4 bg-white/20 rounded w-3/4 shimmer"></div>
                        <div className="h-32 bg-white/20 rounded shimmer"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-6 fade-in-up">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post, index) => (
                    <div key={post.id} className="fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                      <PostCard post={post} />
                    </div>
                  ))
                ) : (
                  <Card className="glass-effect border-white/10 bg-white/5 backdrop-blur-xl card-3d depth-shadow">
                    <CardContent className="text-center py-12">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4 pulse-glow" />
                      <h3 className="text-white text-lg font-medium mb-2 gradient-text">Nenhum post encontrado</h3>
                      <p className="text-gray-400">Tente ajustar sua busca ou explore outros termos.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
