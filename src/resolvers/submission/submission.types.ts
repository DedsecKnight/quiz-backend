import { Field, ID, InputType, Int } from "type-graphql";
import { SubmissionArg } from "../../interfaces/ISubmissionRepo";

@InputType()
export class SubmitInput implements SubmissionArg {
    @Field(() => ID)
    userId: number;

    @Field(() => ID)
    quizId: number;

    @Field(() => [Int])
    answers: number[];
}
