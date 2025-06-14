import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, FileText, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (!adminLoggedIn) {
      navigate('/admin');
      return;
    }
    setIsLoggedIn(true);

    // Load statistics (mock data)
    const jobs = JSON.parse(localStorage.getItem('adminJobs') || '[]');
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    
    setStats({
      totalJobs: jobs.length,
      activeJobs: jobs.filter((job: any) => job.is_active).length,
      totalApplications: applications.length,
      pendingApplications: applications.filter((app: any) => app.status === 'pending').length
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminEmail');
    navigate('/');
  };

  if (!isLoggedIn) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingApplications,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <Layout isAdmin onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the admin portal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">New application received</span>
                  <Badge variant="secondary">2 min ago</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Job posting created</span>
                  <Badge variant="secondary">1 hour ago</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Application reviewed</span>
                  <Badge variant="secondary">3 hours ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/admin/jobs')}
                  className="w-full text-left p-3 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="font-medium">Manage Jobs</div>
                  <div className="text-sm text-muted-foreground">Create and edit job postings</div>
                </button>
                <button
                  onClick={() => navigate('/admin/applications')}
                  className="w-full text-left p-3 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="font-medium">Review Applications</div>
                  <div className="text-sm text-muted-foreground">View and manage applications</div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;