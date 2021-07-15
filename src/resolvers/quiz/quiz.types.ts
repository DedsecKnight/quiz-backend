import { Field, ID, InputType } from "type-graphql";
import {
    IAnswerArgs,
    IQuestionArgs,
    IQuizArgs,
} from "../../interfaces/IQuizRepo";

@InputType()
class AnswerArgs implements IAnswerArgs {
    @Field()
    answer: string;

    @Field()
    isCorrect: boolean;
}

@InputType()
class QuestionArgs implements IQuestionArgs {
    @Field()
    question: string;

    @Field(() => [AnswerArgs])
    answers: AnswerArgs[];
}

@InputType()
export class QuizArgs implements IQuizArgs {
    userId: number;

    @Field()
    quizName: string;

    @Field(() => [QuestionArgs])
    questions: QuestionArgs[];

    @Field()
    category: string;

    @Field()
    difficulty: string;
}
