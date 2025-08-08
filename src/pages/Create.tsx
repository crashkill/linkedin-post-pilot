import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { postsService } from '@/services/postsService'
import { Loader2, Save, Send, X, Plus, Image as ImageIcon, Sparkles } from 'lucide-react'
import ImageGenerator from '@/components/ImageGenerator'

interface PostData {
  title: string
  content: string
  category: string
  status: 'draft' | 'scheduled' | 'published'
  scheduled_for?: string
  hashtags: string[]
}

interface DraftPost {
  title: string
  content: string
  fromTemplate?: boolean
  templateName?: string
}

const categories = [
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'carreira', label: 'Carreira' },
  { value: 'negocios', label: 'Negócios' },
  { value: 'inovacao', label: 'Inovação' },
  { value: 'lideranca', label: 'Liderança' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'empreendedorismo', label: 'Empreendedorismo' },
  { value: 'produtividade', label: 'Produtividade' },
  { value: 'networking', label: 'Networking' },
  { value: 'desenvolvimento', label: 'Desenvolvimento' },
  { value: 'outros', label: 'Outros' }
]

export function Create() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showImageGenerator, setShowImageGenerator] = useState(false)
  const [newHashtag, setNewHashtag] = useState('')
  
  const [postData, setPostData] = useState<PostData>({
    title: '',
    content: '',
    category: '',
    status: 'draft',
    hashtags: []
  })

  // Carregar dados do template se disponível
  useEffect(() => {
    const draftPost = localStorage.getItem('draftPost')
    if (draftPost) {
      try {
        const parsed: DraftPost = JSON.parse(draftPost)
        setPostData(prev => ({
          ...prev,
          title: parsed.title || '',
          content: parsed.content || ''
        }))
        
        // Extrair hashtags do conteúdo se existirem
        const hashtagMatches = parsed.content?.match(/#\w+/g)
        if (hashtagMatches) {
          const hashtags = hashtagMatches.map(tag => tag.replace('#', ''))
          setPostData(prev => ({ ...prev, hashtags }))
        }
        
        if (parsed.fromTemplate) {
          toast({
            title: "Template carregado!",
            description: `Conteúdo do template "${parsed.templateName}" foi aplicado.`
          })
        }
        
        // Limpar localStorage após carregar
        localStorage.removeItem('draftPost')
      } catch (error) {
        console.error('Erro ao carregar draft:', error)
      }
    }
  }, [])

  const handleInputChange = (field: keyof PostData, value: string) => {
    setPostData(prev => ({ ...prev, [field]: value }))
  }

  const addHashtag = () => {
    if (newHashtag.trim() && !postData.hashtags.includes(newHashtag.trim())) {
      setPostData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, newHashtag.trim()]
      }))
      setNewHashtag('')
    }
  }

  const removeHashtag = (hashtag: string) => {
    setPostData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== hashtag)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addHashtag()
    }
  }

  const handleSave = async (status: 'draft' | 'published') => {
    if (!postData.title.trim() || !postData.content.trim() || !postData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, conteúdo e categoria.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      await postsService.createPost({
        ...postData,
        status
      })

      toast({
        title: status === 'draft' ? "Rascunho salvo!" : "Post publicado!",
        description: status === 'draft' 
          ? "Seu post foi salvo como rascunho." 
          : "Seu post foi publicado com sucesso."
      })

      navigate('/dashboard')
    } catch (error) {
      console.error('Erro ao salvar post:', error)
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o post. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageGenerated = (imageUrl: string) => {
    // Adicionar a imagem ao conteúdo do post
    const imageMarkdown = `\n\n![Imagem gerada](${imageUrl})`
    setPostData(prev => ({
      ...prev,
      content: prev.content + imageMarkdown
    }))
    
    toast({
      title: "Imagem adicionada!",
      description: "A imagem foi adicionada ao seu post."
    })
    
    setShowImageGenerator(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Post</h1>
        <p className="text-gray-600">Crie um novo post para o LinkedIn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo do Post</CardTitle>
              <CardDescription>
                Preencha as informações do seu post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={postData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Digite o título do seu post..."
                  className="text-lg"
                />
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={postData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Conteúdo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Conteúdo *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImageGenerator(true)}
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Gerar Imagem
                  </Button>
                </div>
                <Textarea
                  id="content"
                  value={postData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Escreva o conteúdo do seu post..."
                  rows={12}
                  className="resize-none"
                />
                <div className="text-sm text-gray-500">
                  {postData.content.length} caracteres
                </div>
              </div>

              {/* Hashtags */}
              <div className="space-y-2">
                <Label>Hashtags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite uma hashtag..."
                    className="flex-1"
                  />
                  <Button type="button" onClick={addHashtag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {postData.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {postData.hashtags.map((hashtag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        #{hashtag}
                        <button
                          onClick={() => removeHashtag(hashtag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {postData.title && (
                  <div>
                    <h3 className="font-semibold text-lg">{postData.title}</h3>
                  </div>
                )}
                {postData.content && (
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">
                    {postData.content.substring(0, 200)}
                    {postData.content.length > 200 && '...'}
                  </div>
                )}
                {postData.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {postData.hashtags.map((hashtag, index) => (
                      <span key={index} className="text-blue-600 text-sm">
                        #{hashtag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleSave('draft')}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Rascunho
              </Button>
              
              <Button
                onClick={() => handleSave('published')}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Publicar Post
              </Button>
            </CardContent>
          </Card>

          {/* Dicas */}
          <Alert>
            <Sparkles className="w-4 h-4" />
            <AlertDescription>
              <strong>Dicas:</strong>
              <ul className="mt-2 text-sm space-y-1">
                <li>• Use hashtags relevantes para aumentar o alcance</li>
                <li>• Mantenha o conteúdo entre 1300-3000 caracteres</li>
                <li>• Adicione uma pergunta para engajar a audiência</li>
                <li>• Use emojis para tornar o post mais visual</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Modal do Gerador de Imagens */}
      {showImageGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Gerar Imagem com IA</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImageGenerator(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <ImageGenerator
                onImageGenerated={handleImageGenerated}
                postTitle={postData.title}
                postContent={postData.content}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Create