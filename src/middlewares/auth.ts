import { AuthenticationError } from "apollo-server";
import { MiddlewareFn } from "type-graphql";
import { decodeRefreshToken, decodeToken } from "../jwt/jwt";
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
        if (!context.headers.refreshtoken) throw error;
        context.user = decodeRefreshToken(context.headers.refreshtoken);
        return next();
    }
};
