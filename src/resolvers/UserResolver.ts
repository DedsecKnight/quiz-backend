import {
    Resolver,
    Query,
    Mutation,
    Arg,
    Ctx,
    UseMiddleware,
} from "type-graphql";
import { User } from "../entity/User";
import { injectable } from "inversify";
import { TYPES } from "../types/types";
import { IUserRepo, AuthResponse, UserScore } from "../interfaces/IUserRepo";
import { Submission } from "../entity/Submission";
import { ISubmissionRepo } from "../interfaces/ISubmissionRepo";

import getDecorators from "inversify-inject-decorators";
import { container } from "../inversify.config";
import { checkAuthorization } from "../middlewares/auth";
import { TContext } from "../types/TContext";
const { lazyInject } = getDecorators(container);
import * as bcrypt from "bcrypt";

import { AuthenticationError, UserInputError } from "apollo-server-errors";
import { Quiz } from "../entity/Quiz";
import { IQuizRepo } from "../interfaces/IQuizRepo";
import { generateRefreshToken, generateToken } from "../jwt/jwt";
import { CountData } from "../interfaces/ICountData";
import {
    validateLoginInput,
    validateCredentialsInput,
} from "../middlewares/validateAuthData";

@injectable()
@Resolver(User)
export class UserResolver {
    @lazyInject(TYPES.IUserRepo) private _userRepo: IUserRepo;
    @lazyInject(TYPES.ISubmissionRepo) private _submissionRepo: ISubmissionRepo;
    @lazyInject(TYPES.IQuizRepo) private _quizRepo: IQuizRepo;

    @Query(() => [User])
    async users(): Promise<User[]> {
        try {
            const users = await this._userRepo.getAll();
            return users;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
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
            statusCode: 200,
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
    async mySubmissions(@Ctx() context: TContext): Promise<Submission[]> {
        const submissions = await this._submissionRepo
            .getUserSubmissions(context.user.id)
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
                    message: "User already exist",
                },
            });

        const hashedPassword = await bcrypt
            .hash(password, 10)
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
            statusCode: 200,
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
    async myQuizzes(@Ctx() context: TContext): Promise<Quiz[]> {
        const quizzes = this._quizRepo
            .findByAuthor(context.user.id)
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
            user.password = await bcrypt.hash(password, 10);
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
            return {
                maxScore: data[0].maxScore || 0,
                totalScore: data[0].totalScore || 0,
            };
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
