// Database types for Fakten statt Fake platform

export interface User {
  id: string
  email?: string
  created_at?: string
  updated_at?: string
}

export interface Profile {
  id: string
  username: string
  display_name?: string
  bio?: string
  avatar_url?: string
  website_url?: string
  location?: string
  experience_points: number
  reputation_score: number
  badge_count: number
  is_verified: boolean
  is_moderator: boolean
  is_admin: boolean
  is_supporter: boolean
  supporter_tier?: string
  supporter_since?: string
  privacy_settings: {
    email_visible: boolean
    location_visible: boolean
  }
  notification_settings: {
    fact_check_updates: boolean
    community_updates: boolean
  }
  last_active?: string
  created_at: string
  updated_at: string
}

export interface FactCheckSubmission {
  id: string
  submitted_by?: string
  source_url: string
  source_type: 'social_media' | 'news_article' | 'website' | 'other'
  source_platform?: 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'other'
  original_content: string
  content_language: string
  claim_text?: string
  status: 'pending' | 'in_review' | 'fact_checked' | 'rejected'
  priority_score: number
  ai_analysis_data?: any
  metadata?: any
  created_at: string
  updated_at: string
}

export interface FactCheckResult {
  id: string
  submission_id: string
  reviewed_by?: string
  verdict: 'verified' | 'disputed' | 'false' | 'mixed' | 'unverifiable'
  confidence_score?: number
  summary: string
  detailed_analysis?: string
  sources?: FactCheckSource[]
  evidence?: any
  methodology?: string
  fact_check_quality_score: number
  peer_review_status: 'pending' | 'approved' | 'needs_revision'
  published_at?: string
  expires_at?: string
  version: number
  created_at: string
  updated_at: string
}

export interface FactCheckSource {
  url: string
  title: string
  author?: string
  publication_date?: string
  credibility_score?: number
  source_type: 'primary' | 'secondary' | 'expert_opinion' | 'official_statement'
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  is_active: boolean
  display_order: number
  created_at: string
}

export interface FactCheckVote {
  id: string
  fact_check_id: string
  user_id: string
  vote_type: 'helpful' | 'not_helpful' | 'flag'
  comment?: string
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description?: string
  icon?: string
  badge_type: 'achievement' | 'contribution' | 'expertise' | 'special'
  unlock_criteria: any
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points_required: number
  is_active: boolean
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  progress_data?: any
}

export interface UserActivity {
  id: string
  user_id: string
  activity_type: string
  points_earned: number
  related_entity_type?: string
  related_entity_id?: string
  metadata?: any
  created_at: string
}

export interface Comment {
  id: string
  fact_check_id: string
  parent_comment_id?: string
  author_id: string
  content: string
  is_moderator_note: boolean
  is_hidden: boolean
  hidden_reason?: string
  upvotes: number
  downvotes: number
  reported_count: number
  created_at: string
  updated_at: string
}

export interface ModerationReport {
  id: string
  reported_by?: string
  content_type: 'fact_check' | 'comment' | 'profile'
  content_id: string
  report_reason: string
  description?: string
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed'
  reviewed_by?: string
  action_taken?: string
  reviewer_notes?: string
  created_at: string
  reviewed_at?: string
}

export interface SupporterSubscription {
  id: string
  user_id: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  tier: 'basic' | 'premium' | 'platinum'
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid'
  amount_cents: number
  currency: string
  billing_cycle: 'monthly' | 'yearly'
  started_at: string
  cancelled_at?: string
  created_at: string
  updated_at: string
}

export interface NewsletterSubscription {
  id: string
  email: string
  user_id?: string
  is_active: boolean
  subscription_types: string[]
  confirmed_at?: string
  unsubscribed_at?: string
  created_at: string
}

export interface FactCheckAnalytics {
  id: string
  fact_check_id: string
  metric_date: string
  views_count: number
  shares_count: number
  saves_count: number
  referrer_data?: any
  created_at: string
}

export interface SearchQuery {
  id: string
  query_text: string
  user_id?: string
  results_count: number
  clicked_result_id?: string
  session_id?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  status: 'success' | 'error'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// Form input types
export interface FactCheckSubmissionInput {
  source_url: string
  source_type: FactCheckSubmission['source_type']
  source_platform?: FactCheckSubmission['source_platform']
  original_content: string
  claim_text?: string
}

export interface ProfileUpdateInput {
  display_name?: string
  bio?: string
  website_url?: string
  location?: string
  privacy_settings?: Profile['privacy_settings']
  notification_settings?: Profile['notification_settings']
}

export interface CommentInput {
  fact_check_id: string
  parent_comment_id?: string
  content: string
}

// Authentication types
export interface AuthUser {
  id: string
  email: string
  profile?: Profile
}

// Utility types
export type FactCheckStatus = FactCheckSubmission['status']
export type FactCheckVerdict = FactCheckResult['verdict']
export type BadgeRarity = Badge['rarity']
export type SupporterTier = SupporterSubscription['tier']

// Component prop types
export interface FactCheckCardProps {
  factCheck: FactCheckResult & {
    submission: FactCheckSubmission
    categories?: Category[]
  }
  showDetails?: boolean
  compact?: boolean
}

export interface UserCardProps {
  profile: Profile
  showStats?: boolean
  showBadges?: boolean
}

export interface BadgeDisplayProps {
  badge: Badge
  earned?: boolean
  progress?: number
}

export interface CommentThreadProps {
  comments: (Comment & { author: Profile })[]
  factCheckId: string
  canModerate?: boolean
}

// Search and filter types
export interface FactCheckFilters {
  verdict?: FactCheckVerdict[]
  categories?: string[]
  date_from?: string
  date_to?: string
  confidence_min?: number
  search?: string
}

export interface UserFilters {
  experience_min?: number
  badges?: string[]
  is_verified?: boolean
  location?: string
}

// Analytics types
export interface PlatformStats {
  total_fact_checks: number
  total_users: number
  verified_fact_checks: number
  disputed_fact_checks: number
  false_fact_checks: number
  average_confidence: number
  top_categories: Array<{
    category: Category
    count: number
  }>
}

export interface UserStats {
  total_submissions: number
  published_fact_checks: number
  experience_points: number
  reputation_score: number
  badges_earned: number
  helpful_votes_received: number
}

// Error types
export interface ValidationError {
  field: string
  message: string
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

// Database table names (for type safety)
export const TableNames = {
  PROFILES: 'profiles',
  FACT_CHECK_SUBMISSIONS: 'fact_check_submissions',
  FACT_CHECK_RESULTS: 'fact_check_results',
  CATEGORIES: 'categories',
  FACT_CHECK_CATEGORIES: 'fact_check_categories',
  FACT_CHECK_VOTES: 'fact_check_votes',
  BADGES: 'badges',
  USER_BADGES: 'user_badges',
  USER_ACTIVITIES: 'user_activities',
  COMMENTS: 'comments',
  MODERATION_REPORTS: 'moderation_reports',
  SUPPORTER_SUBSCRIPTIONS: 'supporter_subscriptions',
  NEWSLETTER_SUBSCRIPTIONS: 'newsletter_subscriptions',
  FACT_CHECK_ANALYTICS: 'fact_check_analytics',
  SEARCH_QUERIES: 'search_queries',
} as const