import { z } from 'zod'

// User and Profile validation schemas
export const profileUpdateSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  website_url: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  privacy_settings: z.object({
    email_visible: z.boolean(),
    location_visible: z.boolean()
  }).optional(),
  notification_settings: z.object({
    fact_check_updates: z.boolean(),
    community_updates: z.boolean()
  }).optional()
})

export const usernameSchema = z.string()
  .min(3, 'Username muss mindestens 3 Zeichen lang sein')
  .max(50, 'Username darf maximal 50 Zeichen lang sein')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username darf nur Buchstaben, Zahlen, Unterstriche und Bindestriche enthalten')

// Fact check validation schemas
export const factCheckSubmissionSchema = z.object({
  source_url: z.string()
    .url('Bitte geben Sie eine gültige URL ein')
    .min(1, 'URL ist erforderlich'),
  source_type: z.enum(['social_media', 'news_article', 'website', 'other']),
  source_platform: z.enum(['twitter', 'facebook', 'instagram', 'youtube', 'tiktok', 'other']).optional(),
  original_content: z.string()
    .min(10, 'Der ursprüngliche Inhalt muss mindestens 10 Zeichen lang sein')
    .max(5000, 'Der ursprüngliche Inhalt darf maximal 5000 Zeichen lang sein'),
  claim_text: z.string()
    .max(1000, 'Die Behauptung darf maximal 1000 Zeichen lang sein')
    .optional()
})

export const factCheckResultSchema = z.object({
  submission_id: z.string().uuid(),
  verdict: z.enum(['verified', 'disputed', 'false', 'mixed', 'unverifiable']),
  confidence_score: z.number().min(0).max(1).optional(),
  summary: z.string()
    .min(50, 'Die Zusammenfassung muss mindestens 50 Zeichen lang sein')
    .max(1000, 'Die Zusammenfassung darf maximal 1000 Zeichen lang sein'),
  detailed_analysis: z.string()
    .max(10000, 'Die detaillierte Analyse darf maximal 10000 Zeichen lang sein')
    .optional(),
  sources: z.array(z.object({
    url: z.string().url(),
    title: z.string().min(1).max(200),
    author: z.string().max(100).optional(),
    publication_date: z.string().optional(),
    credibility_score: z.number().min(0).max(1).optional(),
    source_type: z.enum(['primary', 'secondary', 'expert_opinion', 'official_statement'])
  })).optional(),
  methodology: z.string().max(2000).optional(),
  category_ids: z.array(z.string().uuid()).optional()
})

// Comment validation schemas
export const commentSchema = z.object({
  fact_check_id: z.string().uuid(),
  parent_comment_id: z.string().uuid().optional(),
  content: z.string()
    .min(1, 'Kommentar darf nicht leer sein')
    .max(2000, 'Kommentar darf maximal 2000 Zeichen lang sein')
    .refine(content => content.trim().length > 0, 'Kommentar darf nicht nur aus Leerzeichen bestehen')
})

// Voting validation schemas
export const voteSchema = z.object({
  fact_check_id: z.string().uuid(),
  vote_type: z.enum(['helpful', 'not_helpful', 'flag']),
  comment: z.string().max(500).optional()
})

// Search and filter validation schemas
export const searchSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  verdict: z.array(z.enum(['verified', 'disputed', 'false', 'mixed', 'unverifiable'])).optional(),
  categories: z.array(z.string().uuid()).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  confidence_min: z.number().min(0).max(1).optional(),
  page: z.number().int().min(1).default(1),
  per_page: z.number().int().min(1).max(100).default(20)
})

// Moderation validation schemas
export const moderationReportSchema = z.object({
  content_type: z.enum(['fact_check', 'comment', 'profile']),
  content_id: z.string().uuid(),
  report_reason: z.enum([
    'misinformation',
    'spam',
    'harassment',
    'hate_speech',
    'inappropriate_content',
    'copyright_violation',
    'other'
  ]),
  description: z.string().max(1000).optional()
})

// Newsletter validation schemas
export const newsletterSubscriptionSchema = z.object({
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  subscription_types: z.array(z.string()).default(['weekly_digest'])
})

// Admin validation schemas (for moderators/admins)
export const adminFactCheckUpdateSchema = z.object({
  status: z.enum(['pending', 'in_review', 'fact_checked', 'rejected']),
  priority_score: z.number().int().min(0).max(100).optional(),
  reviewer_notes: z.string().max(2000).optional()
})

export const adminUserUpdateSchema = z.object({
  is_verified: z.boolean().optional(),
  is_moderator: z.boolean().optional(),
  reputation_score: z.number().int().optional(),
  admin_notes: z.string().max(2000).optional()
})

// API parameter validation schemas
export const uuidParamSchema = z.object({
  id: z.string().uuid('Ungültige ID')
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20)
})

// Rate limiting schemas
export const rateLimitSchema = z.object({
  action: z.enum([
    'fact_check_submission',
    'comment_creation',
    'vote_cast',
    'report_submission',
    'search_query',
    'profile_update'
  ]),
  user_id: z.string().uuid().optional(),
  ip_address: z.string().ip().optional()
})

// Stripe/Payment validation schemas
export const stripeWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any()
  }),
  id: z.string(),
  created: z.number()
})

export const supporterSubscriptionSchema = z.object({
  tier: z.enum(['basic', 'premium', 'platinum']),
  billing_cycle: z.enum(['monthly', 'yearly']),
  return_url: z.string().url().optional()
})

// Security validation schemas
export const passwordSchema = z.string()
  .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
  .max(128, 'Passwort darf maximal 128 Zeichen lang sein')
  .refine(password => {
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) return false
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) return false
    // Check for at least one number
    if (!/[0-9]/.test(password)) return false
    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false
    return true
  }, 'Passwort muss mindestens einen Groß- und Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten')

export const emailSchema = z.string()
  .email('Bitte geben Sie eine gültige E-Mail-Adresse ein')
  .min(1, 'E-Mail-Adresse ist erforderlich')
  .max(255, 'E-Mail-Adresse darf maximal 255 Zeichen lang sein')

// File upload validation schemas
export const imageUploadSchema = z.object({
  file: z.any()
    .refine(file => file instanceof File, 'Datei ist erforderlich')
    .refine(file => file.size <= 5 * 1024 * 1024, 'Datei darf maximal 5MB groß sein')
    .refine(
      file => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Nur JPEG, PNG und WebP Dateien sind erlaubt'
    )
})

// Environment validation schema
export const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  HCAPTCHA_SITE_KEY: z.string().min(1).optional(),
  HCAPTCHA_SECRET: z.string().min(1).optional(),
  REDIS_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
})

// Export types inferred from schemas
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type FactCheckSubmissionInput = z.infer<typeof factCheckSubmissionSchema>
export type FactCheckResultInput = z.infer<typeof factCheckResultSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type VoteInput = z.infer<typeof voteSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type ModerationReportInput = z.infer<typeof moderationReportSchema>
export type NewsletterSubscriptionInput = z.infer<typeof newsletterSubscriptionSchema>
export type SupporterSubscriptionInput = z.infer<typeof supporterSubscriptionSchema>

// Validation helper functions
export function validateEmail(email: string): boolean {
  try {
    emailSchema.parse(email)
    return true
  } catch {
    return false
  }
}

export function validatePassword(password: string): boolean {
  try {
    passwordSchema.parse(password)
    return true
  } catch {
    return false
  }
}

export function validateUsername(username: string): boolean {
  try {
    usernameSchema.parse(username)
    return true
  } catch {
    return false
  }
}

export function validateUrl(url: string): boolean {
  try {
    z.string().url().parse(url)
    return true
  } catch {
    return false
  }
}