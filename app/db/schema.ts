import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const guestbook = pgTable("guestbook", {
  id: serial("id").primaryKey(),
  email: text("email"),
  body: text("body"),
  createdBy: text("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
})

export type SelectGuestbook = typeof guestbook.$inferSelect
export type InsertGuestbook = typeof guestbook.$inferInsert
