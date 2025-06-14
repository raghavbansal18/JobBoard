import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const Layout = ({ children, isAdmin = false, onLogout }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 
              className="text-2xl font-bold text-foreground cursor-pointer"
              onClick={() => navigate('/')}
            >
              JobBoard Pro
            </h1>
            
            <nav className="flex items-center gap-4">
              {!isAdmin && (
                <>
                  <Button
                    variant={location.pathname === '/' ? 'default' : 'ghost'}
                    onClick={() => navigate('/')}
                  >
                    Jobs
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin')}
                  >
                    Admin Login
                  </Button>
                </>
              )}
              
              {isAdmin && (
                <>
                  <Button
                    variant={location.pathname === '/admin/dashboard' ? 'default' : 'ghost'}
                    onClick={() => navigate('/admin/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant={location.pathname === '/admin/jobs' ? 'default' : 'ghost'}
                    onClick={() => navigate('/admin/jobs')}
                  >
                    Manage Jobs
                  </Button>
                  <Button
                    variant={location.pathname === '/admin/applications' ? 'default' : 'ghost'}
                    onClick={() => navigate('/admin/applications')}
                  >
                    Applications
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={onLogout}
                  >
                    Logout
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;