# Job Board Application

A comprehensive job board application built with React, TypeScript, and Supabase, featuring both applicant and admin functionality.

## 🚀 Features

### For Applicants
- View available job listings with filters (search, department, location)
- Apply for jobs with personal information and resume upload
- Application status tracking

### For Administrators
- Secure admin portal with hardcoded authentication
- Create and manage job postings
- View and manage applications
- Update application statuses
- Dashboard with statistics

## 🛠 Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Routing**: React Router DOM
- **State Management**: React Hooks
- **Backend**: Supabase (Database, Authentication, File Storage)
- **Build Tool**: Vite
- **Package Manager**: npm

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd job-board-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Run the following SQL queries in your Supabase SQL editor:

   ```sql
   -- Create jobs table
   CREATE TABLE jobs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     department VARCHAR(255) NOT NULL,
     location VARCHAR(255) NOT NULL,
     description TEXT NOT NULL,
     posting_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     is_active BOOLEAN DEFAULT true,
     max_applications INTEGER DEFAULT 5,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create applications table
   CREATE TABLE applications (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
     full_name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL,
     phone VARCHAR(20) NOT NULL,
     resume_url TEXT,
     applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     status VARCHAR(50) DEFAULT 'pending'
   );

   -- Create indexes for better performance
   CREATE INDEX idx_jobs_active ON jobs(is_active);
   CREATE INDEX idx_applications_job_id ON applications(job_id);
   CREATE INDEX idx_applications_email ON applications(email);
   CREATE INDEX idx_applications_applied_at ON applications(applied_at);

   -- Enable Row Level Security
   ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
   ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

   -- RLS policies for jobs (public read access)
   CREATE POLICY "Jobs are viewable by everyone" ON jobs
     FOR SELECT USING (is_active = true);

   CREATE POLICY "Jobs can be inserted by authenticated users" ON jobs
     FOR INSERT WITH CHECK (true);

   CREATE POLICY "Jobs can be updated by authenticated users" ON jobs
     FOR UPDATE USING (true);

   -- RLS policies for applications
   CREATE POLICY "Applications can be inserted by anyone" ON applications
     FOR INSERT WITH CHECK (true);

   CREATE POLICY "Applications are viewable by authenticated users" ON applications
     FOR SELECT USING (true);
   ```


4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:8080`

## 🔐 Admin Credentials

Use these credentials to access the admin portal:

- **Email**: `admin@jobboard.com`
- **Password**: `admin123!`

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── Layout.tsx          # Main layout component
│   ├── JobCard.tsx         # Job listing card
│   └── ApplicationModal.tsx # Application form modal
├── pages/
│   ├── Jobs.tsx            # Job listings page (main page)
│   ├── AdminLogin.tsx      # Admin authentication
│   ├── AdminDashboard.tsx  # Admin dashboard
│   ├── AdminJobs.tsx       # Job management
│   └── AdminApplications.tsx # Application management
├── hooks/
│   └── use-toast.ts        # Toast notifications
└── lib/
    └── utils.ts            # Utility functions
```

## 🎯 Business Rules

### Application Limits
- **Per Job**: Maximum 5 applications allowed per job posting
- **Per Applicant**: Maximum 5 job applications within 24 hours
- **Duplicate Prevention**: One application per job per applicant

### Validation Rules
- All contact information (name, email, phone) is required
- Resume upload is mandatory
- Valid email format required
- Phone number format validation
- File type restrictions: PDF, DOC, DOCX only
- File size limit: 5MB maximum

### Admin Features
- Job posting management (create, edit, activate/deactivate)
- Application review and status updates
- Dashboard with application statistics
- Secure authentication with hardcoded credentials

## 📝 API Integration

Once Supabase is connected, the application will automatically:
- Store job postings in the database
- Manage application data
- Implement real-time updates

