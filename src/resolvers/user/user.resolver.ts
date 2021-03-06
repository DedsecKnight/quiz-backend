import {
    Resolver,
    Query,
    Mutation,
    Arg,
    Ctx,
    UseMiddleware,
} from "type-graphql";
import { User } from "../../entity/User";
import { TYPES } from "../../inversify.types";
import { IUserRepo, AuthResponse, UserScore } from "../../interfaces/IUserRepo";
import { Submission } from "../../entity/Submission";
import { ISubmissionRepo } from "../../interfaces/ISubmissionRepo";

import getDecorators from "inversify-inject-decorators";
import { container } from "../../inversify.config";
import { checkAuthorization } from "../../middlewares/auth";
import { TContext } from "../../types/TContext";
const { lazyInject } = getDecorators(container);
import * as bcrypt from "bcrypt";

import { AuthenticationError, UserInputError } from "apollo-server-errors";
import { Quiz } from "../../entity/Quiz";
import { IQuizRepo } from "../../interfaces/IQuizRepo";
import { generateRefreshToken, generateToken } from "../../jwt/jwt";
import { CountData } from "../../interfaces/ICountData";
import {
    validateLoginInput,
    validateCredentialsInput,
} from "../../middlewares/validateAuthData";
import { INF, SALT_ROUND } from "./user.constants";

@Resolver(User)
export class UserResolver {
    @lazyInject(TYPES.IUserRepo) private _userRepo: IUserRepo;
    @lazyInject(TYPES.ISubmissionRepo) private _submissionRepo: ISubmissionRepo;
    @lazyInject(TYPES.IQuizRepo) private _quizRepo: IQuizRepo;

    @Query(() => [User])
    async users(): Promise<User[]> {
        const users = await this._userRepo.getAll().catch((error) => {
            console.log(error);
            throw new Error("Database Error");
        });
        return users;
    }

    @Mutation(() => AuthResponse)
    @UseMiddleware(validateLoginInput)
    async login(
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<AuthResponse> {
        const existingUser = await this._userRepo
            .findByEmail(email)
            .catch((error) => {
                console.log(error);
                throw new Error("Database Error");
            });

        if (!existingUser) throw new AuthenticationError("User does not exist");
        const checkValid = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!checkValid) throw new AuthenticationError("Invalid credentials");

        return {
            token: generateToken({
                id: existingUser.id,
            }),
            refreshToken: generateRefreshToken({
                id: existingUser.id,
            }),
        };
    }

    @Query(() => User)
    @UseMiddleware(checkAuthorization)
    async myInfo(@Ctx() context: TContext): Promise<User> {
        const user = await this._userRepo
            .findById(context.user.id)
            .catch((error) => {
                console.log(error);
                throw new Error("Database Error");
            });
        if (!user) throw new AuthenticationError("User Not Found");
        return user;
    }

    @Query(() => [Submission])
    @UseMiddleware(checkAuthorization)
    async mySubmissions(
        @Ctx() context: TContext,
        @Arg("limit", { nullable: true }) limit: number | undefined,
        @Arg("offset", { nullable: true }) offset: number | undefined
    ): Promise<Submission[]> {
        // If there is no offset, it is assumed that request wants to fetch
        // from the first entry
        if (offset === undefined) offset = 0;

        // If there is no limit, it is assumed that request wants to fetch
        // an infinite amount of entries
        if (limit === undefined) limit = INF;

        const submissions = await this._submissionRepo
            .getUserSubmissionsWithOffsetAndLimit(
                context.user.id,
                offset,
                limit
            )
            .catch((error) => {
                console.log(error);
                throw new Error("Database Error");
            });
        return submissions;
    }

    @Query(() => [Submission])
    @UseMiddleware(checkAuthorization)
    async myRecentSubmissionsLimit(
        @Ctx() context: TContext,
        @Arg("limit") limit: number
    ): Promise<Submission[]> {
        const submissions = await this._submissionRepo
            .getUserRecentSubmissions(context.user.id, limit)
            .catch((error) => {
                console.log(error);
                throw new Error("Database Error");
            });
        return submissions;
    }

    @Mutation(() => AuthResponse)
    @UseMiddleware(validateCredentialsInput)
    async registerUser(
        @Arg("name") name: string,
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<AuthResponse> {
        const existingUser = await this._userRepo
            .findByEmail(email)
            .catch((error) => {
                console.log(error);
                throw new Error("Database error");
            });

        if (existingUser)
            throw new UserInputError("Create user failed", {
                validationErrors: {
                    message: "User already exists",
                },
            });

        const hashedPassword = await bcrypt
            .hash(password, SALT_ROUND)
            .catch((error) => {
                console.log(error);
                throw new Error("Database Error");
            });

        const newUser = await this._userRepo
            .initializeObj(name, email, hashedPassword)
            .catch((error) => {
                console.log(error);
                throw new Error("Database Error");
            });

        return {
            token: generateToken({
                id: newUser.id,
            }),
            refreshToken: generateRefreshToken({
                id: newUser.id,
            }),
        };
    }

    @Query(() => [Quiz])
    @UseMiddleware(checkAuthorization)
    async myQuizzes(
        @Ctx() context: TContext,
        @Arg("offset", { nullable: true }) offset: number | undefined,
        @Arg("limit", { nullable: true }) limit: number | undefined
    ): Promise<Quiz[]> {
        if (offset === undefined) offset = 0;
        if (limit === undefined) limit = INF;

        const quizzes = this._quizRepo
            .findByAuthorWithLimitAndOffset(context.user.id, limit, offset)
            .catch((error) => {
                console.log(error);
                throw new Error("Database Error");
            });
        return quizzes;
    }

    @Mutation(() => User)
    @UseMiddleware(checkAuthorization, validateCredentialsInput)
    async updateProfile(
        @Ctx() context: TContext,
        @Arg("name") name: string,
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<User> {
        try {
            const user = await this._userRepo.findById(context.user.id);

            user.email = email;
            user.password = await bcrypt.hash(password, SALT_ROUND);
            user.name = name;

            // May need to change this to abide by SOLID rule
            await user.save();
            return user;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @Query(() => UserScore)
    @UseMiddleware(checkAuthorization)
    async myScore(@Ctx() context: TContext): Promise<UserScore> {
        try {
            const data = await this._userRepo.getScore(context.user.id);
            return data;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @Query(() => CountData)
    @UseMiddleware(checkAuthorization)
    async countMySubmissions(@Ctx() context: TContext): Promise<CountData> {
        const data = await this._submissionRepo
            .getUserSubmissionsCount(context.user.id)
            .catch((error) => {
                console.log(error);
                throw new Error("Database Error");
            });
        return data;
    }

    @Query(() => CountData)
    @UseMiddleware(checkAuthorization)
    async countMyQuizzes(@Ctx() context: TContext): Promise<CountData> {
        const data = await this._quizRepo
            .getUserQuizCount(context.user.id)
            .catch((error) => {
                console.log(error);
                throw new Error("Database Error");
            });
        return data;
    }
}
