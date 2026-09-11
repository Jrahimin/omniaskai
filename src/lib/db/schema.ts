import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { TopicPreview } from "@/features/topics/topic";
import type { TopicThemeKey } from "@/features/topics/topic-theme";

export const schemaMigration = pgTable("schema_migration", {
  id: text("id").primaryKey(),
  appliedAt: timestamp("applied_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const mediaAsset = pgTable(
  "media_asset",
  {
    id: uuid("id").primaryKey(),
    storageKind: text("storage_kind").notNull().$type<"bundled" | "uploaded">(),
    storageKey: text("storage_key").notNull(),
    mimeType: text("mime_type").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    byteSize: integer("byte_size").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    unique("media_asset_storage_key_unique").on(table.storageKey),
    check(
      "media_asset_storage_kind_check",
      sql`${table.storageKind} IN ('bundled', 'uploaded')`,
    ),
    check("media_asset_width_check", sql`${table.width} > 0`),
    check("media_asset_height_check", sql`${table.height} > 0`),
    check("media_asset_byte_size_check", sql`${table.byteSize} >= 0`),
  ],
);

export const topic = pgTable(
  "topic",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    sortOrder: integer("sort_order").notNull(),
    draftRevisionId: uuid("draft_revision_id"),
    liveRevisionId: uuid("live_revision_id"),
    firstPublishedAt: timestamp("first_published_at", {
      withTimezone: true,
      mode: "date",
    }),
    conversationEpoch: integer("conversation_epoch").notNull(),
    version: integer("version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    unique("topic_slug_unique").on(table.slug),
    check(
      "topic_slug_format_check",
      sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(${table.slug}) <= 80`,
    ),
    check("topic_conversation_epoch_check", sql`${table.conversationEpoch} >= 0`),
    check("topic_version_check", sql`${table.version} >= 1`),
    check(
      "topic_draft_live_distinct_check",
      sql`${table.draftRevisionId} IS NULL OR ${table.liveRevisionId} IS NULL OR ${table.draftRevisionId} <> ${table.liveRevisionId}`,
    ),
    index("topic_published_order_idx")
      .on(table.sortOrder, table.id)
      .where(sql`${table.liveRevisionId} IS NOT NULL`),
  ],
);

export const topicRevision = pgTable(
  "topic_revision",
  {
    id: uuid("id").primaryKey(),
    topicId: text("topic_id")
      .notNull()
      .references(() => topic.id),
    revisionNumber: integer("revision_number").notNull(),
    themeKey: text("theme_key").notNull().$type<TopicThemeKey>(),
    artworkAssetId: uuid("artwork_asset_id").references(() => mediaAsset.id),
    focalPosition: text("focal_position").notNull(),
    knowledgeReviewDate: date("knowledge_review_date", { mode: "string" }),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    unique("topic_revision_number_unique").on(table.topicId, table.revisionNumber),
    unique("topic_revision_topic_id_id_unique").on(table.topicId, table.id),
    check(
      "topic_revision_theme_key_check",
      sql`${table.themeKey} IN ('tax', 'literature', 'history', 'culture')`,
    ),
    check("topic_revision_number_check", sql`${table.revisionNumber} >= 1`),
    index("topic_revision_topic_id_idx").on(table.topicId),
  ],
);

export const topicRevisionTranslation = pgTable(
  "topic_revision_translation",
  {
    revisionId: uuid("revision_id")
      .notNull()
      .references(() => topicRevision.id, { onDelete: "cascade" }),
    locale: text("locale").notNull().$type<"en" | "bn">(),
    title: text("title").notNull(),
    landingDescription: text("landing_description").notNull(),
    workspaceSubtitle: text("workspace_subtitle").notNull(),
    aboutDescription: text("about_description").notNull(),
    sourceDescription: text("source_description").notNull(),
    badge: text("badge"),
    artworkAlt: text("artwork_alt").notNull(),
    composerPlaceholder: text("composer_placeholder").notNull(),
    exploreLabel: text("explore_label"),
    preview: jsonb("preview").$type<TopicPreview | null>(),
    starterQuestions: jsonb("starter_questions").$type<string[]>().notNull(),
  },
  (table) => [
    primaryKey({
      name: "topic_revision_translation_pk",
      columns: [table.revisionId, table.locale],
    }),
    check(
      "topic_revision_translation_locale_check",
      sql`${table.locale} IN ('en', 'bn')`,
    ),
    check(
      "topic_revision_translation_starter_questions_array_check",
      sql`jsonb_typeof(${table.starterQuestions}) = 'array'`,
    ),
  ],
);

export const topicKnowledgeMapping = pgTable(
  "topic_knowledge_mapping",
  {
    revisionId: uuid("revision_id")
      .primaryKey()
      .references(() => topicRevision.id, { onDelete: "cascade" }),
    apeProjectId: uuid("ape_project_id").notNull(),
    lastValidationResult: text("last_validation_result").$type<
      "valid" | "inaccessible" | "inactive" | "deleted" | "missing" | null
    >(),
    lastValidatedAt: timestamp("last_validated_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => [
    check(
      "topic_knowledge_mapping_validation_result_check",
      sql`${table.lastValidationResult} IS NULL OR ${table.lastValidationResult} IN ('valid', 'inaccessible', 'inactive', 'deleted', 'missing')`,
    ),
  ],
);

export const conversationReference = pgTable(
  "conversation_reference",
  {
    id: uuid("id").primaryKey(),
    topicId: text("topic_id")
      .notNull()
      .references(() => topic.id),
    startingPublishedRevisionId: uuid("starting_published_revision_id")
      .notNull()
      .references(() => topicRevision.id),
    capturedApeProjectId: uuid("captured_ape_project_id").notNull(),
    capturedApeConversationId: uuid("captured_ape_conversation_id"),
    capturedConversationEpoch: integer("captured_conversation_epoch").notNull(),
    executionState: text("execution_state").notNull().$type<"open" | "blocked">(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    lastActivityAt: timestamp("last_activity_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (table) => [
    check(
      "conversation_reference_execution_state_check",
      sql`${table.executionState} IN ('open', 'blocked')`,
    ),
    check(
      "conversation_reference_epoch_check",
      sql`${table.capturedConversationEpoch} >= 0`,
    ),
    uniqueIndex("conversation_reference_ape_pair_unique")
      .on(table.capturedApeProjectId, table.capturedApeConversationId)
      .where(sql`${table.capturedApeConversationId} IS NOT NULL`),
    index("conversation_reference_topic_activity_idx").on(
      table.topicId,
      table.lastActivityAt,
    ),
  ],
);

export const conversationTurnOperation = pgTable(
  "conversation_turn_operation",
  {
    id: uuid("id").primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversationReference.id),
    sequence: integer("sequence").notNull(),
    state: text("state")
      .notNull()
      .$type<"running" | "succeeded" | "failed" | "unknown">(),
    resultClassification: text("result_classification").$type<
      "grounded" | "completed" | "insufficient" | "error" | null
    >(),
    apeAssistantMessageId: uuid("ape_assistant_message_id"),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    unique("conversation_turn_operation_sequence_unique").on(
      table.conversationId,
      table.sequence,
    ),
    check(
      "conversation_turn_operation_sequence_check",
      sql`${table.sequence} >= 1`,
    ),
    check(
      "conversation_turn_operation_state_check",
      sql`${table.state} IN ('running', 'succeeded', 'failed', 'unknown')`,
    ),
    check(
      "conversation_turn_operation_result_check",
      sql`${table.resultClassification} IS NULL OR ${table.resultClassification} IN ('grounded', 'completed', 'insufficient', 'error')`,
    ),
    uniqueIndex("conversation_turn_operation_one_running")
      .on(table.conversationId)
      .where(sql`${table.state} = 'running'`),
    index("conversation_turn_operation_conversation_sequence_idx").on(
      table.conversationId,
      table.sequence,
    ),
  ],
);

export const answerFeedback = pgTable(
  "answer_feedback",
  {
    operationId: uuid("operation_id")
      .primaryKey()
      .references(() => conversationTurnOperation.id),
    rating: text("rating").notNull().$type<"up" | "down">(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    check(
      "answer_feedback_rating_check",
      sql`${table.rating} IN ('up', 'down')`,
    ),
  ],
);

export const authUser = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true, mode: "date" }),
}, (table) => [unique("user_email_unique").on(table.email)]);

export const authSession = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    token: text("token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [
    unique("session_token_unique").on(table.token),
    index("session_user_id_idx").on(table.userId),
  ],
);

export const authAccount = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const authVerification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const authRateLimit = pgTable(
  "rate_limit",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    count: integer("count").notNull(),
    lastRequest: bigint("last_request", { mode: "number" }).notNull(),
  },
  (table) => [unique("rate_limit_key_unique").on(table.key)],
);
