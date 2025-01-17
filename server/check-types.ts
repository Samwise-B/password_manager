import "express-session";

declare module "express-session" {
    interface SessionData {
        userId?: string;
    }
}

console.log("Type declaration loaded successfully.");