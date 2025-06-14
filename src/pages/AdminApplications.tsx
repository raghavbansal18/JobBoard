import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Mail, Phone, FileText, User, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminApplications = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [loading, setLoading] = useState(true);
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

    // Load applications and jobs from Supabase
    loadApplicationsAndJobs();
  }, [navigate]);

  const loadApplicationsAndJobs = async () => {
    try {
      setLoading(true);
      
      // Load applications with job details
      const { data: applicationsData, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          jobs:job_id (
            title,
            department
          )
        `);

      if (appsError) throw appsError;

      // Load all jobs for filter dropdown
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*');

      if (jobsError) throw jobsError;

      // Format applications with job details
      const enhancedApplications = applicationsData?.map((app: any) => ({
        ...app,
        jobTitle: app.jobs?.title || 'Unknown Job',
        jobDepartment: app.jobs?.department || 'Unknown Department',
        jobId: app.job_id,
        fullName: app.full_name,
        appliedAt: app.applied_at
      })) || [];

      setApplications(enhancedApplications);
      setJobs(jobsData || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminEmail');
    navigate('/');
  };

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      // Update local state
      const updatedApplications = applications.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      );
      setApplications(updatedApplications);
      
      toast({
        title: 'Status Updated',
        description: `Application status changed to ${newStatus}`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update application status',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'default';
      case 'shortlisted': return 'default';
      case 'rejected': return 'destructive';
      case 'hired': return 'default';
      default: return 'secondary';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (jobFilter !== 'all' && app.jobId !== jobFilter) return false;
    return true;
  });

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Layout isAdmin onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Applications</h1>
          <p className="text-muted-foreground">Review and manage job applications</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
            </SelectContent>
          </Select>

          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map(job => (
                <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Applications Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading applications...</span>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredApplications.map(application => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-semibold">{application.fullName}</h3>
                          <Badge variant={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{application.jobTitle}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{application.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{application.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Select
                          value={application.status}
                          onValueChange={(value) => handleStatusUpdate(application.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="hired">Hired</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="outline"
                          onClick={() => handleViewApplication(application)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredApplications.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No applications found matching your criteria.</p>
              </div>
            )}
          </>
        )}

        {/* Application Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Applicant Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{selectedApplication.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{selectedApplication.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedApplication.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Job Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{selectedApplication.jobTitle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 text-center">📋</span>
                        <span>{selectedApplication.jobDepartment}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Applied {new Date(selectedApplication.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Resume</h4>
                  {selectedApplication.resume ? (
                    <div className="p-4 border rounded-md">
                      <p className="text-sm">Resume uploaded: {selectedApplication.resume.name || 'resume.pdf'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: In a real application, this would link to the uploaded file
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No resume uploaded</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Current Status</h4>
                  <Badge variant={getStatusColor(selectedApplication.status)}>
                    {selectedApplication.status}
                  </Badge>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminApplications;