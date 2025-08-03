import React, { useState } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp, Send } from 'lucide-react'
import { Card, CardContent, CardHeader } from './ui/card'
import { Button } from './ui/button'
import { cn, formatDate, formatNumber } from '../lib/utils'

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const handleLike = () => {
    setLiked(!liked)
  }

  const handleSave = () => {
    setSaved(!saved)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6 glass-effect border-white/10 bg-white/5 backdrop-blur-xl post-card card-3d depth-shadow">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=0077B5&color=fff&size=48`}
                alt={post.author.name}
                className="w-12 h-12 rounded-full border-2 border-blue-400/30 shadow-lg micro-bounce"
              />
              {post.author.verified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center pulse-glow">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-white hover:text-blue-300 cursor-pointer transition-colors gradient-text">
                  {post.author.name}
                </h3>
                {post.author.verified && (
                  <span className="text-blue-400 text-xs pulse-glow">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-300">{post.author.title}</p>
              <p className="text-xs text-gray-400 flex items-center space-x-1">
                <span>{formatDate(post.createdAt)}</span>
                <span>•</span>
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                  </svg>
                  Público
                </span>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 micro-bounce focus-ring">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Text Content */}
          <div className="text-white leading-relaxed">
            <p className="whitespace-pre-wrap">{post.content}</p>
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {post.hashtags.map((tag, index) => (
                  <span key={index} className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors micro-bounce pulse-glow">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Media Content */}
          {post.media && (
            <div className="rounded-lg overflow-hidden border border-white/10">
              {post.media.type === 'image' && (
                <img
                  src={post.media.url}
                  alt="Post media"
                  className="w-full h-auto max-h-96 object-cover"
                />
              )}
              {post.media.type === 'video' && (
                <video
                  src={post.media.url}
                  controls
                  className="w-full h-auto max-h-96"
                  poster={post.media.thumbnail}
                />
              )}
            </div>
          )}

          {/* Engagement Stats */}
          <div className="flex items-center justify-between text-sm text-gray-400 border-b border-white/10 pb-3">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <div className="flex -space-x-1">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white/20">
                    <ThumbsUp className="w-2 h-2 text-white" />
                  </div>
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-white/20">
                    <Heart className="w-2 h-2 text-white" />
                  </div>
                </div>
                <span>{formatNumber(post.likes || 0)}</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span>{formatNumber(post.comments || 0)} comentários</span>
              <span>{formatNumber(post.shares || 0)} compartilhamentos</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "flex items-center space-x-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 magnetic-btn focus-ring",
                liked && "text-blue-400 bg-blue-500/10 pulse-glow"
              )}
            >
              <ThumbsUp className={cn("w-4 h-4", liked && "fill-current")} />
              <span>Curtir</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-200 magnetic-btn focus-ring"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Comentar</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all duration-200 magnetic-btn focus-ring"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartilhar</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200 magnetic-btn focus-ring"
            >
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className={cn(
                "text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all duration-200 magnetic-btn focus-ring",
                saved && "text-orange-400 bg-orange-500/10 pulse-glow"
              )}
            >
              <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 space-y-3 border-t border-white/10 pt-4 fade-in-up">
              <div className="flex space-x-3">
                <img
                  src="https://ui-avatars.com/api/?name=Você&background=0077B5&color=fff&size=32"
                  alt="Seu avatar"
                  className="w-8 h-8 rounded-full micro-bounce"
                />
                <div className="flex-1">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10 glass-effect">
                    <input
                      type="text"
                      placeholder="Adicione um comentário..."
                      className="w-full bg-transparent text-white placeholder-gray-400 outline-none focus-ring"
                    />
                  </div>
                </div>
              </div>
              
              {/* Sample Comments */}
              {post.sampleComments && post.sampleComments.map((comment, index) => (
                <div key={index} className="flex space-x-3 fade-in-up" style={{animationDelay: `${index * 100}ms`}}>
                  <img
                    src={comment.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}&background=random&size=32`}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full micro-bounce"
                  />
                  <div className="flex-1">
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10 glass-effect card-3d">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-white text-sm gradient-text">{comment.author.name}</span>
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-200">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PostCard