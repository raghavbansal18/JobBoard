import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import JobCard from '@/components/JobCard';
import ApplicationModal from '@/components/ApplicationModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with Supabase data
const mockJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    description: 'We are looking for a Senior Frontend Developer to join our dynamic team. You will be responsible for developing user-facing features using React, TypeScript, and modern web technologies.',
    posting_date: '2024-01-15',
    application_count: 3,
    max_applications: 5
  },
  {
    id: '2',
    title: 'Product Manager',
    department: 'Product',
    location: 'New York, NY',
    description: 'Join our product team to drive product strategy and roadmap. You will work closely with engineering, design, and business stakeholders to deliver exceptional user experiences.',
    posting_date: '2024-01-14',
    application_count: 5,
    max_applications: 5
  },
  {
    id: '3',
    title: 'UX Designer',
    department: 'Design',
    location: 'Remote',
    description: 'We are seeking a talented UX Designer to create intuitive and engaging user experiences. You will be involved in the entire design process from research to final implementation.',
    posting_date: '2024-01-13',
    application_count: 1,
    max_applications: 5
  }
];

const Jobs = () => {
  const [jobs, setJobs] = useState(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState(mockJobs);
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
  }, []);

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
    // Mock validation - replace with actual backend logic
    const userEmail = applicationData.email;
    
    // Check if user has already applied for this job
    const hasApplied = appliedJobs.includes(applicationData.jobId);
    if (hasApplied) {
      throw new Error('You have already applied for this job');
    }

    // Check daily application limit (mock implementation)
    const today = new Date().toDateString();
    const todayApplications = JSON.parse(localStorage.getItem(`applications_${today}`) || '[]');
    
    if (todayApplications.length >= 5) {
      throw new Error('You cannot apply for more than 5 jobs within 24 hours');
    }

    // Mock: Save application
    const newApplication = {
      ...applicationData,
      id: Date.now().toString(),
      appliedAt: new Date().toISOString()
    };

    // Save to localStorage (mock backend)
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    applications.push(newApplication);
    localStorage.setItem('applications', JSON.stringify(applications));

    // Update today's applications
    todayApplications.push(newApplication.id);
    localStorage.setItem(`applications_${today}`, JSON.stringify(todayApplications));

    // Update applied jobs
    const updatedAppliedJobs = [...appliedJobs, applicationData.jobId];
    setAppliedJobs(updatedAppliedJobs);
    localStorage.setItem('appliedJobs', JSON.stringify(updatedAppliedJobs));

    // Update job application count
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === applicationData.jobId
          ? { ...job, application_count: (job.application_count || 0) + 1 }
          : job
      )
    );
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