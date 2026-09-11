CREATE TABLE "user" (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  email_verified boolean NOT NULL,
  image text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  role text,
  banned boolean,
  ban_reason text,
  ban_expires timestamptz,
  CONSTRAINT user_email_unique UNIQUE (email)
);

CREATE TABLE session (
  id text PRIMARY KEY,
  expires_at timestamptz NOT NULL,
  token text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  user_id text NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  impersonated_by text,
  CONSTRAINT session_token_unique UNIQUE (token)
);

CREATE INDEX session_user_id_idx ON session (user_id);

CREATE TABLE account (
  id text PRIMARY KEY,
  account_id text NOT NULL,
  provider_id text NOT NULL,
  user_id text NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  scope text,
  password text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX account_user_id_idx ON account (user_id);

CREATE TABLE verification (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE INDEX verification_identifier_idx ON verification (identifier);

CREATE TABLE rate_limit (
  id text PRIMARY KEY,
  key text NOT NULL,
  count integer NOT NULL,
  last_request bigint NOT NULL,
  CONSTRAINT rate_limit_key_unique UNIQUE (key)
);

CREATE TABLE answer_feedback (
  operation_id uuid PRIMARY KEY REFERENCES conversation_turn_operation (id),
  rating text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT answer_feedback_rating_check CHECK (rating IN ('up', 'down'))
);
