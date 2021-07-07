import { injectable } from "inversify";
import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    ID,
    InputType,
    Int,
    Query,
    Resolver,
    Root,
} from "type-graphql";
import { Mutation } from "type-graphql";
import { Submission } from "../entity/Submission";

import { container } from "../inversify.config";
import getDecorators from "inversify-inject-decorators";
import { TYPES } from "../types/types";
import { ISubmissionRepo, SubmissionArg } from "../interfaces/ISubmissionRepo";
import { ResourceNotFound } from "../errors/ResourceNotFound";
import { Answer } from "../entity/Answer";
import { TContext } from "../types/TContext";
import { Quiz } from "../entity/Quiz";
const { lazyInject } = getDecorators(container);

@InputType()
class SubmitInput implements SubmissionArg {
    @Field(() => ID)
    userId: number;

    @Field(() => ID)
    quizId: number;

    @Field(() => [Int])
    answers: number[];
}

@injectable()
@Resolver(Submission)
export class SubmissionResolver {
    @lazyInject(TYPES.ISubmissionRepo) private _submissionRepo: ISubmissionRepo;

    @Mutation(() => Submission)
    async submit(
        @Arg("submitInput") submissionArg: SubmitInput
    ): Promise<Submission> {
        try {
            const newSubmission = await this._submissionRepo.createSubmission(
                submissionArg
            );
            return newSubmission;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @Query(() => Submission)
    async submissionById(@Arg("id") id: number): Promise<Submission> {
        const submission = await this._submissionRepo
            .findById(id)
            .catch((error) => {
                console.log(error);
                throw new Error("Database Error");
            });
        if (!submission)
            throw new ResourceNotFound("Submission does not exist");
        return submission;
    }

    @FieldResolver(() => Int)
    async score(
        @Ctx() context: TContext,
        @Root() submission: Submission
    ): Promise<number> {
        try {
            const score = await context.submissionScoreLoader.load(
                submission.id
            );
            return score;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @FieldResolver(() => [Answer])
    async answers(
        @Ctx() context: TContext,
        @Root() submission: Submission
    ): Promise<Answer[]> {
        try {
            const anss = context.submissionAnswersLoader.load(submission.id);
            return anss;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @FieldResolver(() => Quiz)
    async quiz(
        @Ctx() context: TContext,
        @Root() submission: Submission
    ): Promise<Quiz> {
        try {
            const quizObj = await context.quizLoader.load(submission.quizId);
            return quizObj;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }
}
