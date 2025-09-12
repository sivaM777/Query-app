import z from "zod";

// User schemas
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  role: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// Integration schemas
export const IntegrationSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.enum(['jira', 'confluence', 'github', 'servicenow', 'slack', 'zendesk', 'linear', 'notion']),
  config: z.string(), // JSON string
  is_active: z.boolean().default(true),
  last_sync_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Integration = z.infer<typeof IntegrationSchema>;

// Knowledge Base schemas
export const KnowledgeBaseSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  category: z.string().optional(),
  tags: z.string().optional(), // JSON string array
  rating: z.number().default(0),
  views: z.number().default(0),
  is_published: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

export type KnowledgeBase = z.infer<typeof KnowledgeBaseSchema>;

// SLA Configuration schemas
export const SLAConfigSchema = z.object({
  id: z.number(),
  name: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  response_time: z.number(), // minutes
  resolution_time: z.number(), // minutes
  escalation_rules: z.string(), // JSON string
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export type SLAConfig = z.infer<typeof SLAConfigSchema>;

// Search Query schemas
export const SearchQuerySchema = z.object({
  id: z.number(),
  query: z.string(),
  user_id: z.number().optional(),
  results_count: z.number().optional(),
  execution_time: z.number().optional(),
  created_at: z.string(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

// API Request/Response schemas
export const CreateKnowledgeBaseRequestSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const CreateIntegrationRequestSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['jira', 'confluence', 'github', 'servicenow', 'slack', 'zendesk', 'linear', 'notion']),
  config: z.record(z.any()),
});

export const SearchRequestSchema = z.object({
  query: z.string().min(1),
  sources: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(20),
});

export type CreateKnowledgeBaseRequest = z.infer<typeof CreateKnowledgeBaseRequestSchema>;
export type CreateIntegrationRequest = z.infer<typeof CreateIntegrationRequestSchema>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
