import { Answer } from "../entity/Answer";

export interface IAnswerRepo {
    // Initialize a new Answer object
    initializeObj: (
        answer: string,
        isCorrect: boolean,
        questionId: number
    ) => Promise<Answer>;
}
