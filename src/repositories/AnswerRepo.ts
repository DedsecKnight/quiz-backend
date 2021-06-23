import { injectable } from "inversify";
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
}
