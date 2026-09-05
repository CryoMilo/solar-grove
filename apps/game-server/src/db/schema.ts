import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const farms = pgTable('farms', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  name: text('name').notNull(),
  gold: integer('gold').default(0).notNull(),
  power: integer('power').default(100).notNull(),
  water: integer('water').default(100).notNull(),
  storage: integer('storage').default(0).notNull(),
  maxStorage: integer('max_storage').default(100).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const buildings = pgTable('buildings', {
  id: uuid('id').defaultRandom().primaryKey(),
  farmId: uuid('farm_id')
    .references(() => farms.id)
    .notNull(),
  type: text('type').notNull(),
  x: integer('x').notNull(),
  y: integer('y').notNull(),
  status: text('status').default('offline').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const crops = pgTable('crops', {
  id: uuid('id').defaultRandom().primaryKey(),
  farmId: uuid('farm_id')
    .references(() => farms.id)
    .notNull(),
  cropType: text('crop_type').notNull(),
  x: integer('x').notNull(),
  y: integer('y').notNull(),
  stage: text('stage').default('seed').notNull(),
  growthProgress: integer('growth_progress').default(0).notNull(),
  plantedAt: timestamp('planted_at').defaultNow().notNull(),
});

export const playerCompetencies = pgTable('player_competencies', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  competencyId: text('competency_id').notNull(),
  status: text('status').notNull(),
  masteredAt: timestamp('mastered_at'),
});
