import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminJobs = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    description: '',
    max_applications: 5
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (!adminLoggedIn) {
      navigate('/admin');
      return;
    }
    setIsLoggedIn(true);

    // Load jobs from localStorage
    const storedJobs = JSON.parse(localStorage.getItem('adminJobs') || '[]');
    setJobs(storedJobs);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminEmail');
    navigate('/');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      department: '',
      location: '',
      description: '',
      max_applications: 5
    });
  };

  const handleCreateJob = () => {
    resetForm();
    setEditingJob(null);
    setIsCreateModalOpen(true);
  };

  const handleEditJob = (job: any) => {
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      description: job.description,
      max_applications: job.max_applications || 5
    });
    setEditingJob(job);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.department.trim() || !formData.location.trim() || !formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required',
        variant: 'destructive'
      });
      return;
    }

    const jobData = {
      ...formData,
      id: editingJob ? editingJob.id : Date.now().toString(),
      posting_date: editingJob ? editingJob.posting_date : new Date().toISOString(),
      is_active: editingJob ? editingJob.is_active : true,
      created_at: editingJob ? editingJob.created_at : new Date().toISOString(),
      application_count: editingJob ? editingJob.application_count : 0
    };

    let updatedJobs;
    if (editingJob) {
      updatedJobs = jobs.map(job => job.id === editingJob.id ? jobData : job);
      toast({
        title: 'Job Updated',
        description: 'Job posting has been updated successfully'
      });
    } else {
      updatedJobs = [...jobs, jobData];
      toast({
        title: 'Job Created',
        description: 'New job posting has been created successfully'
      });
    }

    setJobs(updatedJobs);
    localStorage.setItem('adminJobs', JSON.stringify(updatedJobs));
    setIsCreateModalOpen(false);
    resetForm();
    setEditingJob(null);
  };

  const toggleJobStatus = (jobId: string) => {
    const updatedJobs = jobs.map(job =>
      job.id === jobId ? { ...job, is_active: !job.is_active } : job
    );
    setJobs(updatedJobs);
    localStorage.setItem('adminJobs', JSON.stringify(updatedJobs));
    
    const job = updatedJobs.find(j => j.id === jobId);
    toast({
      title: 'Job Status Updated',
      description: `Job has been ${job?.is_active ? 'activated' : 'deactivated'}`
    });
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Layout isAdmin onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Manage Jobs</h1>
            <p className="text-muted-foreground">Create and manage job postings</p>
          </div>
          <Button onClick={handleCreateJob}>
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={job.is_active ? 'default' : 'secondary'}>
                      {job.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm"><strong>Department:</strong> {job.department}</p>
                  <p className="text-sm"><strong>Location:</strong> {job.location}</p>
                  <p className="text-sm"><strong>Applications:</strong> {job.application_count || 0}/{job.max_applications}</p>
                  <p className="text-sm"><strong>Posted:</strong> {new Date(job.posting_date).toLocaleDateString()}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={job.is_active}
                      onCheckedChange={() => toggleJobStatus(job.id)}
                    />
                    <Label className="text-sm">Active</Label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditJob(job)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No jobs created yet.</p>
            <Button onClick={handleCreateJob}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Job
            </Button>
          </div>
        )}

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingJob ? 'Edit Job' : 'Create New Job'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="max_applications">Max Applications</Label>
                  <Input
                    id="max_applications"
                    name="max_applications"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.max_applications}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingJob ? 'Update Job' : 'Create Job'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminJobs;