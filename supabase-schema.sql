-- Supabase Database Schema for Ausmo AAC App
-- Run these SQL commands in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    photo TEXT,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication Books table
CREATE TABLE IF NOT EXISTS communication_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pages JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_template BOOLEAN DEFAULT FALSE,
    is_shared BOOLEAN DEFAULT FALSE
);

-- Communication Pages table
CREATE TABLE IF NOT EXISTS communication_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES communication_books(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('standard', 'express', 'visual-scene', 'keyboard')),
    layout JSONB NOT NULL DEFAULT '{}',
    buttons JSONB NOT NULL DEFAULT '[]',
    background_image TEXT,
    background_color TEXT NOT NULL DEFAULT '#FFFFFF',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication Buttons table
CREATE TABLE IF NOT EXISTS communication_buttons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES communication_pages(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    image TEXT,
    audio_message TEXT,
    tts_message TEXT,
    action JSONB NOT NULL DEFAULT '{}',
    position JSONB NOT NULL DEFAULT '{}',
    size TEXT NOT NULL DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large', 'extra-large')),
    background_color TEXT NOT NULL DEFAULT '#2196F3',
    text_color TEXT NOT NULL DEFAULT '#FFFFFF',
    border_color TEXT NOT NULL DEFAULT '#000000',
    border_width INTEGER NOT NULL DEFAULT 1,
    border_radius INTEGER NOT NULL DEFAULT 8,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    audio_file TEXT,
    tts_voice TEXT,
    category TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Symbols table
CREATE TABLE IF NOT EXISTS symbols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    keywords JSONB NOT NULL DEFAULT '[]',
    is_built_in BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Analytics table
CREATE TABLE IF NOT EXISTS usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    messages_spoken INTEGER DEFAULT 0,
    pages_viewed INTEGER DEFAULT 0,
    session_duration INTEGER DEFAULT 0,
    most_used_buttons JSONB DEFAULT '[]',
    vocabulary_growth INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hotspots table (for visual scene pages)
CREATE TABLE IF NOT EXISTS hotspots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES communication_pages(id) ON DELETE CASCADE,
    x REAL NOT NULL,
    y REAL NOT NULL,
    width REAL NOT NULL,
    height REAL NOT NULL,
    action JSONB NOT NULL DEFAULT '{}',
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Express Sentences table
CREATE TABLE IF NOT EXISTS express_sentences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    words JSONB NOT NULL DEFAULT '[]',
    audio_file TEXT,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_books_user_id ON communication_books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON communication_books(created_at);
CREATE INDEX IF NOT EXISTS idx_pages_book_id ON communication_pages(book_id);
CREATE INDEX IF NOT EXISTS idx_buttons_page_id ON communication_buttons(page_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_category ON messages(category);
CREATE INDEX IF NOT EXISTS idx_symbols_category ON symbols(category);
CREATE INDEX IF NOT EXISTS idx_symbols_name ON symbols(name);
CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON usage_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_hotspots_page_id ON hotspots(page_id);
CREATE INDEX IF NOT EXISTS idx_express_sentences_user_id ON express_sentences(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON communication_books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON communication_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buttons_updated_at BEFORE UPDATE ON communication_buttons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_symbols_updated_at BEFORE UPDATE ON symbols FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_express_sentences_updated_at BEFORE UPDATE ON express_sentences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE express_sentences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (for now, allow all operations - you can restrict these later)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on communication_books" ON communication_books FOR ALL USING (true);
CREATE POLICY "Allow all operations on communication_pages" ON communication_pages FOR ALL USING (true);
CREATE POLICY "Allow all operations on communication_buttons" ON communication_buttons FOR ALL USING (true);
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on symbols" ON symbols FOR ALL USING (true);
CREATE POLICY "Allow all operations on usage_analytics" ON usage_analytics FOR ALL USING (true);
CREATE POLICY "Allow all operations on hotspots" ON hotspots FOR ALL USING (true);
CREATE POLICY "Allow all operations on express_sentences" ON express_sentences FOR ALL USING (true);
