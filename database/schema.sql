-- Database schema for Fakten statt Fake platform
-- This file contains the complete database structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    website_url TEXT,
    location VARCHAR(100),
    experience_points INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 0,
    badge_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_moderator BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_supporter BOOLEAN DEFAULT FALSE,
    supporter_tier VARCHAR(20),
    supporter_since TIMESTAMP WITH TIME ZONE,
    privacy_settings JSONB DEFAULT '{"email_visible": false, "location_visible": true}',
    notification_settings JSONB DEFAULT '{"fact_check_updates": true, "community_updates": true}',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fact check submissions
CREATE TABLE public.fact_check_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    source_url TEXT NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'social_media', 'news_article', 'website', etc.
    source_platform VARCHAR(50), -- 'twitter', 'facebook', 'instagram', etc.
    original_content TEXT NOT NULL,
    content_language VARCHAR(10) DEFAULT 'de',
    claim_text TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_review', 'fact_checked', 'rejected'
    priority_score INTEGER DEFAULT 0,
    ai_analysis_data JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fact check results
CREATE TABLE public.fact_check_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submission_id UUID REFERENCES public.fact_check_submissions(id) ON DELETE CASCADE,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verdict VARCHAR(20) NOT NULL, -- 'verified', 'disputed', 'false', 'mixed', 'unverifiable'
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    summary TEXT NOT NULL,
    detailed_analysis TEXT,
    sources JSONB, -- Array of source objects with urls, titles, credibility scores
    evidence JSONB, -- Supporting evidence and reasoning
    methodology TEXT,
    fact_check_quality_score INTEGER DEFAULT 0,
    peer_review_status VARCHAR(20) DEFAULT 'pending',
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fact check categories and tags
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color code
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Many-to-many relationship between fact checks and categories
CREATE TABLE public.fact_check_categories (
    fact_check_id UUID REFERENCES public.fact_check_results(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (fact_check_id, category_id)
);

-- User voting on fact check quality
CREATE TABLE public.fact_check_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fact_check_id UUID REFERENCES public.fact_check_results(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vote_type VARCHAR(20) NOT NULL, -- 'helpful', 'not_helpful', 'flag'
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fact_check_id, user_id)
);

-- User experience and badges system
CREATE TABLE public.badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    badge_type VARCHAR(20) NOT NULL, -- 'achievement', 'contribution', 'expertise', 'special'
    unlock_criteria JSONB,
    rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    points_required INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges earned
CREATE TABLE public.user_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_data JSONB,
    UNIQUE(user_id, badge_id)
);

-- User activity log for XP tracking
CREATE TABLE public.user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'fact_check_submitted', 'vote_cast', 'content_shared', etc.
    points_earned INTEGER DEFAULT 0,
    related_entity_type VARCHAR(50), -- 'fact_check', 'comment', etc.
    related_entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments on fact checks
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fact_check_id UUID REFERENCES public.fact_check_results(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_moderator_note BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    hidden_reason TEXT,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    reported_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content moderation
CREATE TABLE public.moderation_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content_type VARCHAR(50) NOT NULL, -- 'fact_check', 'comment', 'profile'
    content_id UUID NOT NULL,
    report_reason VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'action_taken', 'dismissed'
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_taken VARCHAR(100),
    reviewer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Payment/supporter tracking
CREATE TABLE public.supporter_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(100) UNIQUE,
    stripe_customer_id VARCHAR(100),
    tier VARCHAR(20) NOT NULL, -- 'basic', 'premium', 'platinum'
    status VARCHAR(20) NOT NULL, -- 'active', 'cancelled', 'past_due', 'unpaid'
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscriptions
CREATE TABLE public.newsletter_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    subscription_types JSONB DEFAULT '["weekly_digest"]',
    confirmed_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics and metrics
CREATE TABLE public.fact_check_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fact_check_id UUID REFERENCES public.fact_check_results(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    views_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    referrer_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fact_check_id, metric_date)
);

-- Search functionality
CREATE TABLE public.search_queries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    query_text TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    results_count INTEGER DEFAULT 0,
    clicked_result_id UUID,
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_experience_points ON public.profiles(experience_points DESC);
CREATE INDEX idx_profiles_reputation_score ON public.profiles(reputation_score DESC);

CREATE INDEX idx_fact_check_submissions_status ON public.fact_check_submissions(status);
CREATE INDEX idx_fact_check_submissions_created_at ON public.fact_check_submissions(created_at DESC);
CREATE INDEX idx_fact_check_submissions_priority ON public.fact_check_submissions(priority_score DESC);

CREATE INDEX idx_fact_check_results_verdict ON public.fact_check_results(verdict);
CREATE INDEX idx_fact_check_results_published_at ON public.fact_check_results(published_at DESC);
CREATE INDEX idx_fact_check_results_confidence ON public.fact_check_results(confidence_score DESC);

CREATE INDEX idx_comments_fact_check_id ON public.comments(fact_check_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

CREATE INDEX idx_moderation_reports_status ON public.moderation_reports(status);
CREATE INDEX idx_moderation_reports_created_at ON public.moderation_reports(created_at DESC);

CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_check_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supporter_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Fact check submissions: Anyone can view published results, only submitters can edit pending
CREATE POLICY "Published fact checks are viewable by everyone" ON public.fact_check_results
    FOR SELECT USING (published_at IS NOT NULL);

CREATE POLICY "Users can view their own submissions" ON public.fact_check_submissions
    FOR SELECT USING (submitted_by = auth.uid() OR status = 'fact_checked');

CREATE POLICY "Authenticated users can submit fact checks" ON public.fact_check_submissions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Comments: Anyone can read, authenticated users can post
CREATE POLICY "Comments are viewable by everyone" ON public.comments
    FOR SELECT USING (NOT is_hidden);

CREATE POLICY "Authenticated users can post comments" ON public.comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (author_id = auth.uid());

-- Supporter subscriptions: Users can only see their own
CREATE POLICY "Users can view their own subscriptions" ON public.supporter_subscriptions
    FOR SELECT USING (user_id = auth.uid());

-- Insert initial data

-- Create default categories
INSERT INTO public.categories (name, slug, description, icon, color) VALUES
    ('Politik', 'politik', 'Politische Behauptungen und Aussagen', 'government', '#3B82F6'),
    ('Gesundheit', 'gesundheit', 'Medizinische und gesundheitsbezogene Inhalte', 'heart', '#EF4444'),
    ('Wissenschaft', 'wissenschaft', 'Wissenschaftliche Behauptungen und Studien', 'beaker', '#10B981'),
    ('Wirtschaft', 'wirtschaft', 'Wirtschaftliche und finanzielle Aussagen', 'chart-bar', '#F59E0B'),
    ('Umwelt', 'umwelt', 'Umwelt- und Klimathemen', 'globe-alt', '#059669'),
    ('Technologie', 'technologie', 'Technologie und digitale Medien', 'cpu-chip', '#8B5CF6'),
    ('Gesellschaft', 'gesellschaft', 'Gesellschaftliche und soziale Themen', 'users', '#EC4899'),
    ('Geschichte', 'geschichte', 'Historische Behauptungen und Ereignisse', 'academic-cap', '#6B7280');

-- Create initial badges
INSERT INTO public.badges (name, description, icon, badge_type, unlock_criteria, rarity, points_required) VALUES
    ('Erst-Einreicher', 'Erste Fact-Check-Einreichung', 'star', 'achievement', '{"submissions": 1}', 'common', 0),
    ('Wahrheitsfinder', '10 korrekte Fact-Checks eingereicht', 'shield-check', 'contribution', '{"correct_submissions": 10}', 'rare', 100),
    ('Community-Helfer', '100 hilfreiche Bewertungen', 'hand-heart', 'contribution', '{"helpful_votes": 100}', 'rare', 250),
    ('Experte', '1000 Erfahrungspunkte erreicht', 'trophy', 'achievement', '{"experience_points": 1000}', 'epic', 1000),
    ('Supporter', 'Unterstützt die Plattform finanziell', 'heart', 'special', '{"supporter": true}', 'legendary', 0),
    ('Moderator', 'Vertrauensvoller Community-Moderator', 'shield', 'special', '{"moderator": true}', 'legendary', 0);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fact_check_submissions_updated_at BEFORE UPDATE ON public.fact_check_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fact_check_results_updated_at BEFORE UPDATE ON public.fact_check_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supporter_subscriptions_updated_at BEFORE UPDATE ON public.supporter_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();