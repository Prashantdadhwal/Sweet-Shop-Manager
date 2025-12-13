import { pgTable, text, varchar, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
});

export const sweets = pgTable("sweets", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull().default(0),
  imageUrl: text("image_url"),
  description: text("description"),
  adminId: varchar("admin_id", { length: 36 }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  role: true,
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]).default("user"),
});

export const insertSweetSchema = createInsertSchema(sweets).omit({
  id: true,
  adminId: true,
});

export const updateSweetSchema = insertSweetSchema.partial();

export const searchSweetsSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSweet = z.infer<typeof insertSweetSchema>;
export type Sweet = typeof sweets.$inferSelect;
export type SearchSweetsParams = z.infer<typeof searchSweetsSchema>;

export type AuthUser = Omit<User, "password">;
export type AuthResponse = {
  user: AuthUser;
  token: string;
};
