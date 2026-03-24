import {
  boolean,
  foreignKey,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const guestbook = pgTable('guestbook', {
  id: serial('id').primaryKey(),
  email: text('email'),
  body: text('body'),
  createdBy: text('createdBy'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  isPinned: boolean('isPinned').default(false).notNull(),
  commentsClosed: boolean('commentsClosed').default(false).notNull(),
});

export type SelectGuestbook = typeof guestbook.$inferSelect;
export type InsertGuestbook = typeof guestbook.$inferInsert;

export const channelMessages = guestbook;
export type SelectChannelMessage = SelectGuestbook;
export type InsertChannelMessage = InsertGuestbook;

export const channelComments = pgTable(
  'channelComments',
  {
    id: serial('id').primaryKey(),
    messageId: integer('messageId')
      .notNull()
      .references(() => guestbook.id, { onDelete: 'cascade' }),
    parentId: integer('parentId'),
    email: text('email'),
    body: text('body'),
    createdBy: text('createdBy'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    parentFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }).onDelete('cascade'),
  }),
);

export type SelectChannelComment = typeof channelComments.$inferSelect;
export type InsertChannelComment = typeof channelComments.$inferInsert;

export const channelReactions = pgTable('channelReactions', {
  id: serial('id').primaryKey(),
  messageId: integer('messageId')
    .notNull()
    .references(() => guestbook.id, { onDelete: 'cascade' }),
  commentId: integer('commentId').references(() => channelComments.id, { onDelete: 'cascade' }),
  emoji: text('emoji').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type SelectChannelReaction = typeof channelReactions.$inferSelect;
export type InsertChannelReaction = typeof channelReactions.$inferInsert;

export const experience = pgTable('experience', {
  id: serial('id').primaryKey(),
  workType: text('workType').notNull().default('company'),
  companyName: text('companyName'),
  companyUrl: text('companyUrl'),
  position: text('position'),
  description: text('description'),
  targetTask: text('targetTask'),
  stack: text('stack'),
  joinedAt: timestamp('joinedAt'),
  leftAt: timestamp('leftAt'),
});

export type SelectExperience = typeof experience.$inferSelect;
export type InsertExperience = typeof experience.$inferInsert;
