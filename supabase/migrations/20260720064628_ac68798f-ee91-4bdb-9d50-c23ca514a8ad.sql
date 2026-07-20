CREATE TABLE public.meta_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('messenger', 'instagram')),
  page_id text,
  ig_account_id text,
  page_access_token text,
  ig_access_token text,
  connected_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE (user_id, platform)
);

CREATE TABLE public.agent_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_name text DEFAULT 'Afristall Assistant',
  tone text DEFAULT 'friendly and professional',
  welcome_message text,
  fallback_message text DEFAULT 'I''m not sure I understood. Would you like to speak to a human?',
  auto_reply_enabled boolean DEFAULT true,
  human_handoff_phrases text[] DEFAULT ARRAY['talk to human', 'call me', 'speak to someone', 'agent'],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

CREATE TABLE public.meta_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  platform text NOT NULL CHECK (platform IN ('messenger', 'instagram')),
  external_user_id text NOT NULL,
  page_or_ig_id text,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content text NOT NULL,
  raw_event jsonb,
  ai_reply_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_meta_connections_user ON public.meta_connections(user_id);
CREATE INDEX idx_meta_conversations_user ON public.meta_conversations(user_id);
CREATE INDEX idx_meta_conversations_external_user ON public.meta_conversations(external_user_id);
CREATE INDEX idx_meta_conversations_created ON public.meta_conversations(created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meta_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meta_conversations TO authenticated;
GRANT ALL ON public.meta_connections TO service_role;
GRANT ALL ON public.agent_settings TO service_role;
GRANT ALL ON public.meta_conversations TO service_role;

ALTER TABLE public.meta_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own Meta connections"
  ON public.meta_connections
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users manage their own agent settings"
  ON public.agent_settings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users view their own conversations"
  ON public.meta_conversations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role manages conversations"
  ON public.meta_conversations
  FOR ALL
  TO service_role
  USING (true);