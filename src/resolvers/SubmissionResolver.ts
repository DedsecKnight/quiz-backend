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
import { Answer } from "../entity/Answer";
import { Submission } from "../entity/Submission";

@InputType()
class SubmitInput {
    @Field(() => ID)
    userId: number;

    @Field(() => ID)
    quizId: number;

    @Field(() => [Int])
    answers: number[];
}

@Resolver(Submission)
export class SubmissionResolver {
    @Mutation(() => Submission)
    async submit(
        @Arg("submitInput") { quizId, answers, userId }: SubmitInput
    ): Promise<Submission> {
        const newSubmission = await Submission.create({
            userId,
            quizId,
        }).save();
        answers.forEach(async (answerId) => {
            const fetchedAnswer = await Answer.findOne({
                id: answerId,
            });
            await Submission.createQueryBuilder()
                .relation(Submission, "answers")
                .of(newSubmission)
                .add(fetchedAnswer);
        });
        return Submission.findOne(
            {
                id: newSubmission.id,
            },
            {
                relations: ["answers"],
            }
        );
    }

    @Query(() => Submission)
    async submissionById(@Arg("id") id: number): Promise<Submission | null> {
        const submissionObj = await Submission.findOne(
            {
                id,
            },
            {
                relations: ["answers", "answers.submissions"],
            }
        );
        if (!submissionObj) return null;
        return submissionObj;
    }

    @FieldResolver(() => Int)
    async score(@Root() submission: Submission): Promise<number> {
        const subObj = await Submission.findOne(
            {
                id: submission.id,
            },
            {
                relations: ["answers"],
            }
        );
        return Math.floor(
            (subObj.answers.filter((answer) => answer.isCorrect).length * 100) /
                subObj.answers.length
        );
    }
}
