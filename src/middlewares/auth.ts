import { AuthenticationError, UserInputError } from "apollo-server";
import { MiddlewareFn } from "type-graphql";
import { decodeRefreshToken, decodeToken } from "../jwt/jwt";
import { TContext } from "../types/TContext";
import { container } from "../inversify.config";
import { IUserRepo } from "../interfaces/IUserRepo";
import { TYPES } from "../types/types";

const TOKEN_BEGIN_INDEX = 7;

const checkIfUserExists = async (id: number): Promise<boolean> => {
    const userRepo = container.get<IUserRepo>(TYPES.IUserRepo);
    const userObj = await userRepo.findById(id);

    return !!userObj;
};

export const checkAuthorization: MiddlewareFn<TContext> = async (
    { context },
    next
) => {
    if (!context.headers.authorization)
        throw new AuthenticationError("Cannot find token");

    try {
        context.user = decodeToken(
            context.headers.authorization.substring(TOKEN_BEGIN_INDEX)
        );
        if (!checkIfUserExists(context.user.id))
            throw new UserInputError("Authorization failed", {
                validationErrors: {
                    message: "User does not exist",
                },
            });
        return next();
    } catch (error) {
        if (!context.headers.refreshtoken || error instanceof UserInputError)
            throw error;
        context.user = decodeRefreshToken(context.headers.refreshtoken);

        if (!checkIfUserExists(context.user.id))
            throw new UserInputError("Authorization failed", {
                validationErrors: {
                    message: "User does not exist",
                },
            });
        return next();
    }
};
