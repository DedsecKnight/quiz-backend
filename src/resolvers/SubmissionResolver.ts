import { injectable } from "inversify";
import {
    Arg,
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
            throw new Error("Database Error: Cannot create Submission");
        }
    }

    @Query(() => Submission)
    async submissionById(@Arg("id") id: number): Promise<Submission> {
        try {
            const submission = await this._submissionRepo.findById(id);
            if (!submission)
                throw new ResourceNotFound("Submission does not exist");
            return submission;
        } catch (error) {
            if (error.message.indexOf("Submission does not exist") !== -1)
                throw error;
            else {
                console.log(error);
                throw new Error(
                    "Database Error: Cannot access Submission repository"
                );
            }
        }
    }

    @FieldResolver(() => Int)
    async score(@Root() submission: Submission): Promise<number> {
        try {
            return this._submissionRepo.getScore(submission.id);
        } catch (error) {
            console.log(error);
            throw new Error(
                "Database Error: Cannot access Submission repository"
            );
        }
    }
}
