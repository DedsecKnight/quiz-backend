import { injectable } from "inversify";
import {
    Arg,
    Ctx,
    FieldResolver,
    Int,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from "type-graphql";
import { Mutation } from "type-graphql";
import { Submission } from "../../entity/Submission";

import { container } from "../../inversify.config";
import getDecorators from "inversify-inject-decorators";
import { TYPES } from "../../inversify.types";
import { ISubmissionRepo } from "../../interfaces/ISubmissionRepo";
import { ResourceNotFound } from "../../errors/ResourceNotFound";
import { Answer } from "../../entity/Answer";
import { TContext } from "../../types/TContext";
import { Quiz } from "../../entity/Quiz";
const { lazyInject } = getDecorators(container);
import { SubmitInput } from "./submission.types";
import { checkAuthorization } from "../../middlewares/auth";
import { IQuizRepo } from "../../interfaces/IQuizRepo";
import { UserInputError } from "apollo-server";

@injectable()
@Resolver(Submission)
export class SubmissionResolver {
    @lazyInject(TYPES.ISubmissionRepo) private _submissionRepo: ISubmissionRepo;
    @lazyInject(TYPES.IQuizRepo) private _quizRepo: IQuizRepo;

    @UseMiddleware(checkAuthorization)
    @Mutation(() => Submission)
    async submit(
        @Ctx() context: TContext,
        @Arg("submitInput") submissionArg: SubmitInput
    ): Promise<Submission> {
        const answersIsValid = await this._quizRepo
            .checkIfAnswersBelongToQuiz(
                submissionArg.answers,
                submissionArg.quizId.toString()
            )
            .catch((error) => {
                console.log(error);
                throw new Error("Database Error");
            });
        if (!answersIsValid) {
            throw new UserInputError("Invalid submission", {
                validationErrors: {
                    message: "At least 1 answer does not match quiz",
                },
            });
        }

        submissionArg.userId = context.user.id;
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
