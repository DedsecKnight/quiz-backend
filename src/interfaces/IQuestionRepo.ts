import { Question } from "../entity/Question";

export interface IQuestionRepo {
    initializeObj: (question: string, quizId: number) => Promise<Question>;
    findAll: () => Promise<Question[]>;
}
