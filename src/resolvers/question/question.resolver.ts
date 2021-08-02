import { Ctx, FieldResolver, Resolver, Root } from "type-graphql";
import { Question } from "../../entity/Question";

import { Answer } from "../../entity/Answer";
import { TContext } from "../../types/TContext";

@Resolver(Question)
export class QuestionResolver {
    @FieldResolver(() => [Answer])
    async answers(
        @Ctx() context: TContext,
        @Root() question: Question
    ): Promise<Answer[]> {
        try {
            const answers = await context.questionAnswersLoader.load(
                question.id
            );
            return answers;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @FieldResolver(() => Answer)
    async correctAnswer(
        @Ctx() context: TContext,
        @Root() question: Question
    ): Promise<Answer> {
        const correctAnswer = await context.questionCorrectAnswerLoader
            .load(question.id)
            .catch((error) => {
                console.log(error);
                throw new Error("Database Error");
            });
        return correctAnswer;
    }
}
