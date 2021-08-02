import { injectable } from "inversify";
import { getConnection } from "typeorm";
import { Answer } from "../entity/Answer";
import { IAnswerRepo } from "../interfaces/IAnswerRepo";

@injectable()
export class AnswerRepo implements IAnswerRepo {
    async initializeObj(
        answer: string,
        isCorrect: boolean,
        questionId: number
    ): Promise<Answer> {
        return Answer.create({ answer, isCorrect, questionId }).save();
    }

    async mapAnswerToQuiz(answerIds: number[]): Promise<number[]> {
        const data: Array<{ quiz_id: number }> =
            await Answer.createQueryBuilder("answer")
                .innerJoin("answer.question", "question")
                .innerJoin("question.quiz", "quiz")
                .where("answer.id in (:...ids)", { ids: answerIds })
                .select("quiz.id")
                .getRawMany();
        return data.map((obj) => obj.quiz_id);
    }

    async initializeObjs(
        answers: Array<{
            answer: string;
            isCorrect: boolean;
            questionId: number;
        }>
    ): Promise<number[]> {
        const data = await getConnection()
            .createQueryBuilder()
            .insert()
            .into(Answer)
            .values(answers)
            .execute();

        return data.generatedMaps.map((obj) => parseInt(obj.id));
    }
}
