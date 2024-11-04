import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import dotenv from "dotenv";
import { error } from "console";

dotenv.config();

export interface AuthenticatedRequest extends Request {
    user?: string | JwtPayload;
}

// export async function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//     const token = req.headers['authorization'];
//     console.log(req.headers);

//     if (!token) {
//         return res.status(403).send({error: "User must be authorized (via Login)"});
//     }

//     jwt.verify(token, process.env.JWT_SECRET as string, (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
//         if (err) {
//             return res.status(401).send({error: "Invalid token"});
//         }

//         const decodedToken = decoded as JwtPayload;
//         req.user = decodedToken.userId;
//         next();
//     })
// }

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.session.userId) {
        next(); // User is authenticated, proceed to the route
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
}

export function getEnvVariable(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
  }