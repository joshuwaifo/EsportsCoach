import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { 
  pgTable, 
  varchar, 
  integer, 
  timestamp, 
  jsonb, 
  text,
  boolean
} from "drizzle-orm/pg-core";

// User profile schema
export const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(13, "Must be at least 13 years old").max(120),
  gender: z.enum(["Male", "Female", "Non-binary", "Prefer not to say"]),
  location: z.string().min(1, "Location is required"),
  email: z.string().email("Valid email is required"),
  inGameName: z.string().min(1, "In-game name is required"),
  currentRank: z.string().min(1, "Current rank/stats required"),
  gameCategory: z.enum(["moba", "fighting", "sport"]),
  trainingMode: z.enum(["live", "post"]),
  voicePreference: z.enum(["Professional Coach", "Friendly Mentor", "Competitive Analyst", "Text Only"]),
});

// Game session schema
export const gameSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  gameCategory: z.enum(["moba", "fighting", "sport"]),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().optional(),
  aiMessages: z.array(z.object({
    timestamp: z.string(),
    message: z.string(),
    followed: z.boolean().optional(),
  })),
  chatHistory: z.array(z.object({
    timestamp: z.string(),
    sender: z.enum(["user", "ai"]),
    message: z.string(),
  })),
  liveStats: z.object({
    accuracy: z.number(),
    apm: z.number(),
    score: z.number(),
  }),
  finalStats: z.object({
    overallScore: z.number(),
    attacking: z.number(),
    defending: z.number(),
    decisionMaking: z.number(),
    coachFollowing: z.number(),
  }).optional(),
});

// Key moment schema
export const keyMomentSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  timestamp: z.string(),
  type: z.enum(["goal", "defense", "missed_opportunity", "achievement"]),
  title: z.string(),
  description: z.string(),
  xpGained: z.number().optional(),
});

// Database Tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: varchar("username").unique().notNull(),
  email: varchar("email"),
  name: varchar("name"),
  profileData: jsonb("profile_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  gameCategory: varchar("game_category"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
  aiMessages: jsonb("ai_messages"),
  chatHistory: jsonb("chat_history"),
  liveStats: jsonb("live_stats"),
  finalStats: jsonb("final_stats"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const keyMomentsTable = pgTable("key_moments", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").references(() => gameSessions.id),
  timestamp: varchar("timestamp"),
  type: varchar("type"),
  title: varchar("title"),
  description: text("description"),
  xpGained: integer("xp_gained"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert and Select Types
export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertGameSessionSchema = createInsertSchema(gameSessions);
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSessionRecord = typeof gameSessions.$inferSelect;

export const insertKeyMomentSchema = createInsertSchema(keyMomentsTable);
export type InsertKeyMoment = z.infer<typeof insertKeyMomentSchema>;
export type KeyMomentRecord = typeof keyMomentsTable.$inferSelect;

// Frontend Types (for compatibility)
export type UserProfile = z.infer<typeof userProfileSchema>;
export type GameSession = z.infer<typeof gameSessionSchema>;
export type KeyMoment = z.infer<typeof keyMomentSchema>;
