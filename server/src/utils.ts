import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import dotenv from "dotenv";
import { error } from "console";

dotenv.config();

interface AuthenticatedRequest extends Request {
    user?: string | JwtPayload;
}

export async function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({error: "User must be authorized (via Login)"});
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
        if (err) {
            return res.status(401).send({error: "Invalid token"});
        }

        req.user = decoded;
        next();
    })
}