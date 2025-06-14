import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import JobCard from '@/components/JobCard';
import ApplicationModal from '@/components/ApplicationModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Jobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const { toast } = useToast();

  // Get unique departments and locations
  const departments = Array.from(new Set(jobs.map(job => job.department)));
  const locations = Array.from(new Set(jobs.map(job => job.location)));

  useEffect(() => {
    // Load applied jobs from localStorage
    const stored = localStorage.getItem('appliedJobs');
    if (stored) {
      setAppliedJobs(JSON.parse(stored));
    }

    // Load jobs from Supabase
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      // Get application counts for each job
      const jobsWithCount = await Promise.all(
        (jobs || []).map(async (job) => {
          const { count, error: countError } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id);

          if (countError) console.error('Error counting applications:', countError);

          return {
            ...job,
            application_count: count || 0
          };
        })
      );

      setJobs(jobsWithCount);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load jobs',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    let filtered = jobs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(job => job.department === departmentFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(job => job.location === locationFilter);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, departmentFilter, locationFilter, jobs]);

  const handleApply = (job: any) => {
    setSelectedJob(job);
    setIsApplicationModalOpen(true);
  };

  const handleApplicationSubmit = async (applicationData: any) => {
    try {
      // Check if user has already applied for this job in database
      const { data: existingApplication, error: checkError } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', applicationData.jobId)
        .eq('email', applicationData.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw checkError;
      }

      if (existingApplication) {
        throw new Error('You have already applied for this job');
      }

      // Check daily application limit
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount, error: countError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('email', applicationData.email)
        .gte('applied_at', `${today}T00:00:00.000Z`)
        .lt('applied_at', `${today}T23:59:59.999Z`);

      if (countError) throw countError;

      if ((todayCount || 0) >= 5) {
        throw new Error('You cannot apply for more than 5 jobs within 24 hours');
      }

      // Save application to database
      const { data: newApplication, error: insertError } = await supabase
        .from('applications')
        .insert({
          job_id: applicationData.jobId,
          full_name: applicationData.fullName,
          email: applicationData.email,
          phone: applicationData.phone,
          resume_url: applicationData.resumeUrl || null,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update applied jobs in localStorage for quick UI feedback
      const updatedAppliedJobs = [...appliedJobs, applicationData.jobId];
      setAppliedJobs(updatedAppliedJobs);
      localStorage.setItem('appliedJobs', JSON.stringify(updatedAppliedJobs));

      // Reload jobs to get updated application count from database
      await loadJobs();

      toast({
        title: 'Success',
        description: 'Your application has been submitted successfully!',
      });
    } catch (error: any) {
      console.error('Error submitting application:', error);
      throw error;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Available Jobs</h1>
          <p className="text-muted-foreground">Find your next opportunity</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Job Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onApply={handleApply}
              hasApplied={appliedJobs.includes(job.id)}
            />
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found matching your criteria.</p>
          </div>
        )}

        <ApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={() => setIsApplicationModalOpen(false)}
          job={selectedJob}
          onSubmit={handleApplicationSubmit}
        />
      </div>
    </Layout>
  );
};

export default Jobs;