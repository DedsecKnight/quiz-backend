import { MiddlewareFn } from "type-graphql";
import { TContext } from "../types/TContext";

export const checkAuthorization: MiddlewareFn<TContext> = async (
    { context },
    next
) => {
    return next();
};
