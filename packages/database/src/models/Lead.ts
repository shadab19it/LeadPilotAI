import { Schema, model, Document } from 'mongoose';
import type { Lead, LeadStatus, LeadSource } from '@leadpilot/types';

export interface LeadDocument extends Omit<Lead, '_id' | 'createdAt' | 'updatedAt'>, Document {}

// ─── Sub-schemas ─────────────────────────────

const TechStackSchema = new Schema(
  {
    detected: { type: [String], default: [] },
    frameworks: { type: [String], default: [] },
    cloud: { type: [String], default: [] },
    databases: { type: [String], default: [] },
    tools: { type: [String], default: [] },
  },
  { _id: false }
);

const CompanySchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    website: { type: String, required: true },
    industry: { type: String, default: '' },
    services: { type: [String], default: [] },
    teamSize: { type: String, default: '' },
    country: { type: String, default: '', index: true },
    contactPage: String,
    publicEmail: String,
    founderName: String,
    founderTitle: String,
    linkedInUrl: String,
    githubOrg: String,
    portfolio: String,
    caseStudies: String,
    blog: String,
    hiringStatus: { type: Boolean, default: false },
    techStack: { type: TechStackSchema, default: () => ({}) },
  },
  { _id: false }
);

const LeadScoreSchema = new Schema(
  {
    overall: { type: Number, default: 0, min: 0, max: 100 },
    confidence: { type: Number, default: 0, min: 0, max: 100 },
    breakdown: {
      teamSize: { type: Number, default: 0 },
      technology: { type: Number, default: 0 },
      growth: { type: Number, default: 0 },
      hiring: { type: Number, default: 0 },
      activity: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const AIAnalysisSchema = new Schema(
  {
    summary: String,
    businessModel: String,
    targetCustomers: String,
    technologies: String,
    growthSignals: { type: [String], default: [] },
    hiringSignals: { type: [String], default: [] },
    outsourcingLikelihood: {
      type: String,
      enum: ['Very High', 'High', 'Medium', 'Low'],
    },
    collaborationOpportunities: { type: [String], default: [] },
    bestOutreachAngle: String,
  },
  { _id: false }
);

const OutreachDraftSchema = new Schema({
  type: {
    type: String,
    enum: [
      'linkedin_connection',
      'linkedin_followup',
      'cold_email',
      'followup_email',
      'contact_form',
      'discovery_call',
    ],
    required: true,
  },
  subject: String,
  content: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
});

// ─── Main Lead Schema ─────────────────────────

const LeadSchema = new Schema<LeadDocument>(
  {
    company: { type: CompanySchema, required: true },
    source: { type: String, required: true, index: true },
    sourceUrl: { type: String, required: true },
    status: {
      type: String,
      default: 'New',
      index: true,
    },
    score: {
      type: LeadScoreSchema,
      default: () => ({
        overall: 0,
        confidence: 0,
        breakdown: { teamSize: 0, technology: 0, growth: 0, hiring: 0, activity: 0 },
      }),
    },
    analysis: AIAnalysisSchema,
    outreachDrafts: { type: [OutreachDraftSchema], default: [] },
    notes: { type: String, default: '' },
    tags: { type: [String], default: [] },
    lastContactedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────
LeadSchema.index({ 'company.name': 'text', 'company.website': 'text', 'company.industry': 'text' });
LeadSchema.index({ 'score.overall': -1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ 'company.country': 1 });
LeadSchema.index({ source: 1, 'company.website': 1 }, { unique: true, sparse: true });

export const LeadModel = model<LeadDocument>('Lead', LeadSchema);
