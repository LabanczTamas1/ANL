/**
 * Migration: 002 — Full domain schema
 *
 * Moves ALL persistent data from Redis to PostgreSQL.
 * Redis is now used only for caching, sessions, and ephemeral data.
 *
 * Tables created:
 *   users, messages, reviews, contact_submissions,
 *   standard_availability, custom_availability,
 *   finance_transactions, pending_payments,
 *   kanban_columns, kanban_cards, kanban_comments,
 *   kanban_activity, kanban_templates, app_settings
 */

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const up = (pgm) => {
  // ─── UUID extension ──────────────────────────────────────────────────────
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // ─── USERS ───────────────────────────────────────────────────────────────
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    username: { type: 'varchar(255)', unique: true },
    password: { type: 'text' },
    first_name: { type: 'varchar(255)', default: "''" },
    last_name: { type: 'varchar(255)', default: "''" },
    role: { type: 'varchar(50)', notNull: true, default: "'user'" },
    verified: { type: 'boolean', notNull: true, default: false },
    company: { type: 'varchar(255)', default: "''" },
    phone: { type: 'varchar(50)', default: "''" },
    provider: { type: 'varchar(50)', default: "'local'" },
    google_id: { type: 'varchar(255)' },
    facebook_id: { type: 'varchar(255)' },
    profile_picture: { type: 'text' },
    progression_status: { type: 'varchar(50)', default: "'pending'" },
    progression_category: { type: 'varchar(255)', default: "''" },
    progression_timeline: { type: 'varchar(255)', default: "''" },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.createIndex('users', 'email', { unique: true, ifNotExists: true });
  pgm.createIndex('users', 'username', { unique: true, ifNotExists: true });
  pgm.createIndex('users', 'google_id', { ifNotExists: true });
  pgm.createIndex('users', 'facebook_id', { ifNotExists: true });
  pgm.createIndex('users', 'role', { ifNotExists: true });

  // ─── MESSAGES (email/inbox) ──────────────────────────────────────────────
  pgm.createTable('messages', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    from_id: { type: 'varchar(255)', notNull: true },
    from_name: { type: 'varchar(255)', notNull: true, default: "''" },
    from_email: { type: 'varchar(255)', default: "''" },
    recipient_id: { type: 'uuid', notNull: true },
    subject: { type: 'varchar(500)', notNull: true },
    body: { type: 'text', notNull: true },
    is_read: { type: 'boolean', notNull: true, default: false },
    is_system: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.createIndex('messages', 'recipient_id', { ifNotExists: true });
  pgm.createIndex('messages', ['recipient_id', 'is_read'], { ifNotExists: true });
  pgm.createIndex('messages', 'created_at', { ifNotExists: true });

  // ─── SENT MESSAGES (tracking who sent what) ─────────────────────────────
  pgm.createTable('sent_messages', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    from_id: { type: 'varchar(255)', notNull: true },
    from_name: { type: 'varchar(255)', notNull: true, default: "''" },
    from_email: { type: 'varchar(255)', default: "''" },
    recipient_email: { type: 'varchar(255)', notNull: true },
    subject: { type: 'varchar(500)', notNull: true },
    body: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.createIndex('sent_messages', 'from_id', { ifNotExists: true });

  // ─── REVIEWS ─────────────────────────────────────────────────────────────
  pgm.createTable('reviews', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    username: { type: 'varchar(255)', notNull: true },
    score: { type: 'integer', notNull: true },
    description: { type: 'text', notNull: true, default: "''" },
    role: { type: 'varchar(100)', default: "''" },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.createIndex('reviews', 'score', { ifNotExists: true });

  // ─── CONTACT SUBMISSIONS ────────────────────────────────────────────────
  pgm.createTable('contact_submissions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    full_name: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)', notNull: true },
    message: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  // ─── STANDARD AVAILABILITY ──────────────────────────────────────────────
  pgm.createTable('standard_availability', {
    id: { type: 'serial', primaryKey: true },
    day_name: { type: 'varchar(20)', notNull: true, unique: true },
    opening_time: { type: 'varchar(10)', notNull: true, default: "'09:00'" },
    closing_time: { type: 'varchar(10)', notNull: true, default: "'17:00'" },
    is_day_off: { type: 'boolean', notNull: true, default: false },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  // Seed default availability
  pgm.sql(`
    INSERT INTO standard_availability (day_name, opening_time, closing_time, is_day_off)
    VALUES
      ('Monday', '09:00', '17:00', false),
      ('Tuesday', '09:00', '17:00', false),
      ('Wednesday', '09:00', '17:00', false),
      ('Thursday', '09:00', '17:00', false),
      ('Friday', '09:00', '17:00', false),
      ('Saturday', '09:00', '17:00', true),
      ('Sunday', '09:00', '17:00', true)
    ON CONFLICT (day_name) DO NOTHING
  `);

  // ─── CUSTOM AVAILABILITY ─────────────────────────────────────────────────
  pgm.createTable('custom_availability', {
    id: { type: 'serial', primaryKey: true },
    date: { type: 'date', notNull: true },
    time_minutes: { type: 'integer', notNull: true },
    type: { type: 'varchar(10)', notNull: true }, // 'added' or 'deleted'
  }, { ifNotExists: true });

  pgm.createIndex('custom_availability', ['date', 'type'], { ifNotExists: true });
  pgm.addConstraint('custom_availability', 'custom_availability_unique', {
    unique: ['date', 'time_minutes', 'type'],
  });

  // ─── FINANCE TRANSACTIONS ───────────────────────────────────────────────
  pgm.createTable('finance_transactions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    user_id: { type: 'uuid', notNull: true },
    user_name: { type: 'varchar(255)', default: "''" },
    original_amount: { type: 'numeric(14,2)', notNull: true },
    original_currency: { type: 'varchar(10)', notNull: true, default: "'RON'" },
    exchange_rate: { type: 'numeric(14,6)', notNull: true, default: 1 },
    amount: { type: 'numeric(14,2)', notNull: true },
    currency: { type: 'varchar(10)', notNull: true, default: "'RON'" },
    type: { type: 'varchar(20)', notNull: true }, // 'credit', 'debit', 'log'
    description: { type: 'text', default: "''" },
    performed_by: { type: 'varchar(255)', notNull: true },
    performed_by_name: { type: 'varchar(255)', default: "''" },
    balance_before: { type: 'numeric(14,2)', notNull: true, default: 0 },
    balance_after: { type: 'numeric(14,2)', notNull: true, default: 0 },
    pending_id: { type: 'uuid' },
    event_type: { type: 'varchar(100)' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.createIndex('finance_transactions', 'user_id', { ifNotExists: true });
  pgm.createIndex('finance_transactions', ['user_id', 'created_at'], { ifNotExists: true });
  pgm.createIndex('finance_transactions', 'type', { ifNotExists: true });

  // ─── PENDING PAYMENTS ───────────────────────────────────────────────────
  pgm.createTable('pending_payments', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    user_id: { type: 'uuid', notNull: true },
    user_name: { type: 'varchar(255)', default: "''" },
    original_amount: { type: 'numeric(14,2)', notNull: true },
    original_currency: { type: 'varchar(10)', notNull: true, default: "'RON'" },
    exchange_rate: { type: 'numeric(14,6)', notNull: true, default: 1 },
    amount_in_ron: { type: 'numeric(14,2)', notNull: true },
    description: { type: 'text', default: "''" },
    due_date: { type: 'date', notNull: true },
    status: { type: 'varchar(20)', notNull: true, default: "'pending'" },
    notified: { type: 'boolean', notNull: true, default: false },
    notified_at: { type: 'timestamptz' },
    created_by: { type: 'varchar(255)', notNull: true },
    created_by_name: { type: 'varchar(255)', default: "''" },
    resolved_at: { type: 'timestamptz' },
    resolved_by: { type: 'varchar(255)' },
    resolved_by_name: { type: 'varchar(255)' },
    rejection_reason: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.createIndex('pending_payments', 'user_id', { ifNotExists: true });
  pgm.createIndex('pending_payments', 'status', { ifNotExists: true });
  pgm.createIndex('pending_payments', 'due_date', { ifNotExists: true });

  // ─── USER BALANCES (derived, but stored for perf) ───────────────────────
  pgm.createTable('user_balances', {
    user_id: { type: 'uuid', primaryKey: true },
    balance: { type: 'numeric(14,2)', notNull: true, default: 0 },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  // ─── KANBAN COLUMNS ─────────────────────────────────────────────────────
  pgm.createTable('kanban_columns', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    column_name: { type: 'varchar(255)', notNull: true },
    tag_color: { type: 'varchar(50)', default: "'#cccccc'" },
    priority: { type: 'integer', notNull: true, default: 0 },
    card_count: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.createIndex('kanban_columns', 'priority', { ifNotExists: true });

  // ─── KANBAN CARDS ───────────────────────────────────────────────────────
  pgm.createTable('kanban_cards', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    column_id: { type: 'uuid', notNull: true, references: 'kanban_columns', onDelete: 'CASCADE' },
    name: { type: 'varchar(255)', default: "''" },
    sort_order: { type: 'integer', notNull: true, default: 0 },
    template_id: { type: 'uuid' },
    fields: { type: 'jsonb', default: pgm.func("'{}'::jsonb") },
    contact_name: { type: 'varchar(255)', default: "''" },
    business_name: { type: 'varchar(255)', default: "''" },
    first_contact: { type: 'varchar(255)', default: "''" },
    phone_number: { type: 'varchar(100)', default: "''" },
    email: { type: 'varchar(255)', default: "''" },
    website: { type: 'varchar(500)', default: "''" },
    instagram: { type: 'varchar(255)', default: "''" },
    facebook: { type: 'varchar(255)', default: "''" },
    is_commented: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.createIndex('kanban_cards', 'column_id', { ifNotExists: true });
  pgm.createIndex('kanban_cards', ['column_id', 'sort_order'], { ifNotExists: true });

  // ─── KANBAN COMMENTS ────────────────────────────────────────────────────
  pgm.createTable('kanban_comments', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    card_id: { type: 'uuid', notNull: true, references: 'kanban_cards', onDelete: 'CASCADE' },
    user_name: { type: 'varchar(255)', notNull: true },
    body: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz' },
  }, { ifNotExists: true });

  pgm.createIndex('kanban_comments', 'card_id', { ifNotExists: true });

  // ─── KANBAN ACTIVITY ────────────────────────────────────────────────────
  pgm.createTable('kanban_activity', {
    id: { type: 'serial', primaryKey: true },
    card_id: { type: 'uuid', notNull: true, references: 'kanban_cards', onDelete: 'CASCADE' },
    action: { type: 'varchar(255)', notNull: true },
    user_name: { type: 'varchar(255)', notNull: true, default: "''" },
    details: { type: 'text', default: "''" },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.createIndex('kanban_activity', 'card_id', { ifNotExists: true });

  // ─── KANBAN TEMPLATES ──────────────────────────────────────────────────
  pgm.createTable('kanban_templates', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    name: { type: 'varchar(255)', notNull: true },
    fields: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    last_used_at: { type: 'timestamptz' },
  }, { ifNotExists: true });

  // ─── APP SETTINGS ──────────────────────────────────────────────────────
  pgm.createTable('app_settings', {
    key: { type: 'varchar(255)', primaryKey: true },
    value: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  // Seed default settings
  pgm.sql(`
    INSERT INTO app_settings (key, value)
    VALUES
      ('banned_ips', '[]'),
      ('meeting_hosts', '[]')
    ON CONFLICT (key) DO NOTHING
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const down = (pgm) => {
  pgm.dropTable('kanban_activity', { ifExists: true, cascade: true });
  pgm.dropTable('kanban_comments', { ifExists: true, cascade: true });
  pgm.dropTable('kanban_cards', { ifExists: true, cascade: true });
  pgm.dropTable('kanban_columns', { ifExists: true, cascade: true });
  pgm.dropTable('kanban_templates', { ifExists: true, cascade: true });
  pgm.dropTable('pending_payments', { ifExists: true, cascade: true });
  pgm.dropTable('finance_transactions', { ifExists: true, cascade: true });
  pgm.dropTable('user_balances', { ifExists: true, cascade: true });
  pgm.dropTable('custom_availability', { ifExists: true, cascade: true });
  pgm.dropTable('standard_availability', { ifExists: true, cascade: true });
  pgm.dropTable('contact_submissions', { ifExists: true, cascade: true });
  pgm.dropTable('reviews', { ifExists: true, cascade: true });
  pgm.dropTable('sent_messages', { ifExists: true, cascade: true });
  pgm.dropTable('messages', { ifExists: true, cascade: true });
  pgm.dropTable('app_settings', { ifExists: true, cascade: true });
  pgm.dropTable('users', { ifExists: true, cascade: true });
};
