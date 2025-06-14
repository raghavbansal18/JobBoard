import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Building } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  posting_date: string;
  application_count?: number;
  max_applications?: number;
}

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
  canApply?: boolean;
  hasApplied?: boolean;
}

const JobCard = ({ job, onApply, canApply = true, hasApplied = false }: JobCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const applicationCount = job.application_count || 0;
  const maxApplications = job.max_applications || 5;
  const isFull = applicationCount >= maxApplications;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{job.title}</CardTitle>
          <div className="flex gap-2">
            {isFull && (
              <Badge variant="destructive">Full</Badge>
            )}
            {hasApplied && (
              <Badge variant="secondary">Applied</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>{job.department}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Posted {formatDate(job.posting_date)}</span>
          </div>
        </div>
        
        <p className="text-muted-foreground line-clamp-3">
          {job.description}
        </p>
        
        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-muted-foreground">
            {applicationCount}/{maxApplications} applications
          </span>
          
          <Button
            onClick={() => onApply(job)}
            disabled={!canApply || hasApplied || isFull}
            className="ml-auto"
          >
            {hasApplied ? 'Applied' : isFull ? 'Full' : 'Apply Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;