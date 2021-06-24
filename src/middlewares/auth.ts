import { AuthenticationError } from "apollo-server";
import { MiddlewareFn } from "type-graphql";
import { decodeToken } from "../jwt/jwt";
import { TContext } from "../types/TContext";

export const checkAuthorization: MiddlewareFn<TContext> = async (
    { context },
    next
) => {
    if (!context.headers.authorization)
        throw new AuthenticationError("Cannot find token");

    try {
        context.user = decodeToken(context.headers.authorization.substring(7));
        return next();
    } catch (error) {
        throw error;
    }
};
