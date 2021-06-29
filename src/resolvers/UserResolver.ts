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
import { ResourceNotFound } from "../errors/ResourceNotFound";
import { generateToken } from "../jwt/jwt";

@injectable()
@Resolver(User)
export class UserResolver {
    @lazyInject(TYPES.IUserRepo) private _userRepo: IUserRepo;
    @lazyInject(TYPES.ISubmissionRepo) private _submissionRepo: ISubmissionRepo;
    @lazyInject(TYPES.IQuizRepo) private _quizRepo: IQuizRepo;

    @Query(() => [User])
    async users(): Promise<User[]> {
        return this._userRepo.getAll();
    }

    @Mutation(() => AuthResponse)
    async login(
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<AuthResponse> {
        const existingUser = await this._userRepo.findByEmail(email);
        if (!existingUser) throw new ResourceNotFound("User does not exist");

        try {
            const checkValid = await bcrypt.compare(
                password,
                existingUser.password
            );

            if (!checkValid)
                throw new AuthenticationError("Invalid credentials");

            return {
                statusCode: 200,
                token: generateToken({
                    id: existingUser.id,
                }),
            };
        } catch (error) {
            console.log(error);
        }
    }

    @Query(() => User)
    @UseMiddleware(checkAuthorization)
    async myInfo(@Ctx() context: TContext): Promise<User> {
        const user = await this._userRepo.findById(context.user.id);
        if (!user) throw new UserInputError("User Not Found");
        return user;
    }

    @Query(() => [Submission])
    @UseMiddleware(checkAuthorization)
    async mySubmissions(@Ctx() context: TContext): Promise<Submission[]> {
        return this._submissionRepo.getUserSubmissions(context.user.id);
    }

    @Query(() => [Submission])
    @UseMiddleware(checkAuthorization)
    async myRecentSubmissionsLimit(
        @Ctx() context: TContext,
        @Arg("limit") limit: number
    ): Promise<Submission[]> {
        return this._submissionRepo.getUserRecentSubmissions(
            context.user.id,
            limit
        );
    }

    @Mutation(() => AuthResponse)
    async registerUser(
        @Arg("name") name: string,
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<AuthResponse> {
        const existingUser = await this._userRepo.findByEmail(email);
        if (existingUser) throw new UserInputError("User already exist");

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await this._userRepo.initializeObj(
                name,
                email,
                hashedPassword
            );

            return {
                statusCode: 200,
                token: generateToken({
                    id: newUser.id,
                }),
            };
        } catch (error) {
            console.log(error.message);
        }
    }

    @Query(() => [Quiz])
    @UseMiddleware(checkAuthorization)
    async myQuizzes(@Ctx() context: TContext): Promise<Quiz[]> {
        return this._quizRepo.findByAuthor(context.user.id);
    }

    @Mutation(() => User)
    @UseMiddleware(checkAuthorization)
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
        }
    }

    @Query(() => UserScore)
    @UseMiddleware(checkAuthorization)
    async myScore(@Ctx() context: TContext): Promise<UserScore> {
        try {
            const data = await this._userRepo.getScore(context.user.id);
            return data[0];
        } catch (error) {
            console.log(error);
        }
    }
}
