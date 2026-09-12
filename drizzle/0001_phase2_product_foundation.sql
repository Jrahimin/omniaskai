CREATE TABLE IF NOT EXISTS schema_migration (
  id text PRIMARY KEY,
  applied_at timestamptz NOT NULL
);

CREATE TABLE media_asset (
  id uuid PRIMARY KEY,
  storage_kind text NOT NULL,
  storage_key text NOT NULL,
  mime_type text NOT NULL,
  width integer NOT NULL,
  height integer NOT NULL,
  byte_size integer NOT NULL,
  created_at timestamptz NOT NULL,
  CONSTRAINT media_asset_storage_kind_check
    CHECK (storage_kind IN ('bundled', 'uploaded')),
  CONSTRAINT media_asset_storage_key_unique UNIQUE (storage_key),
  CONSTRAINT media_asset_width_check CHECK (width > 0),
  CONSTRAINT media_asset_height_check CHECK (height > 0),
  CONSTRAINT media_asset_byte_size_check CHECK (byte_size >= 0)
);

CREATE TABLE topic (
  id text PRIMARY KEY,
  slug text NOT NULL,
  sort_order integer NOT NULL,
  draft_revision_id uuid,
  live_revision_id uuid,
  first_published_at timestamptz,
  conversation_epoch integer NOT NULL,
  version integer NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT topic_slug_unique UNIQUE (slug),
  CONSTRAINT topic_slug_format_check
    CHECK (
      slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      AND char_length(slug) <= 80
    ),
  CONSTRAINT topic_conversation_epoch_check CHECK (conversation_epoch >= 0),
  CONSTRAINT topic_version_check CHECK (version >= 1),
  CONSTRAINT topic_draft_live_distinct_check CHECK (
    draft_revision_id IS NULL
    OR live_revision_id IS NULL
    OR draft_revision_id <> live_revision_id
  )
);

CREATE TABLE topic_revision (
  id uuid PRIMARY KEY,
  topic_id text NOT NULL REFERENCES topic (id),
  revision_number integer NOT NULL,
  theme_key text NOT NULL,
  artwork_asset_id uuid REFERENCES media_asset (id),
  focal_position text NOT NULL,
  knowledge_review_date date,
  published_at timestamptz,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT topic_revision_theme_key_check
    CHECK (theme_key IN ('tax', 'literature', 'history', 'culture')),
  CONSTRAINT topic_revision_number_unique UNIQUE (topic_id, revision_number),
  CONSTRAINT topic_revision_topic_id_id_unique UNIQUE (topic_id, id),
  CONSTRAINT topic_revision_number_check CHECK (revision_number >= 1)
);

ALTER TABLE topic
  ADD CONSTRAINT topic_draft_revision_fk
  FOREIGN KEY (id, draft_revision_id)
  REFERENCES topic_revision (topic_id, id);

ALTER TABLE topic
  ADD CONSTRAINT topic_live_revision_fk
  FOREIGN KEY (id, live_revision_id)
  REFERENCES topic_revision (topic_id, id);

CREATE TABLE topic_revision_translation (
  revision_id uuid NOT NULL REFERENCES topic_revision (id) ON DELETE CASCADE,
  locale text NOT NULL,
  title text NOT NULL,
  landing_description text NOT NULL,
  workspace_subtitle text NOT NULL,
  about_description text NOT NULL,
  source_description text NOT NULL,
  badge text,
  artwork_alt text NOT NULL,
  composer_placeholder text NOT NULL,
  explore_label text,
  preview jsonb,
  starter_questions jsonb NOT NULL,
  CONSTRAINT topic_revision_translation_pk PRIMARY KEY (revision_id, locale),
  CONSTRAINT topic_revision_translation_locale_check CHECK (locale IN ('en', 'bn')),
  CONSTRAINT topic_revision_translation_starter_questions_array_check
    CHECK (jsonb_typeof(starter_questions) = 'array')
);

CREATE TABLE topic_knowledge_mapping (
  revision_id uuid PRIMARY KEY REFERENCES topic_revision (id) ON DELETE CASCADE,
  ape_project_id uuid NOT NULL,
  last_validation_result text,
  last_validated_at timestamptz,
  CONSTRAINT topic_knowledge_mapping_validation_result_check CHECK (
    last_validation_result IS NULL
    OR last_validation_result IN (
      'valid',
      'inaccessible',
      'inactive',
      'deleted',
      'missing'
    )
  )
);

CREATE TABLE conversation_reference (
  id uuid PRIMARY KEY,
  topic_id text NOT NULL REFERENCES topic (id),
  starting_published_revision_id uuid NOT NULL REFERENCES topic_revision (id),
  captured_ape_project_id uuid NOT NULL,
  captured_ape_conversation_id uuid,
  captured_conversation_epoch integer NOT NULL,
  execution_state text NOT NULL,
  created_at timestamptz NOT NULL,
  last_activity_at timestamptz NOT NULL,
  CONSTRAINT conversation_reference_execution_state_check
    CHECK (execution_state IN ('open', 'blocked')),
  CONSTRAINT conversation_reference_epoch_check CHECK (captured_conversation_epoch >= 0)
);

CREATE UNIQUE INDEX conversation_reference_ape_pair_unique
  ON conversation_reference (captured_ape_project_id, captured_ape_conversation_id)
  WHERE captured_ape_conversation_id IS NOT NULL;

CREATE TABLE conversation_turn_operation (
  id uuid PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES conversation_reference (id),
  sequence integer NOT NULL,
  state text NOT NULL,
  result_classification text,
  ape_assistant_message_id uuid,
  started_at timestamptz NOT NULL,
  finished_at timestamptz,
  CONSTRAINT conversation_turn_operation_sequence_unique UNIQUE (conversation_id, sequence),
  CONSTRAINT conversation_turn_operation_sequence_check CHECK (sequence >= 1),
  CONSTRAINT conversation_turn_operation_state_check
    CHECK (state IN ('running', 'succeeded', 'failed', 'unknown')),
  CONSTRAINT conversation_turn_operation_result_check CHECK (
    result_classification IS NULL
    OR result_classification IN (
      'grounded',
      'completed',
      'insufficient',
      'error'
    )
  )
);

CREATE UNIQUE INDEX conversation_turn_operation_one_running
  ON conversation_turn_operation (conversation_id)
  WHERE state = 'running';

CREATE INDEX topic_published_order_idx
  ON topic (sort_order ASC, id ASC)
  WHERE live_revision_id IS NOT NULL;

CREATE INDEX topic_revision_topic_id_idx ON topic_revision (topic_id);

CREATE INDEX conversation_reference_topic_activity_idx
  ON conversation_reference (topic_id, last_activity_at DESC);

CREATE INDEX conversation_turn_operation_conversation_sequence_idx
  ON conversation_turn_operation (conversation_id, sequence);
