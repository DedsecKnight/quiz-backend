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

@injectable()
@Resolver(User)
export class UserResolver {
    @lazyInject(TYPES.IUserRepo) private _userRepo: IUserRepo;
    @lazyInject(TYPES.ISubmissionRepo) private _submissionRepo: ISubmissionRepo;

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
    async myInfo(
        @Arg("userId") userId: number,
        @Ctx() context: TContext
    ): Promise<User> {
        const user = await this._userRepo.findById(context.user.id);
        if (!user) throw new Error("User Not Found");
        return user;
    }

    @Query(() => [Submission])
    async mySubmissions(@Arg("userId") userId: number): Promise<Submission[]> {
        return this._submissionRepo.getUserSubmissions(userId);
    }

    @Mutation(() => AuthResponse)
    async registerUser(
        @Arg("name") name: string,
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<AuthResponse> {
        return this._userRepo.registerUser(name, email, password);
    }
}
