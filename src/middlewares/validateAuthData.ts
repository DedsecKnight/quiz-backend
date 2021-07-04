import validator from "validator";
import { MiddlewareFn } from "type-graphql";
import { UserInputError } from "apollo-server-errors";

interface CredentialsInputValidationErrorSchema {
    email?: string;
    password?: string;
}

export const validateLoginInput: MiddlewareFn = async ({ args }, next) => {
    const validationErrors: CredentialsInputValidationErrorSchema = {};

    if (!validator.isEmail(args.email)) {
        validationErrors.email = "Invalid email format";
    }

    if (Object.keys(validationErrors).length > 0) {
        throw new UserInputError("Login failed due to validation errors", {
            validationErrors,
        });
    }

    return next();
};

export const validateCredentialsInput: MiddlewareFn = async (
    { args },
    next
) => {
    const validationErrors: CredentialsInputValidationErrorSchema = {};

    if (!validator.isEmail(args.email)) {
        validationErrors.email = "Invalid email format";
    }
    if (
        !validator.isLength(args.password, {
            min: 8,
        })
    ) {
        validationErrors.password =
            "Password has to have at least 8 characters";
    }

    if (Object.keys(validationErrors).length > 0) {
        throw new UserInputError("Credentials validation failed", {
            validationErrors,
        });
    }

    return next();
};
