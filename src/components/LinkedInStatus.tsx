import React, { useState, useEffect } from 'react'
import { Linkedin, CheckCircle, AlertCircle, RefreshCw, Settings, ExternalLink } from 'lucide-react'
import { linkedinService } from '../services/linkedinService'
import { toast } from 'sonner'

interface LinkedInIntegration {
  id: string
  linkedin_user_id: string
  linkedin_name: string
  linkedin_email: string
  linkedin_profile_url?: string
  linkedin_picture_url?: string
  is_active: boolean
  expires_at: string
  created_at: string
}

interface LinkedInStatusProps {
  onConnectionChange?: (connected: boolean) => void
}

const LinkedInStatus: React.FC<LinkedInStatusProps> = ({ onConnectionChange }) => {
  const [integration, setIntegration] = useState<LinkedInIntegration | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      setLoading(true)
      const status = await linkedinService.getConnectionStatus()
      setIntegration(status.connected ? status.integration : null)
      onConnectionChange?.(status.connected)
    } catch (error) {
      console.error('Erro ao verificar status de conexão:', error)
      setIntegration(null)
      onConnectionChange?.(false)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      setConnecting(true)
      const authUrl = await linkedinService.startAuth()
      
      // Abrir popup para autenticação
      const popup = window.open(
        authUrl,
        'linkedin-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )

      // Monitorar o popup
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          setConnecting(false)
          // Verificar se a conexão foi bem-sucedida
          setTimeout(() => {
            checkConnectionStatus()
          }, 1000)
        }
      }, 1000)

      // Timeout de 5 minutos
      setTimeout(() => {
        if (popup && !popup.closed) {
          popup.close()
          clearInterval(checkClosed)
          setConnecting(false)
          toast.error('Tempo limite para autenticação excedido')
        }
      }, 300000)

    } catch (error) {
      console.error('Erro ao conectar LinkedIn:', error)
      toast.error('Erro ao conectar com LinkedIn')
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true)
      await linkedinService.disconnect()
      setIntegration(null)
      onConnectionChange?.(false)
      toast.success('Conta LinkedIn desconectada com sucesso')
    } catch (error) {
      console.error('Erro ao desconectar LinkedIn:', error)
      toast.error('Erro ao desconectar conta LinkedIn')
    } finally {
      setDisconnecting(false)
    }
  }

  const isTokenExpired = (expiresAt: string) => {
    return new Date(expiresAt) <= new Date()
  }

  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffMs = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 0) return 'Expirado'
    if (diffDays === 1) return '1 dia'
    if (diffDays < 30) return `${diffDays} dias`
    
    const diffMonths = Math.floor(diffDays / 30)
    if (diffMonths === 1) return '1 mês'
    return `${diffMonths} meses`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Linkedin className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Status LinkedIn</h3>
        </div>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Linkedin className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Status LinkedIn</h3>
        </div>
        
        <button
          onClick={checkConnectionStatus}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {integration ? (
        <div className="space-y-4">
          {/* Status da Conexão */}
          <div className="flex items-start gap-3">
            {integration.linkedin_picture_url ? (
              <img
                src={integration.linkedin_picture_url}
                alt={integration.linkedin_name}
                className="w-12 h-12 rounded-full border-2 border-green-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Linkedin className="w-6 h-6 text-blue-600" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Conectado</span>
              </div>
              
              <p className="text-sm font-semibold text-gray-900">
                {integration.linkedin_name}
              </p>
              
              <p className="text-xs text-gray-500 mb-2">
                {integration.linkedin_email}
              </p>
              
              {integration.linkedin_profile_url && (
                <a
                  href={integration.linkedin_profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  Ver perfil
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Informações do Token */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Status do Token</span>
              {isTokenExpired(integration.expires_at) ? (
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-600 font-medium">Expirado</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Ativo</span>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-600">
              {isTokenExpired(integration.expires_at) 
                ? 'Token expirado. Reconecte sua conta para continuar publicando.'
                : `Expira em ${getTimeUntilExpiry(integration.expires_at)}`
              }
            </p>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            {isTokenExpired(integration.expires_at) ? (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {connecting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent"></div>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Reconectar
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {connecting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border border-blue-700 border-t-transparent"></div>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Atualizar Token
              </button>
            )}
            
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {disconnecting ? (
                <div className="animate-spin rounded-full h-4 w-4 border border-red-700 border-t-transparent"></div>
              ) : (
                <Settings className="w-4 h-4" />
              )}
              Desconectar
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Linkedin className="w-8 h-8 text-gray-400" />
          </div>
          
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Conecte sua conta LinkedIn
          </h4>
          
          <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
            Conecte sua conta LinkedIn para publicar posts automaticamente e acompanhar métricas de engajamento.
          </p>
          
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mx-auto"
          >
            {connecting ? (
              <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent"></div>
            ) : (
              <Linkedin className="w-4 h-4" />
            )}
            Conectar LinkedIn
          </button>
        </div>
      )}
    </div>
  )
}

export default LinkedInStatus