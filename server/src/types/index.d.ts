import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string; // Or another suitable type like `number` if you're using numeric IDs
  }
}