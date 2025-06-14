import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Hardcoded admin credentials
    const ADMIN_EMAIL = 'admin@jobboard.com';
    const ADMIN_PASSWORD = 'admin123!';

    try {
      if (credentials.email === ADMIN_EMAIL && credentials.password === ADMIN_PASSWORD) {
        // Set admin session
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminEmail', credentials.email);
        
        toast({
          title: 'Login Successful',
          description: 'Welcome to the admin portal!'
        });
        
        navigate('/admin/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Login Error',
        description: 'An error occurred during login',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground mb-2">Demo Credentials:</p>
              <p className="text-sm">Email: admin@jobboard.com</p>
              <p className="text-sm">Password: admin123!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminLogin;