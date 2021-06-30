import * as jwt from "jsonwebtoken";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "./secret";
import { UserData } from "../types/TContext";
import { AuthenticationError } from "apollo-server-errors";

export const generateToken = (data: UserData): string => {
    return jwt.sign(data, JWT_SECRET, {
        expiresIn: "1m",
    });
};

export const generateRefreshToken = (data: UserData): string => {
    return jwt.sign(data, JWT_REFRESH_SECRET, {
        expiresIn: "24h",
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

export const decodeRefreshToken = (token: string): UserData => {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as UserData;
        return decoded;
    } catch (error) {
        throw new AuthenticationError("Invalid token");
    }
};
