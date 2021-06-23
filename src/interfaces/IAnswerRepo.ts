import { Answer } from "../entity/Answer";

export interface IAnswerRepo {
    initializeObj: (
        answer: string,
        isCorrect: boolean,
        questionId: number
    ) => Promise<Answer>;
}
