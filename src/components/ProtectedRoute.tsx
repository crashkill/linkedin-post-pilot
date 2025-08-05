import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireLinkedIn?: boolean
}

export function ProtectedRoute({ children, requireLinkedIn = false }: ProtectedRouteProps) {
  const { isAuthenticated, hasLinkedInConnected, loading } = useAuth()
  const location = useLocation()

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }}
        replace 
      />
    )
  }

  // Redirecionar para conexão LinkedIn se necessário
  if (requireLinkedIn && !hasLinkedInConnected) {
    return (
      <Navigate 
        to="/connect-linkedin" 
        state={{ from: location.pathname }}
        replace 
      />
    )
  }

  return <>{children}</>
}

export default ProtectedRoute