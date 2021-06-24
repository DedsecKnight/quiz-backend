import {
    Resolver,
    Query,
    Mutation,
    Arg,
    InputType,
    Ctx,
    UseMiddleware,
} from "type-graphql";
import { User } from "../entity/User";
import { injectable } from "inversify";
import { TYPES } from "../types/types";
import { IUserRepo, AuthResponse } from "../interfaces/IUserRepo";
import { Submission } from "../entity/Submission";
import { ISubmissionRepo } from "../interfaces/ISubmissionRepo";

import getDecorators from "inversify-inject-decorators";
import { container } from "../inversify.config";
import { checkAuthorization } from "../middlewares/auth";
import { TContext } from "../types/TContext";
const { lazyInject } = getDecorators(container);

import { UserInputError } from "apollo-server-errors";
import { Quiz } from "../entity/Quiz";
import { IQuizRepo } from "../interfaces/IQuizRepo";

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
        return this._userRepo.loginUser(email, password);
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

    @Mutation(() => AuthResponse)
    async registerUser(
        @Arg("name") name: string,
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<AuthResponse> {
        return this._userRepo.registerUser(name, email, password);
    }

    @Query(() => [Quiz])
    @UseMiddleware(checkAuthorization)
    async myQuizzes(@Ctx() context: TContext): Promise<Quiz[]> {
        return this._quizRepo.findByAuthor(context.user.id);
    }
}
