import { injectable } from "inversify";
import { getConnection } from "typeorm";
import { Question } from "../entity/Question";
import { IQuestionRepo } from "../interfaces/IQuestionRepo";

@injectable()
export class QuestionRepo implements IQuestionRepo {
    initializeObj(question: string, quizId: number): Promise<Question> {
        return Question.create({ question, quizId }).save();
    }
    findAll(): Promise<Question[]> {
        return Question.find();
    }
    findByQuizId(quizId: number): Promise<Question[]> {
        return Question.find({
            quizId,
        });
    }
    findByIdsWithAnswers(ids: number[]): Promise<Question[]> {
        return Question.createQueryBuilder("question")
            .leftJoinAndSelect("question.answers", "answer")
            .where("question.id in (:...ids)", { ids })
            .getMany();
    }

    async initializeObjs(
        questions: Array<{ question: string; quizId: number }>
    ): Promise<number[]> {
        const data = await getConnection()
            .createQueryBuilder()
            .insert()
            .into(Question)
            .values(questions)
            .execute();
        return data.generatedMaps.map((obj) => parseInt(obj.id));
    }

    async removeByQuizIds(quizIds: number[]): Promise<void> {
        if (quizIds.length === 0) return;
        await Question.createQueryBuilder("question")
            .delete()
            .where("question.quizId in (:...ids)", { ids: quizIds })
            .execute();
    }
}
