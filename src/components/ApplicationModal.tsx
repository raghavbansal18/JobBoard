import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  posting_date: string;
}

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onSubmit: (applicationData: any) => Promise<void>;
}

const ApplicationModal = ({ isOpen, onClose, job, onSubmit }: ApplicationModalProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    resume: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF or Word document',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 5MB',
          variant: 'destructive'
        });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Full name is required',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!formData.email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Email is required',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!formData.phone.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Phone number is required',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!formData.resume) {
      toast({
        title: 'Validation Error',
        description: 'Resume is required',
        variant: 'destructive'
      });
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return false;
    }
    
    // Phone validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s|-|\(|\)/g, ''))) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid phone number',
        variant: 'destructive'
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !job) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        jobId: job.id,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        resume: formData.resume
      });
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        resume: null
      });
      
      onClose();
      
      toast({
        title: 'Application Submitted',
        description: 'Your application has been submitted successfully!'
      });
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit application. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for {job?.title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="resume">Resume * (PDF, DOC, or DOCX)</Label>
            <Input
              id="resume"
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              required
            />
            {formData.resume && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {formData.resume.name}
              </p>
            )}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;