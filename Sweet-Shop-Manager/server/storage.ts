import { type User, type InsertUser, type Sweet, type InsertSweet, type SearchSweetsParams } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { id: string }): Promise<User>;
  
  getAllSweets(): Promise<Sweet[]>;
  getSweet(id: string): Promise<Sweet | undefined>;
  searchSweets(params: SearchSweetsParams): Promise<Sweet[]>;
  createSweet(sweet: InsertSweet & { id: string; adminId: string }): Promise<Sweet>;
  updateSweet(id: string, sweet: Partial<InsertSweet>): Promise<Sweet | undefined>;
  deleteSweet(id: string): Promise<boolean>;
  purchaseSweet(id: string): Promise<Sweet | undefined>;
  restockSweet(id: string, amount: number): Promise<Sweet | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sweets: Map<string, Sweet>;

  constructor() {
    this.users = new Map();
    this.sweets = new Map();
    this.seedData();
  }

  private seedData() {
    const adminId = randomUUID();
    const adminUser: User = {
      id: adminId,
      email: "admin@sweetshop.com",
      password: "$2a$10$XQxBtXWpQJxK.3PVZQ1J5.OMgVrZj1Kj5QKQZQJ5QKQZQJ5QKQZQ",
      role: "admin",
    };
    this.users.set(adminId, adminUser);

    const sampleSweets: Omit<Sweet, "id">[] = [
      {
        name: "Belgian Dark Chocolate Truffle",
        category: "chocolate",
        price: 12.99,
        quantity: 50,
        imageUrl: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&q=80",
        description: "Rich, velvety dark chocolate truffles made with premium Belgian cocoa",
        adminId,
      },
      {
        name: "Rainbow Lollipop Swirl",
        category: "candy",
        price: 3.99,
        quantity: 100,
        imageUrl: "https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=400&q=80",
        description: "Colorful handcrafted lollipops with a delightful fruity flavor",
        adminId,
      },
      {
        name: "Red Velvet Cupcake",
        category: "cake",
        price: 6.99,
        quantity: 30,
        imageUrl: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&q=80",
        description: "Moist red velvet cupcake topped with cream cheese frosting",
        adminId,
      },
      {
        name: "Classic Chocolate Chip Cookie",
        category: "cookie",
        price: 2.49,
        quantity: 75,
        imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80",
        description: "Freshly baked cookies loaded with premium chocolate chips",
        adminId,
      },
      {
        name: "French Butter Croissant",
        category: "pastry",
        price: 4.99,
        quantity: 25,
        imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80",
        description: "Flaky, buttery croissants made with authentic French technique",
        adminId,
      },
      {
        name: "Vanilla Bean Gelato",
        category: "ice_cream",
        price: 7.99,
        quantity: 40,
        imageUrl: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&q=80",
        description: "Creamy Italian gelato made with real Madagascar vanilla beans",
        adminId,
      },
      {
        name: "Salted Caramel Bonbon",
        category: "chocolate",
        price: 15.99,
        quantity: 35,
        imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80",
        description: "Luxurious salted caramel encased in smooth milk chocolate",
        adminId,
      },
      {
        name: "Strawberry Cheesecake Slice",
        category: "cake",
        price: 8.99,
        quantity: 20,
        imageUrl: "https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=400&q=80",
        description: "Creamy New York style cheesecake with fresh strawberry topping",
        adminId,
      },
    ];

    sampleSweets.forEach((sweet) => {
      const id = randomUUID();
      this.sweets.set(id, { ...sweet, id });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(user: InsertUser & { id: string }): Promise<User> {
    const newUser: User = { ...user, role: user.role || "user" };
    this.users.set(user.id, newUser);
    return newUser;
  }

  async getAllSweets(): Promise<Sweet[]> {
    return Array.from(this.sweets.values());
  }

  async getSweet(id: string): Promise<Sweet | undefined> {
    return this.sweets.get(id);
  }

  async searchSweets(params: SearchSweetsParams): Promise<Sweet[]> {
    let results = Array.from(this.sweets.values());

    if (params.name) {
      const searchTerm = params.name.toLowerCase();
      results = results.filter((s) => s.name.toLowerCase().includes(searchTerm));
    }

    if (params.category) {
      results = results.filter((s) => s.category === params.category);
    }

    if (params.minPrice !== undefined) {
      results = results.filter((s) => s.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      results = results.filter((s) => s.price <= params.maxPrice!);
    }

    return results;
  }

  async createSweet(sweet: InsertSweet & { id: string; adminId: string }): Promise<Sweet> {
    const newSweet: Sweet = {
      id: sweet.id,
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity ?? 0,
      imageUrl: sweet.imageUrl ?? null,
      description: sweet.description ?? null,
      adminId: sweet.adminId,
    };
    this.sweets.set(sweet.id, newSweet);
    return newSweet;
  }

  async updateSweet(id: string, updates: Partial<InsertSweet>): Promise<Sweet | undefined> {
    const existing = this.sweets.get(id);
    if (!existing) return undefined;

    const updated: Sweet = {
      ...existing,
      ...updates,
      id: existing.id,
      adminId: existing.adminId,
    };
    this.sweets.set(id, updated);
    return updated;
  }

  async deleteSweet(id: string): Promise<boolean> {
    return this.sweets.delete(id);
  }

  async purchaseSweet(id: string): Promise<Sweet | undefined> {
    const sweet = this.sweets.get(id);
    if (!sweet || sweet.quantity <= 0) return undefined;

    sweet.quantity -= 1;
    this.sweets.set(id, sweet);
    return sweet;
  }

  async restockSweet(id: string, amount: number): Promise<Sweet | undefined> {
    const sweet = this.sweets.get(id);
    if (!sweet) return undefined;

    sweet.quantity += amount;
    this.sweets.set(id, sweet);
    return sweet;
  }
}

export const storage = new MemStorage();
