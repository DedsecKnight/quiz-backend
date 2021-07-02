import validator from "validator";
import { MiddlewareFn } from "type-graphql";
import { UserInputError } from "apollo-server-errors";

export const validateLoginInput: MiddlewareFn = async ({ args }, next) => {
    if (!validator.isEmail(args.email))
        throw new UserInputError("Invalid email");
    return next();
};

export const validateRegisterInput: MiddlewareFn = async ({ args }, next) => {
    if (!validator.isEmail(args.email))
        throw new UserInputError("Invalid email");
    if (
        !validator.isStrongPassword(args.password, {
            minLength: 8,
            minNumbers: 1,
        })
    )
        throw new UserInputError(
            "Password has to have at least 8 characters, 1 of which is a number"
        );
    return next();
};
