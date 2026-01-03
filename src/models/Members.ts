import mongoose, { Schema, Document } from 'mongoose';

interface IPersonalInfo {
  name: string;
  regNumber: string;
  phoneNumber: string;
  branchSpecialization: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: Date;
  vitEmail: string;
  personalEmail: string;
  otherOrganizations: string;
}

interface IDomainInfo {
  domain: string;
  subDomain: string;
  projects: string;
}

interface ICommitmentInfo {
  likedSenior: string;
  commitment: number;
  commitmentJustification: string;
}

interface IFormSubmission extends Document {
  personalInfo: IPersonalInfo;
  domainInfo: IDomainInfo;
  commitmentInfo: ICommitmentInfo;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
  submittedAt?: Date;
  createdAt?: Date;
}

// --- SCHEMAS ---

const PersonalInfoSchema = new Schema<IPersonalInfo>({
  name: { type: String, required: true, trim: true },
  regNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true,
    match: [/^(24|25)[A-Z]{3}[0-9]{4}$/, 'Invalid Registration Number'] 
  },
  phoneNumber: { type: String, required: true, match: [/^[0-9]{10}$/, 'Invalid Phone Number'] },
  branchSpecialization: { type: String, required: true, trim: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  dob: { type: Date, required: true },
  vitEmail: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true, 
    match: [/^[a-zA-Z0-9._%+-]+@vitstudent\.ac\.in$/, 'Invalid VIT Email'] 
  },
  personalEmail: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true, 
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid Personal Email']
  },
  otherOrganizations: { type: String, required: true, trim: true }
}, { _id: false });

const DomainInfoSchema = new Schema<IDomainInfo>({
  domain: { type: String, required: true, trim: true },
  subDomain: { type: String, trim: true }, // Optional depending on domain
  projects: { type: String, required: true, trim: true }
}, { _id: false });

const CommitmentInfoSchema = new Schema<ICommitmentInfo>({
  likedSenior: { type: String, required: true, trim: true },
  commitment: { type: Number, required: true, min: 1, max: 5 },
  commitmentJustification: { type: String, required: true, trim: true }
}, { _id: false });

// Main Schema
const FormSubmissionSchema = new Schema<IFormSubmission>({
  personalInfo: { type: PersonalInfoSchema, required: true },
  domainInfo: { type: DomainInfoSchema, required: true },
  commitmentInfo: { type: CommitmentInfoSchema, required: true },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'approved', 'rejected'],
    default: 'submitted'
  },
  reviewedBy: String,
  reviewedAt: Date,
  notes: String,
  submittedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Indexes
FormSubmissionSchema.index({ 'personalInfo.regNumber': 1 }, { unique: true });
FormSubmissionSchema.index({ 'personalInfo.vitEmail': 1 });
FormSubmissionSchema.index({ 'domainInfo.domain': 1 });
FormSubmissionSchema.index({ status: 1 });
FormSubmissionSchema.index({ submittedAt: -1 });

export default mongoose.models.FormSubmission || mongoose.model<IFormSubmission>('FormSubmission', FormSubmissionSchema);