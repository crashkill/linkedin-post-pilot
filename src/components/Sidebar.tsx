import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  FileText, 
  PlusCircle, 
  Calendar, 
  Settings, 
  BarChart3, 
  Zap,
  LogOut,
  User,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Criar Post',
      href: '/create',
      icon: PlusCircle,
      current: location.pathname === '/create',
      badge: 'Novo'
    },
    {
      name: 'Posts',
      href: '/posts',
      icon: FileText,
      current: location.pathname === '/posts'
    },
    {
      name: 'Templates',
      href: '/templates',
      icon: Sparkles,
      current: location.pathname === '/templates',
      badge: 'Beta'
    },
    {
      name: 'Agendamentos',
      href: '/schedule',
      icon: Calendar,
      current: location.pathname === '/schedule'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      current: location.pathname === '/analytics'
    },
    {
      name: 'Configurações',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings'
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className={cn(
      "flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border",
      className
    )}>
      {/* Header */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">
              Post Pilot
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              LinkedIn Automation
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                item.current
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <Badge 
                  variant={item.current ? "secondary" : "outline"} 
                  className="text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-sidebar-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.email || 'Usuário'}
            </p>
            <p className="text-xs text-sidebar-foreground/60">
              Conta ativa
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;