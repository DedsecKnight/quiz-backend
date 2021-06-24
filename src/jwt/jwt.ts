import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "./secret";
import { UserData } from "../types/TContext";
import { AuthenticationError } from "apollo-server-errors";

export const generateToken = (data: UserData): string => {
    return jwt.sign(data, JWT_SECRET, {
        expiresIn: "1h",
    });
};

export const decodeToken = (token: string): UserData => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as UserData;
        return decoded;
    } catch (error) {
        throw new AuthenticationError("Invalid token");
    }
};
