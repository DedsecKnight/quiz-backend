import { injectable } from "inversify";
import { Question } from "../entity/Question";
import { IQuestionRepo } from "../interfaces/IQuestionRepo";

@injectable()
export class QuestionRepo implements IQuestionRepo {
    initializeObj(question: string, quizId: number): Promise<Question> {
        return Question.create({ question, quizId }).save();
    }
    findAll(): Promise<Question[]> {
        return Question.find({
            relations: ["answers"],
        });
    }
    findByQuizId(quizId: number): Promise<Question[]> {
        return Question.find({
            quizId,
        });
    }
}
