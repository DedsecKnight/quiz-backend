import { MiddlewareFn } from "type-graphql";
import { TContext } from "../types/TContext";

export const checkAuthorization: MiddlewareFn<TContext> = async (
    { context },
    next
) => {
    context.user = {
        id: 18,
    };
    return next();
};
