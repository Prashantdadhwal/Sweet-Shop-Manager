import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { registerUserSchema, loginUserSchema, insertSweetSchema, updateSweetSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.SESSION_SECRET || "sweet-shop-secret-key-2024";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

interface AuthRequest extends Request {
  user?: JWTPayload;
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const id = randomUUID();
      
      const user = await storage.createUser({
        id,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role || "user",
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/sweets", async (_req: Request, res: Response) => {
    try {
      const sweets = await storage.getAllSweets();
      res.json(sweets);
    } catch {
      res.status(500).json({ message: "Failed to fetch sweets" });
    }
  });

  app.get("/api/sweets/search", async (req: Request, res: Response) => {
    try {
      const params = {
        name: req.query.name as string | undefined,
        category: req.query.category as string | undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      };
      
      const sweets = await storage.searchSweets(params);
      res.json(sweets);
    } catch {
      res.status(500).json({ message: "Search failed" });
    }
  });

  app.post("/api/sweets", authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertSweetSchema.parse(req.body);
      
      const sweet = await storage.createSweet({
        ...validatedData,
        id: randomUUID(),
        adminId: req.user!.userId,
      });

      res.status(201).json(sweet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      res.status(500).json({ message: "Failed to create sweet" });
    }
  });

  app.put("/api/sweets/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updateSweetSchema.parse(req.body);
      
      const sweet = await storage.updateSweet(id, validatedData);
      if (!sweet) {
        return res.status(404).json({ message: "Sweet not found" });
      }

      res.json(sweet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      res.status(500).json({ message: "Failed to update sweet" });
    }
  });

  app.delete("/api/sweets/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const deleted = await storage.deleteSweet(id);
      if (!deleted) {
        return res.status(404).json({ message: "Sweet not found" });
      }

      res.json({ message: "Sweet deleted successfully" });
    } catch {
      res.status(500).json({ message: "Failed to delete sweet" });
    }
  });

  app.post("/api/sweets/:id/purchase", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const sweet = await storage.getSweet(id);
      if (!sweet) {
        return res.status(404).json({ message: "Sweet not found" });
      }

      if (sweet.quantity <= 0) {
        return res.status(400).json({ message: "Sweet is out of stock" });
      }

      const updatedSweet = await storage.purchaseSweet(id);
      res.json(updatedSweet);
    } catch {
      res.status(500).json({ message: "Purchase failed" });
    }
  });

  app.post("/api/sweets/:id/restock", authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      if (!amount || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ message: "Invalid restock amount" });
      }

      const sweet = await storage.getSweet(id);
      if (!sweet) {
        return res.status(404).json({ message: "Sweet not found" });
      }

      const updatedSweet = await storage.restockSweet(id, amount);
      res.json(updatedSweet);
    } catch {
      res.status(500).json({ message: "Restock failed" });
    }
  });

  return httpServer;
}
